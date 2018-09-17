const resolveDependencies = require("./resolveDependencies");
const config = require("./config");
const packageJson = require(`${process.cwd()}/package.json`);

function getServerDependencies(service) {
  const serviceDependencies = require(`${process.cwd()}/${
    config.srcFolder
  }/${service}/server/.jeans.js`);

  // Resolve dependencies and de-duplicate dependencies that appear in multiple packages.
  const resolvedDependencies = resolveDependencies(
    serviceDependencies.packages,
    []
  ).filter((item, i, ar) => ar.indexOf(item) === i);

  if (!resolveDependencies) {
    return {};
  }

  const dependencies = JSON.stringify(
    resolvedDependencies.reduce(
      (acc, dependency) => {
        const version = packageJson.dependencies[dependency];
        if (version) {
          return Object.assign(acc, {
            dependencies: Object.assign(acc.dependencies, {
              [dependency]: version,
            }),
          });
        }
        console.log(`${dependency} is missing from package.json`);
        return acc;
      },
      { dependencies: {}, scripts: packageJson.scripts }
    ),
    null,
    2
  );

  return dependencies;
}

module.exports = getServerDependencies;
