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
  const {
    contracts,
  } = getConfig();

  const bridgeContracts = new Map();

  // For each contract in the config, instantiate the ethers.js object
  contracts.forEach((contract_pair) => {
    const sourceAbi = JSON.parse(fs.readFileSync(contract_pair.pathToSourceArtifact));
    const destAbi = JSON.parse(fs.readFileSync(contract_pair.pathToDesArtifact));
    bridgeContracts.set(contract_pair.name, {
      name: contract_pair.name,
      interval: contract_pair.interval,
      sourceContract: {
        eventsToWatch: contract_pair.eventsToWatch.sourceContract,
        contract: new ethers.Contract(contract_pair.sourceContract, sourceAbi, provider)
      },
      destinationContract: {
        eventsToWatch: contract_pair.eventsToWatch.destinationContract,
        contract: new ethers.Contract(contract_pair.destinationContract, destAbi, provider)
      },
      healthRatio: contract_pair.healthRatio,
    });
  });

  return bridgeContracts;
};

module.exports = getContracts;
