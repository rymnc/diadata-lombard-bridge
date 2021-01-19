const { FallbackProvider } = require("./helpers/fallback-provider/lib/index");
const getContracts = require("./helpers/getContracts");
const { coerceToBridge } = require("./helpers/Bridge");

const [sourceProvider, targetProvider] = new FallbackProvider(
  "config.yaml"
).get();

const z = getContracts(sourceProvider, targetProvider);
const bridges = coerceToBridge(z);
bridges[0].sourceContract.owner().then(console.log);

async function events() {
  for (const bridge of bridges) {
    await bridge.setup();
  }
}
events();
