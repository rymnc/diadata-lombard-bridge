const { FallbackProvider } = require("./helpers/fallback-provider/lib/index");
const dumpDataToFile = require("./helpers/dumpData");
const getContracts = require("./helpers/getContracts");
const { coerceToBridge } = require("./helpers/Bridge");

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
  console.log(e);
  dumpDataToFile(bridges)
    ? console.log("Dumped state to file")
    : console.error("Failed to dump state to file");
});

process.on("exit", () => {
  dumpDataToFile(bridges)
    ? console.log("Dumped state to file")
    : console.error("Failed to dump state to file");
  process.exit();
});
