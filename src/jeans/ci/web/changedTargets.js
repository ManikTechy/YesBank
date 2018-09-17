"use strict";

const fs = require("fs");
const path = require("path");
const git = require("simple-git")();
const services = require("../../bin/getServices");
const config = require("../../bin/config");

const folderPath = (string, delimiter) => {
  return string
    .split(delimiter)
    .slice(0, -1)
    .join(delimiter);
};

/**
 * @currentDirPath - Path to a folder to check for .jeans.js
 * @callback - function to call when .jeans.js is found
 * This walks through the folder that get's passed in recursively and
 * checks if there is a .jeans.js file present.
 * If so it returns the full filepath.
 */
const walkSync = (currentDirPath, callback) => {
  fs.readdirSync(currentDirPath).forEach(name => {
    // We don't want to look for dependencies files in node_modules
    if (name === "node_modules") {
      return;
    }
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && filePath.indexOf(".jeans.js") > -1) {
      callback(filePath, stat);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
};

/**
 * Search the whole project for all .jeans.js and creates a full map
 * of all dependencies in the project.
 * Example output
 * {
 *   "src/booking/server/.jeans.js": [
 *     'lodash',
 *     'express',
 *     'src/shared/server',
 *   ]
 * }
 */
const findAllDepenedenciesFiles = () => {
  const dependencyMap = {};
  walkSync("./", filePath => {
    const { packages } = require(`${process.cwd()}/${filePath}`);
    if (packages) {
      dependencyMap[folderPath(filePath, "/")] = packages;
    }
  });
  return dependencyMap;
};

/**
 * Check if a filepath is part of some services dependency list.
 * For example check if src/shared/server is a part of src/booking/server
 * dependency list.
 */
const searchDependencies = (filePath, dependencyMap, cb) => {
  Object.keys(dependencyMap).forEach(key => {
    if (dependencyMap[key].indexOf(filePath) > -1) {
      cb(key);
    }
  });
};

/**
 * @files - List of all files that should be checked for in dependency map.
 * Typically this would be all the files that have changed in the current commit.
 * @packages - list of all packages that have changed in the current commit.
 *
 * This function is threefold. It starts off by fetching the
 * dependency map for the full project. Then it goes through the full
 * list of files that have changed and checks for three things.
 *
 * 1. If this file is a part of a service. For example: We have a folder
 * in the PROJECT_ROOT/services folder named ServiceA and if a file has
 * changed with the name src/ServiceA/someFileName we know that file
 * is part of ServiceA and should therefor be added to a list of changed services.
 *
 * 2. If the file is `package.json` we go through the list of packages
 * sent into the function and find all services that depend on that specific
 * package. If we find one, we add that service to the list of changed services.
 *
 * 3. If it's not `package.json` we check if any service is depending explicitly
 * on this file. For example if this is a shared module, we check what
 * services depend on this shared module and add those services to the list
 * of changed services.
 */
const resolveDependants = (files, packages, options) => {
  const dependencyMap = findAllDepenedenciesFiles();
  let changedServices = new Set();
  let alreadyVisitedFiles = new Set();
  files.forEach(file => {
    const partOfService = services(options).filter(
      service =>
        Boolean(file.indexOf(`${config.srcFolder}/${service}/`) === 0) ||
        Boolean(file.indexOf(`${config.servicesFolder}/${service}/`) === 0)
    )[0];
    if (partOfService) {
      changedServices = changedServices.add(partOfService);
    }
    if (file === "package.json") {
      packages.forEach(changedPackage => {
        searchDependencies(changedPackage, dependencyMap, key => {
          const maybeService = services(options).filter(
            service => key.indexOf(`${config.srcFolder}/${service}/`) === 0
          )[0];
          if (maybeService) {
            changedServices = changedServices.add(maybeService);
            resolveDependants([key], packages, options);
          }
        });
      });
    } else {
      const pathToFile = folderPath(file, "/");
      searchDependencies(pathToFile, dependencyMap, key => {
        const maybeService = services(options).filter(
          service => key.indexOf(`${config.srcFolder}/${service}/`) === 0
        )[0];
        if (maybeService) {
          changedServices = changedServices.add(maybeService);
          if (alreadyVisitedFiles.has(key) === -1) {
            resolveDependants([key], packages, options);
          }
          alreadyVisitedFiles = alreadyVisitedFiles.add(key);
        }
      });
    }
  });
  return changedServices;
};

/**
 * @commitToCompare - commit to compare the current state of the codebase to.
 * @cb - callback function for results when all the parsing is done.

 * This does a diff between the commitToCompare and the current commit.
 * It gets a list of all files that have changed and passes it down to
 * the resolve dependants function.
 * Before it does so it starts by checking if `package.json` has changed
 * between the two commits and if so it checks which lines.
 * If the lines that have changed are part of the dependencies or
 * devDependencies it will fetch those lines and save the packages that
 * have changed and send it down to the resolve dependants function as well.
 */
const run = (commitToCompare, options, cb) => {
  // eslint-disable-line
  git.revparse([commitToCompare, "origin/master"], () => {
    // eslint-disable-line
    /**
     * This is done because we need to run the diff with HEAD on branches to get the
     * changed targets on the PR, but with the correct commit on merges
     * to make sure it does the proper diff for changed services.
     */
    git.revparse(["--abbrev-ref", "HEAD"], () => {
      // eslint-disable-line
      git.diffSummary(
        ["--stat-width=10000", "HEAD", commitToCompare],
        (error, data) => {
          if (error) {
            process.exit(1);
            return;
          }
          const changedFiles = data.files.map(summary => summary.file);
          let changedServices;

          if (changedFiles.indexOf("package.json") > -1) {
            const packagesFile = fs.readFileSync("package.json", "utf8");
            const packageJSON = JSON.parse(packagesFile);
            const dependencies = Object.keys(packageJSON.dependencies);
            const devDependencies = Object.keys(packageJSON.devDependencies);
            git.diff(
              [commitToCompare, "package.json"],
              (gitDiffError, summary) => {
                const diffs = summary.split("\n");
                const changes = diffs
                  .filter(change => {
                    return (
                      (change.indexOf(":") > -1 && change.startsWith("+ ")) ||
                      change.startsWith("- ")
                    );
                  })
                  .map(change => {
                    return change
                      .replace("-    ", "")
                      .replace("+    ", "")
                      .split('"')
                      .join("")
                      .split(":")[0];
                  });
                const changedLines = [...new Set(changes)];
                const changedDevDependencies = changedLines.filter(change => {
                  return devDependencies.indexOf(change) > -1;
                });
                if (changedDevDependencies.length > 0) {
                  cb(services(options));
                } else {
                  const packages = changedLines.filter(change => {
                    return dependencies.indexOf(change) > -1;
                  });
                  changedServices = resolveDependants(
                    changedFiles,
                    packages,
                    options
                  );
                  cb(changedServices);
                }
              }
            );
          } else {
            changedServices = resolveDependants(changedFiles, [], options);
            cb(changedServices);
          }
        }
      );
    });
  });
};

module.exports = run;
