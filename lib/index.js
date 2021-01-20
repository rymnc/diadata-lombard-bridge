const { FallbackProvider } = require("./helpers/fallback-provider/lib/index");
const dumpDataToFile = require("./helpers/dumpData");
const getContracts = require("./helpers/getContracts");
const { coerceToBridge } = require("./helpers/Bridge");

const [sourceProvider, targetProvider] = new FallbackProvider(
  "config.yaml"
).get();

const z = getContracts(sourceProvider, targetProvider);
const bridges = coerceToBridge(z);

async function events() {
  for (const bridge of bridges) {
    await bridge.setup();
  }
}
events();

process.on("SIGINT", () => {
  dumpDataToFile(bridges)
    ? console.log("Dumped state to file")
    : console.error("Failed to dump state to file");
  process.exit();
});
