const ethers = require("ethers");
const yaml = require("yaml");
const fs = require("fs");
const getConfig = require("./getConfig");
/**
 * Returns ethers.js instances of the contracts mentioned in the root config.yaml file
 * @param {object} provider | ethers.js provider | fallback!
 * @returns {map} addressToContract Map
 */
const getContracts = (provider) => {
  // Parse the config file
  const { contracts } = getConfig();

  const bridgeContracts = new Map();

  // For each contract in the config, instantiate the ethers.js object
  contracts.forEach((contract_pair) => {
    const sourceAbi = JSON.parse(
      fs.readFileSync(contract_pair.sourceContract.pathToArtifact)
    );
    const destAbi = JSON.parse(
      fs.readFileSync(contract_pair.destinationContract.pathToArtifact)
    );
    bridgeContracts.set(contract_pair.name, {
      name: contract_pair.name,
      interval: contract_pair.interval,
      sourceContract: {
        eventsToWatch: contract_pair.sourceContract.eventsToWatch,
        contract: new ethers.Contract(
          contract_pair.sourceContract.address,
          sourceAbi,
          provider
        ),
        confirmations: contract_pair.blockConfirmations.sourceChain,
      },
      destinationContract: {
        eventsToWatch: contract_pair.destinationContract.eventsToWatch,
        contract: new ethers.Contract(
          contract_pair.destinationContract.address,
          destAbi,
          provider
        ),
        confirmations: contract_pair.blockConfirmations.destinationChain,
      },
      healthRatio: contract_pair.healthRatio,
    });
  });

  return bridgeContracts;
};

module.exports = getContracts;
