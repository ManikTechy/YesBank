/* eslint-disable no-unused-expressions */
const fs = require("fs");
const path = require("path");
const parseArgs = require("minimist");
const getServerDependencies = require("./getServerDependencies");

const options = {
  string: ["service", "out"],
  boolean: ["help"],
  alias: {
    service: "s",
    help: "h",
    out: "o",
  },
};

const args = parseArgs(process.argv, options);
if (args.help) {
  console.log(JSON.stringify(options, null, 2));
} else if (args && args.service) {
  const dependencies = getServerDependencies(args.service);
  if (args.out === "-" || !args.out) {
    console.log(dependencies);
  } else if (path.isAbsolute(args.out)) {
    fs.writeFileSync(args.out, dependencies);
  } else {
    fs.writeFileSync(path.join(process.cwd(), args.out), dependencies);
  }
} else {
  console.log(JSON.stringify(options, null, 2));
  process.exit(1);
}
