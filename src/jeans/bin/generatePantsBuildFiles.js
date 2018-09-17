const fs = require("fs");
const path = require("path");
const multiline = require("multiline-template");
const getServices = require("./getServices");
const resolveFiles = require("./resolveFiles");

const template = (service, sources) => multiline`
  | jeans_service(
  |     name='${service}',
  |     sources=[
  |         ${sources}
  |     ],
  |     dependencies=[
  |         '//:jeans-support'
  |     ]
  | )
`;

const fileDependencies = getServices({
  onlyDeployableTargets: true,
}).reduce((acc, service) => {
  const files = resolveFiles(service);
  return Object.assign(acc, { [service]: files });
}, {});

const content = Object.keys(fileDependencies).map(service => {
  return template(service, fileDependencies[service].join("\n"));
});

fs.writeFileSync(
  path.join(process.cwd(), "src/js/BUILD"),
  content.join("\n\n")
);
