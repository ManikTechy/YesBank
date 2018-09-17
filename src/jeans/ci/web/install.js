/* eslint-disable no-unused-expressions */
const fs = require("fs");
const path = require("path");
const parseArgs = require("minimist");
const { exec } = require("child_process");
const readline = require("readline");
const resolveDependencies = require("../../bin/resolveDependencies");
const config = require("../../bin/config");
const packageJson = require(`${process.cwd()}/package.json`);

const options = {
  string: ["service"],
  boolean: ["help", "dryRun", "force"],
  alias: {
    service: "s",
    help: "h",
    dryRun: "d",
    force: "f",
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askYesNo = (question, cb) => {
  rl.question(question, response => {
    const answer = response.toLowerCase();
    if (answer !== "y" && answer !== "n") {
      askYesNo("Answer must be either Y/y or N/n: ");
    } else if (answer === "n") {
      process.exit(1);
    } else {
      cb();
    }
  });
};

const install = dependencies => {
  fs.writeFileSync(path.join(process.cwd(), "package.json"), dependencies);
  exec("yarn install", (error, stdout, stderr) => {
    error && console.error(error);
    stdout && console.log(stdout);
    stderr && console.log(stderr);
    if (error) {
      process.exit(1);
    }
    process.exit(0);
  });
};

const args = parseArgs(process.argv, options);
if (args.help) {
  console.log(JSON.stringify(options, null, 2));
} else if (args && args.service) {
  const serviceDependencies = require(`${process.cwd()}/${config.srcFolder}/${
    args.service
  }/server/.jeans.js`);

  // Resolve dependencies and de-duplicate dependencies that appear in multiple packages.
  const resolvedDependencies = resolveDependencies(
    serviceDependencies.packages,
    []
  ).filter((item, i, ar) => ar.indexOf(item) === i);
  if (resolvedDependencies) {
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

    if (args.dryRun) {
      console.log(dependencies);
      process.exit(0);
    } else if (!args.force) {
      askYesNo(
        "You are about to override package.json, are you sure you want to do this.\nThis action can not be undone. (y/n): ",
        () => install(dependencies)
      );
    } else {
      install(dependencies);
    }
  } else {
    console.log("Service not found");
  }
} else {
  console.log(JSON.stringify(options, null, 2));
}
