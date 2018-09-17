const fs = require("fs");
const minimist = require("minimist");
const prettier = require("prettier");
const generateJeansFiles = require("./generateJeansFiles");
const deduplicateArray = require("../../utils/deduplicateArray");

const writeJeansFiles = dependencyMap => {
  Object.keys(dependencyMap).forEach(directory => {
    const jeansFilePath = `${directory}/.jeans.js`;
    let jeansFileContent = {};
    try {
      jeansFileContent = require(jeansFilePath);
    } catch (e) {
      // Intentionally left empty
    }
    const packagesObject = {
      packages: deduplicateArray(dependencyMap[directory]),
    };

    fs.writeFileSync(
      `${directory}/.jeans.js`,
      prettier.format(
        `module.exports = ${JSON.stringify(
          Object.assign(jeansFileContent, packagesObject)
        )}`,
        {
          // Hack to make prettier write each package on an individual line
          printWidth: 10,
          singleQuote: true,
          trailingComma: "all",
          bracketSpacing: false,
        }
      )
    );
  });
};

const args = minimist(process.argv, {
  string: ["filePath"],
  alias: { filePath: "f" },
});

const { filePath } = args;
if (!filePath) {
  console.log("Filepath is needed to run this script\n");
  console.log("Use -f or --filePath parameter");
  process.exit(1);
}
const currentDir = `${process.cwd()}/${filePath.toString()}`;

generateJeansFiles(currentDir, directoriesToWriteTo => {
  writeJeansFiles(directoriesToWriteTo);
});
