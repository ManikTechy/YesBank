const minimist = require("minimist");
const resolveFiles = require("./resolveFiles");

const args = minimist(process.argv, {
  string: ["blackListedPatterns"],
  default: {
    blackListedPatterns: "",
  },
  alias: {
    blackListedPatterns: "b",
  },
});

resolveFiles(
  process.argv[2],
  args.blackListedPatterns.split(","),
  dependencies => dependencies.forEach(dependency => console.log(dependency))
);
