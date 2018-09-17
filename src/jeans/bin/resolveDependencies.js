const path = require("path");

function resolveDependencies(dependencies, alreadyVisitedFiles) {
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
          return [].concat.apply([], moduleDependencies);
        }
        return [];
      } catch (err) {
        console.log(err);
        return dependency;
      }
    }
    return dependency;
  });

  // Flatten the array of dependencies
  return [].concat.apply([], resolvedDependencies);
}

module.exports = resolveDependencies;
