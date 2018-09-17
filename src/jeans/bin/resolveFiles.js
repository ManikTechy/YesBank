const fs = require("fs");
const path = require("path");
const config = require("./config");

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

const deduplicateArray = resolvedDependencies =>
  resolvedDependencies.filter((item, i, ar) => ar.indexOf(item) === i);

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
const findAllDepenedenciesFiles = service => {
  const dependencyMap = {};
  walkSync(service, filePath => {
    const { packages } = require(`${process.cwd()}/${filePath}`);
    if (packages) {
      dependencyMap[folderPath(filePath, "/")] = packages;
    }
  });
  return dependencyMap;
};

const flattenArray = array => [].concat.apply([], array);

const resolveDependencies = (dependencies, alreadyVisitedFiles) => {
  const resolvedDependencies = dependencies.map(dependency => {
    if (dependency.split("/").length > 1) {
      try {
        const filePath = path.join(process.cwd(), dependency, ".jeans.js");
        const sharedModule = require(filePath);
        if (alreadyVisitedFiles.indexOf(filePath) === -1) {
          const moduleDependencies = resolveDependencies(
            sharedModule.packages,
            alreadyVisitedFiles.concat([filePath])
          );
          return [].concat.apply([dependency], moduleDependencies);
        }
        return [];
      } catch (err) {
        console.log(err);
        return dependency;
      }
    }
    return [];
  });

  // Flatten the array of dependencies
  return flattenArray(resolvedDependencies);
};

const resolveFolders = service => {
  const dependencyMap = findAllDepenedenciesFiles(
    `${config.srcFolder}/${service}`
  );
  const resolvedFiles = Object.keys(dependencyMap).map(file => {
    const dependencies = dependencyMap[file];
    return resolveDependencies(dependencies, []);
  });
  // Flatten the array of dependencyMap
  return flattenArray(resolvedFiles);
};

const findFilesInFolder = folder => {
  return fs.readdirSync(folder).reduce((acc, currentFile) => {
    const fullPath = path.join(process.cwd(), folder, currentFile);
    const relativePath = path.join(folder, currentFile);
    try {
      const element = fs.statSync(fullPath);
      if (element.isFile()) {
        return acc.concat([relativePath]);
      }
      return acc;
    } catch (e) {
      console.log(e);
      return acc;
    }
  }, []);
};

const removeBlackListedPatterns = (files, blackListedPatterns) => {
  return files.filter(_ =>
    blackListedPatterns.some(pattern => _.indexOf(pattern) === -1)
  );
};

const resolveFiles = (service, blackListedPatterns, cb) => {
  const folders = resolveFolders(service);
  const filesInFolders = removeBlackListedPatterns(
    deduplicateArray(
      flattenArray(
        folders
          .map(findFilesInFolder)
          .concat(findFilesInFolder(`${config.srcFolder}/${service}`))
      )
    ),
    blackListedPatterns
  ).sort();
  if (typeof cb === "function") {
    cb(filesInFolders);
    return;
  }
  // eslint-disable-next-line consistent-return
  return filesInFolders;
};

module.exports = resolveFiles;
