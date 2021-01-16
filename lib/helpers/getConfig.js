const fs = require("fs");
const yaml = require("yaml");

/**
 * Get and Parse the Config from the root directory
 * @returns {object} config
 */
const getConfig = () => {
  const configFile = fs.readFileSync("config.yaml", "utf8");
  return yaml.parse(configFile);
};

module.exports = getConfig;
