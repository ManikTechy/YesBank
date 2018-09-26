/**
 * Command line script that accepts a commit with the parameter -c
 * fetches the changedTargets between that commit and the latest commit
 * and runs a certain task on those changed targets. For example lint, tests,
 * build etc.
 */
const { exec } = require("child_process");
const parseArgs = require("minimist");
const changedTargets = require("./changedTargets");

const args = parseArgs(process.argv.slice(2), {
  string: ["commit", "task"],
  boolean: ["deployableOnly"],
  alias: {
    commit: "c",
    task: "t",
    deployableOnly: "do",
  },
});

changedTargets(
  args.commit,
  { onlyDeployableTargets: args.deployableOnly },
  services => {
    services.forEach(service => {
      const { task } = args;
      const runProc = exec(
        `node ./src/jeans/tasks/taskRunner.js -c ${task} -s ${service}`,
        err => {
          if (err) {
            console.log(err); // eslint-disable-line
            // Exit the process with a SIGINT
            process.exit(130);
          }
        }
      );
      runProc.stdout.pipe(process.stdout);
    });
  }
);
