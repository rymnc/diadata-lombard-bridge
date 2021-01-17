const ethers = require("ethers");

const getConfig = require("../../getConfig.js");
const urlToProvider = require("./utils/urlToProvider.js");

/**
 * Fallback Provider which is capable of connecting to multiple backends
 */
class FallbackProvider {
  /**
   * Generates the fallback provider from given config
   * @param {path} pathToConfig
   */
  constructor(pathToConfig) {
    this.config = getConfig(pathToConfig);
    const providerConfig = [
      this.config.providers.sourceNetwork.map((provider) => {
        const config = {};
        config.provider = urlToProvider(provider.url, provider.networkId);
        Object.assign(config, provider.config);
        return config;
      }),
      this.config.providers.targetNetwork.map((provider) => {
        const config = {};
        config.provider = urlToProvider(provider.url, provider.networkId);
        Object.assign(config, provider.config);
        return config;
      }),
    ];
    this.providers = providerConfig.map(
      (network) => new ethers.providers.FallbackProvider(network)
    );
  }
  /**
   * Returns the fallback provider
   * @return {provider}
   */
  get() {
    return this.providers;
  }
}

module.exports = {
  FallbackProvider,
};
