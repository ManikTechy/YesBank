import parseArgs from "minimist";
import { spawn } from "child_process";
import chokidar from "chokidar";
import dotenv from "dotenv";
import hmrServer from "./hmrServer";
import config from "../bin/config";

const options = {
  string: ["service", "bundle"],
  boolean: ["help"],
  alias: {
    service: "s",
    bundle: "b",
    help: "h",
  },
};

const args = parseArgs(process.argv, options);

if (args.help) {
  console.log(JSON.stringify(options, null, 2));
  process.exit();
}
if (!args.service) {
  console.log("⚠️ Please provice a --service argument");
  process.exit();
}

dotenv.config({ path: `.env-${args.service}` });
hmrServer({
  service: args.service,
  srcFolder: config.srcFolder,
});

const makeWorldProc = spawn("bsb", ["-make-world", "-w"]);
process.stdout.write("👷‍♀️ Compiling and watching Reason codebase\n");
makeWorldProc.stdout.pipe(process.stdout);

const { bundle } = args;
let serverProc;
const spawnServer = () => {
  serverProc = spawn(
    "babel-node",
    [
      `./${config.srcFolder}/${args.service}/server/index.js`,
      bundle ? `${bundle}` : "",
    ],
    { detached: true }
  );
  serverProc.stdout.pipe(process.stdout);
  serverProc.stderr.pipe(process.stderr);
};

const watcher = chokidar.watch([
  `./${config.srcFolder}/${args.service}/server`,
  `./${config.srcFolder}/shared/api`,
  `./${config.srcFolder}/shared/server`,
  `./${config.srcFolder}/shared/utils`,
]);

watcher.on("change", path => {
  if (serverProc) {
    console.log("♻️ ", path, "changed, restarting");
    if (!serverProc.exitCode) {
      process.kill(-serverProc.pid);
    }
    serverProc = null;
    spawnServer();
  }
});

process.on("SIGINT", () => {
  if (serverProc) {
    process.kill(-serverProc.pid);
  }
  process.exit();
});

spawnServer();
