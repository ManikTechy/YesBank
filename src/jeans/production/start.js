const parseArgs = require("minimist");
const config = require("../bin/config");

const options = {
  string: ["service"],
  boolean: ["help"],
  alias: {
    service: "s",
    help: "h",
  },
};

const args = parseArgs(process.argv, options);

if (args && args.help) {
  console.log(JSON.stringify(options, null, 2));
} else if (args && args.service) {
  require(`${process.cwd()}/${config.srcFolder}/${
    args.service
  }/server/dist/server.js`);
} else {
  console.log(JSON.stringify(options, null, 2));
}
