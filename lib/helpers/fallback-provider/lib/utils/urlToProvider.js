const ethers = require("ethers");

/**
 * Coerces a URL into its respective provider
 * @param {string} url RPC/WS Endpoint
 */
const urlToProvider = (url) => {
  if (url.startsWith() === "https:" || url.startsWith() === "http:") {
    return new ethers.providers.JsonRpcProvider(url);
  } else if (url.startsWith() === "wss:" || url.startsWith() === "ws:") {
    return new ethers.providers.WebSocketProvider(url);
  } else {
    return false;
  }
};

module.exports = urlToProvider;
