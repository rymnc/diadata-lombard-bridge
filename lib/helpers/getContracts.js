const ethers = require("ethers");
const fs = require("fs");
const getConfig = require("./getConfig");

/**
 * This method just coerces the abi into the appropriate format
 * @param {Object | Array} ip | This can either be solc output, or a normal ABI
 */
const coerceABI = (ip) => (ip.length === undefined ? ip.abi : ip);

/**
 * Returns ethers.js instances of the contracts mentioned in the root config.yaml file
 * @param {Provider} sourceProvider | source network ethers.js provider | fallback!
 * @param {Provider} targetProvider | target network ethers.js provider | fallback!
 * @returns {map} addressToContract Map
 */
const getContracts = (sourceProvider, targetProvider) => {
  // Parse the config file
  const { contracts } = getConfig();

  const bridgeContracts = new Map();

  // For each contract in the config, instantiate the ethers.js object
  contracts.forEach((contract_pair) => {
    const sourceABI = JSON.parse(
      fs.readFileSync(contract_pair.sourceContract.pathToArtifact)
    );
    const targetABI = JSON.parse(
      fs.readFileSync(contract_pair.targetContract.pathToArtifact)
    );
    bridgeContracts.set(contract_pair.name, {
      name: contract_pair.name,
      interval: contract_pair.interval,
      sourceContract: {
        eventsToWatch: contract_pair.sourceContract.eventsToWatch,
        contract: new ethers.Contract(
          contract_pair.sourceContract.address,
          coerceABI(sourceABI),
          sourceProvider
        ),
        confirmations: contract_pair.blockConfirmations.sourceChain,
      },
      targetContract: {
        eventsToWatch: contract_pair.targetContract.eventsToWatch,
        contract: new ethers.Contract(
          contract_pair.targetContract.address,
          coerceABI(targetABI),
          targetProvider
        ),
        confirmations: contract_pair.blockConfirmations.targetChain,
      },
      healthRatio: contract_pair.healthRatio,
    });
  });

  return bridgeContracts;
};

module.exports = getContracts;
