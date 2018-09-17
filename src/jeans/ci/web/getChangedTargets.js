const minimist = require("minimist");
const changedTargets = require("./changedTargets");

const args = minimist(process.argv, {
  boolean: ["deployableOnly"],
  alias: { deployableOnly: "do" },
});

changedTargets(
  process.argv[2],
  { onlyDeployableTargets: args.deployableOnly },
  services => services.forEach(service => console.log(service))
);
