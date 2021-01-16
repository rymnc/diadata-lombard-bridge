const { ethers } = require("ethers");
const { FallbackProvider } = require("./helpers/fallback-provider/lib/index");
const getContracts = require("./helpers/getContracts");

const p = new FallbackProvider("config.yaml");
const z = getContracts(p);
