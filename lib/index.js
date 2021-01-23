const { FallbackProvider } = require("./helpers/fallback-provider/lib/index");
const dumpDataToFile = require("./helpers/dumpData");
const getContracts = require("./helpers/getContracts");
const { coerceToBridge } = require("./helpers/Bridge");

Object.assign(process, {
  onMany(events, callback) {
    events.forEach((event) => process.on(event, callback));
  },
});

let bridges = [];

const main = async () => {
  const [sourceProvider, targetProvider] = new FallbackProvider(
    "config.yaml"
  ).get();
  const z = getContracts(sourceProvider, targetProvider);
  bridges = coerceToBridge(z);
  for (const bridge of bridges) {
    await bridge.setup();
  }
};

main().then(null, (e) => {
  dumpDataToFile(bridges)
    ? console.log("Dumped state to file")
    : console.error("Failed to dump state to file");
});

process.onMany(
  ["SIGINT", "SIGTERM", "exit", "uncaughtException", "SIGQUIT"],
  () => {
    dumpDataToFile(bridges)
      ? console.log("Dumped state to file")
      : console.error("Failed to dump state to file");
    process.exit();
  }
);
