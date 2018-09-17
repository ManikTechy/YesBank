"use strict";

const parseArgs = require("minimist");
const { exec } = require("child_process");
const jeansConfig = require(`${process.cwd()}/.jeans.js`);
const services = require("../bin/getServices");
const config = require("../bin/config");

const options = {
  string: ["service", "script", "taskName"],
  boolean: ["help", "all", "deployableOnly"],
  alias: {
    service: "s",
    script: "f",
    all: "a",
    taskName: "c",
    help: "h",
    deployableOnly: "do",
  },
};

const getCommand = (serviceNameOrScriptPath, taskName, commandType) => {
  let serviceSpecificJeansConfig;
  if (commandType === "SCRIPT") {
    try {
      // Try to find if the serviceNameOrScriptPath parameter is a fullpath to a shared folder
      serviceSpecificJeansConfig = require(`${process.cwd()}/${serviceNameOrScriptPath}/.jeans`);
    } catch (err) {
      // Intentionally left empty
    }
  } else if (commandType === "SERVICE") {
    try {
      serviceSpecificJeansConfig = require(`${process.cwd()}/${
        config.srcFolder
      }/${serviceNameOrScriptPath}/.jeans`);
    } catch (e) {
      // Intentionally left empty
    }
  } else if (commandType === "ALL") {
    try {
      serviceSpecificJeansConfig = require(`${process.cwd()}/${
        config.srcFolder
      }/${serviceNameOrScriptPath}/.jeans`);
    } catch (e) {
      // Intentionally left empty
    }
  } else {
    console.log("Unknown command type");
  }
  return (
    (serviceSpecificJeansConfig &&
      serviceSpecificJeansConfig.commands &&
      serviceSpecificJeansConfig.commands[taskName]) ||
    jeansConfig.commands[taskName]
  );
};

const taskRunner = () => {
  const args = parseArgs(process.argv, options);
  if (args && args.help) {
    console.log(JSON.stringify(options, null, 2));
    process.exit(0);
  }
  const taskName = args && args.taskName;
  if (!taskName) {
    console.log("Task name is required");
    process.exit(1);
  }

  if (args && args.service) {
    const command = getCommand(args.service, taskName, "SERVICE");
    if (!command) {
      console.log("Command not found in .jeans.js");
      process.exit(1);
    }
    run(args.service, taskName, command, args);
  } else if (args && args.script) {
    const command = getCommand(args.script, taskName, "SCRIPT");
    if (!command) {
      console.log("Command not found in .jeans.js");
      process.exit(1);
    }
    run(args.script, taskName, command, args);
  } else {
    services({
      onlyDeployableTargets: options.deployableOnly,
    }).forEach(service => {
      const command = getCommand(service, taskName, "ALL");
      if (!command) {
        return;
      }
      run(service, taskName, command, args);
    });
  }
};

const run = (service, taskName, command, args) => {
  const runCommand = `${command.split("SERVICE_NAME").join(service)}`;
  process.stdout.write(`${taskName} ${service} \n`);

  // Forward all the additional arguments to the next script
  const argumentsToForward = Object.keys(args)
    .filter(arg => {
      return (
        options.string
          .concat(options.boolean)
          .concat(Object.keys(options.alias).map(key => options.alias[key]))
          .indexOf(arg) === -1 && arg !== "_"
      );
    })
    .map(arg => `--${arg}=${args[arg]}`)
    .join(" ");

  const runProc = exec(`${runCommand} ${argumentsToForward}`, {
    maxBuffer: 1024 * 500,
  });
  runProc.stdout.pipe(process.stdout);
  runProc.stderr.pipe(process.stderr);
  runProc.on("exit", code => {
    process.stdout.write(
      `${taskName} ${service} ${code === 0 ? "SUCCESS" : "FAILED"} \n`
    );
    if (code > 0) {
      process.exit(1);
    }
  });
};

taskRunner();

module.exports = taskRunner;
