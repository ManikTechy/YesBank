/* eslint-disable consistent-return, array-callback-return, no-fallthrough */
const flow = require("flow-parser");
const fs = require("fs");
const path = require("path");
const builtinModules = require("builtin-modules");
const packages = require(`${process.cwd()}/package.json`);
const config = require("../config");

const dependenciesArray = () => {
  return Object.keys(packages.dependencies).concat(
    Object.keys(packages.devDependencies)
  );
};

/**
 * @currentDirPath - Path to a folder to check for .jeans.js
 * @callback - function to call when .jeans.js is found
 * This walks through the folder that get's passed in recursively and
 * checks if there is a .jeans.js file present.
 * If so it returns the full filepath.
 */
const getDirectories = currentDirPath => {
  return fs.readdirSync(currentDirPath).reduce((accumulated, fileName) => {
    const filePath = path.join(currentDirPath, fileName);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return [...accumulated, filePath, ...getDirectories(filePath)];
    }
    return accumulated;
  }, []);
};

const getFilesInDirectory = directory => {
  return fs.readdirSync(directory).reduce((accumulated, fileName) => {
    const filePath = path.join(directory, fileName);
    const directoriesInPath = filePath.split("/");
    if (directoriesInPath.indexOf("dist") > -1) {
      return accumulated;
    }
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      return [...accumulated, filePath];
    }
    return accumulated;
  }, []);
};

const getASTForAllFilesInDirectory = directory => {
  return getFilesInDirectory(directory).reduce((accumulated, filePath) => {
    if (!filePath.endsWith(".js")) {
      return accumulated;
    }
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return Object.assign(accumulated, { [filePath]: flow.parse(fileContent) });
  }, {});
};

const shouldDependencyBeIncluded = (dependency, fileName) => {
  // This happens when we use template literals in imports
  if (!dependency) {
    return [];
  }
  // Don't include loaders (css-loader/style-loader etc).
  if (dependency.indexOf("!") > -1) {
    return [];
  }
  if (
    dependency.endsWith(".css") ||
    dependency.endsWith(".gql") ||
    dependency.endsWith(".scss")
  ) {
    return [];
  }
  if (dependency.indexOf("./") === 0) {
    const filePath = fileName
      .split(`${process.cwd()}/`)[1]
      .split("/")
      .slice(0, -1)
      .join("/");

    const relativeDependencyPath = dependency.split("./").join("/");
    const dependencyPath = path.join(filePath, relativeDependencyPath);
    try {
      const stat = fs.statSync(dependencyPath);
      if (stat.isFile() && relativeDependencyPath.split("/").length > 1) {
        return dependencyPath
          .split("/")
          .slice(0, -1)
          .join("/");
      } else if (stat.isDirectory()) {
        return `${filePath}${dependency.split("./").join("/")}`;
      }
    } catch (e) {
      try {
        const stat = fs.statSync(`${dependencyPath}.js`);
        if (stat.isFile() && relativeDependencyPath.split("/").length > 1) {
          return dependencyPath
            .split("/")
            .slice(0, -1)
            .join("/");
        } else if (stat.isDirectory()) {
          return `${filePath}${dependency.split("./").join("/")}`;
        }
      } catch (err) {
        return [];
      }
    }
    return dependencyPath;
  }
  const dependencyWithOutRelativePath = dependency
    .split("../")
    .filter(item => item.length)
    .join("/");
  const isRequiringParent = dependency.indexOf("../") > -1;
  const dependencyPath = dependencyWithOutRelativePath.split("/");
  const isFromShared = dependencyWithOutRelativePath.startsWith("shared");
  if (builtinModules.indexOf(dependencyPath[0]) !== -1) {
    return [];
  }
  if (!isRequiringParent && dependencyPath.length > 1) {
    const isPartOfPackageJSON =
      dependenciesArray().indexOf(
        dependencyWithOutRelativePath.split("/")[0]
      ) !== -1;
    if (isPartOfPackageJSON) {
      return dependencyPath[0];
    } else if (!isFromShared) {
      const serviceFolder = fileName
        .split(`${process.cwd()}/`)[1]
        .split("/")
        // This is a hack to be able to set the relativePathDepth
        // in tests. The default value of 5 stands for
        // src/js/src/booking/app/ === 5*/
        // For the tests we need
        // src/js/src/jeans/bin/generateJeansFiles/__tests__/testProjects/relativePaths/ == 9
        .slice(0, config.relativePathDepth || 5)
        .join("/");

      const filePath = path.join(process.cwd(), serviceFolder, dependency);
      try {
        const stat = fs.statSync(`${filePath}.js`);
        if (stat.isFile()) {
          return path
            .join(serviceFolder, dependencyWithOutRelativePath)
            .split("/")
            .slice(0, -1)
            .join("/");
        }
      } catch (e) {
        try {
          const stat = fs.statSync(`${filePath}`);
          if (stat.isDirectory()) {
            return path.join(serviceFolder, dependencyWithOutRelativePath);
          }
        } catch (err) {
          return [];
        }
      }
      return [];
    }
  }
  if (isRequiringParent && !isFromShared) {
    const folderPath = fileName
      .split("/")
      .slice(0, -1)
      .join("/");
    const filePath = path
      .join(folderPath, dependency)
      .split(`${process.cwd()}/`)[1];
    try {
      const stat = fs.statSync(`${filePath}.js`);
      if (stat.isFile()) {
        return filePath
          .split("/")
          .slice(0, -1)
          .join("/");
      }
    } catch (e) {
      try {
        const stat = fs.statSync(`${filePath}`);
        if (stat.isDirectory()) {
          return filePath;
        }
      } catch (err) {
        return [];
      }
    }
    return filePath
      .split("/")
      .slice(0, -1)
      .join("/");
  }
  if (isFromShared) {
    const jeansDepedencyPath = `src/js/src/${dependencyWithOutRelativePath}`;
    const filePath = path.join(process.cwd(), jeansDepedencyPath);
    try {
      const stat = fs.statSync(`${filePath}.js`);
      if (stat.isFile()) {
        return jeansDepedencyPath
          .split("/")
          .slice(0, -1)
          .join("/");
      }
    } catch (e) {
      try {
        const stat = fs.statSync(`${filePath}`);
        if (stat.isDirectory()) {
          return jeansDepedencyPath;
        }
      } catch (err) {
        return jeansDepedencyPath
          .split("/")
          .slice(0, -1)
          .join("/");
      }
    }
    return jeansDepedencyPath
      .split("/")
      .slice(0, -1)
      .join("/");
  }
  return dependencyWithOutRelativePath;
};

const parseVariableDeclarator = (dependencies, token, fileName) => {
  if (!token.init) {
    return dependencies;
  }
  switch (token.init.type) {
    case "CallExpression": {
      if (token.init.callee.name === "require") {
        return dependencies.concat(
          shouldDependencyBeIncluded(token.init.arguments[0].value, fileName)
        );
      }
    }
    case "ArrowFunctionExpression": {
      return parseDependencies(dependencies, token.init.body, fileName);
    }
    default: {
      return dependencies;
    }
  }
};

const parseDependencies = (dependencies, token, fileName) => {
  if (!token || !token.type) {
    return dependencies;
  }
  switch (token.type) {
    case "ImportDeclaration": {
      return dependencies.concat(
        shouldDependencyBeIncluded(token.source.value, fileName)
      );
    }
    case "VariableDeclaration": {
      return dependencies.concat(
        token.declarations.reduce(
          (deps, nextToken) => parseDependencies(deps, nextToken, fileName),
          []
        )
      );
    }
    case "AssignmentExpression": {
      return parseDependencies(dependencies, token.right, fileName);
    }
    case "VariableDeclarator": {
      return parseVariableDeclarator(dependencies, token, fileName);
    }
    case "CallExpression": {
      if (token.callee.name === "require") {
        return dependencies.concat(
          shouldDependencyBeIncluded(token.arguments[0].value, fileName)
        );
      }
    }
    case "ExpressionStatement": {
      return parseDependencies(dependencies, token.expression, fileName);
    }
    case "IfStatement": {
      if (typeof token.alternate === "object") {
        if (!token.consequent.body) {
          return dependencies;
        }
        return parseDependencies(
          dependencies,
          token.alternate,
          fileName
        ).concat(
          token.consequent.body.reduce(
            (deps, nextToken) => parseDependencies(deps, nextToken, fileName),
            []
          )
        );
      }
      return dependencies.concat(
        token.consequent.body.reduce(
          (deps, nextToken) => parseDependencies(deps, nextToken, fileName),
          []
        )
      );
    }
    case "BlockStatement": {
      return dependencies.concat(
        token.body.reduce(
          (deps, nextToken) => parseDependencies(deps, nextToken, fileName),
          []
        )
      );
    }
    case "FunctionDeclaration": {
      return parseDependencies(dependencies, token.body, fileName);
    }
    case "TryStatement": {
      return parseDependencies(dependencies, token.block, fileName);
    }
    default: {
      return dependencies;
    }
  }
};

const findAllRequiresInAST = files => {
  return Object.keys(files).reduce((accumulated, fileName) => {
    const { body } = files[fileName];
    try {
      return Object.assign(accumulated, {
        [fileName]: body.reduce(
          (deps, nextToken) => parseDependencies(deps, nextToken, fileName),
          []
        ),
      });
    } catch (e) {
      console.log(e, fileName);
    }
  }, {});
};

const joinDependenciesForDirectory = dependencyMap => {
  return (
    (dependencyMap &&
      Object.keys(dependencyMap).reduce((accumulated, fileName) => {
        const filePath = fileName.split("/");
        // Get rid of the last element of the filePath (ex. index.js);
        filePath.splice(-1);
        const currentlySetInPath =
          (accumulated && accumulated[filePath.join("/")]) || [];
        const dependency = dependencyMap && dependencyMap[fileName];
        return Object.assign(accumulated, {
          [filePath.join("/")]: currentlySetInPath.concat(dependency),
        });
      }, {})) ||
    {}
  );
};

const groupAndSortDependencies = dependencyMap => {
  const dependenciesPerDirectory = joinDependenciesForDirectory(dependencyMap);
  return Object.keys(dependenciesPerDirectory).reduce(
    (accumulated, directory) =>
      Object.assign(accumulated, {
        [directory]: dependenciesPerDirectory[directory].sort(),
      }),
    {}
  );
};

const run = (directory, cb) => {
  const currentAndSubDirectories = getDirectories(directory).concat([
    directory,
  ]);

  const dependencyMap = currentAndSubDirectories
    .map(getASTForAllFilesInDirectory)
    .map(findAllRequiresInAST)
    .reduce((accumulated, next) => Object.assign(accumulated, next));

  const directoriesToWriteTo = groupAndSortDependencies(dependencyMap);
  if (typeof cb === "function") {
    cb(directoriesToWriteTo);
    return;
  }
  return directoriesToWriteTo;
};

module.exports = run;
