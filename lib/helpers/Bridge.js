/**
 * Main Bridge Class that will be used for contract interactions,
 * It has the logic for synchronizing state amongst a set of contracts
 * Follows the builder pattern for idiomatic use
 * Example -
 * const bridge = new Bridge()
 *                          .setSourceContract()
 *                          .setTargetContract()
 *                          .setSourceEvents()
 *                          .setTargetEvents()
 *                          .setSourceConfirmations()
 *                          .setTargetConfirmations()
 *                          .setSyncInterval()
 *                          .setHealthRatio()
 *                          .setup()
 */
class Bridge {
  constructor(opts) {
    Object.assign(this, opts || {});
    this.txQueue = {};
    this.broadcastedTx = {};
    this.completedTx = {};
    this.failedTx = {};
  }

  /**
   * Set the source contract
   * @param {Contract} contract
   * @returns {Bridge}
   */
  setSourceContract(contract) {
    this.sourceContract = contract;
    return this;
  }

  /**
   * Set the source events
   * @param {array} events
   * @returns {Bridge}
   */
  setSourceEvents(events) {
    this.sourceEvents = events;
    return this;
  }

  /**
   * Set the target events
   * @param {array} events
   * @returns {Bridge}
   */
  setTargetEvents(events) {
    this.targetEvents = events;
    return this;
  }

  /**
   * Set the target contract
   * @param {Contract} contract
   * @returns {Bridge}
   */
  setTargetContract(contract) {
    this.targetContract = contract;
    return this;
  }

  /**
   * Set the block confirmations on the source network
   * @param {Number} n
   * @returns {Bridge}
   */
  setSourceConfirmations(n = 6) {
    this.sourceConfirmations = n;
    return this;
  }

  /**
   * Set the block confirmations on the target network
   * @param {Number} n
   * @returns {Bridge}
   */
  setTargetConfirmations(n = 6) {
    this.targetConfirmations = n;
    return this;
  }

  /**
   * Set the interval at which both networks should sync
   * @param {seconds} n
   * @returns {Bridge}
   */
  setSyncInterval(n = 600) {
    this.syncInterval = n;
    return this;
  }

  /**
   * Set the health ratio, i.e sourceRate/exchangeRate
   * @param {Float} n
   * @returns {Bridge}
   */
  setHealthRatio(n = 0.95) {
    this.healthRatio = n;
    return this;
  }

  /**
   * Set the transaction limit till it should not execute batch
   * @param {Number} n
   * @returns {Bridge}
   */
  setTxLimit(n = 10) {
    this.txLimit = n;
    return this;
  }

  /**
   * Sets up the event handlers, and any other async tasks
   * Meant to be used last in the builder pattern
   */
  setup = async () => {
    await this.setupEventListeners();
    setInterval(this.executePending, this.syncInterval * 1000);
  };

  /**
   * Setup event listeners for source and target events
   */
  setupEventListeners = async () => {
    if (this.sourceEvents.length >= 1) {
      this.sourceEvents.forEach((eventName) => {
        this.sourceContract.on(eventName, this.sourceEventHandler);
      });
    }
    if (this.targetEvents.length >= 1) {
      this.targetEvents.forEach((eventName) => {
        this.targetContract.on(eventName, this.targetEventHandler);
      });
    }
  };

  /**
   * This function is called anytime source event occurs
   * Note - This function can be modified in the future to set the pending transactions
   *        to a caching service/database such as redis/mysql etc
   * @param  {...any} eventObj
   */
  sourceEventHandler = async (...eventObj) => {
    // Poll to see block confirmations on each transaction, once it crosses threshold push it into the array
    await this.transactionPoller("source", eventObj);
  };

  /**
   * This function is aclled anytime target event occurs
   * Note - This function can be modified in the future to set the pending transactions
   *        to a caching service/database such as redis/mysql etc
   * @param  {...any} eventObj
   */
  targetEventHandler = async (...eventObj) => {
    // Poll to see block confirmations on each transaction, once it crosses threshold push it into the array
    await this.transactionPoller("target", eventObj);
  };

  /**
   * Gets the pending transactions
   * @returns {Object} object of 2 arrays, pending source and target transactions
   * Note - This function can be modified in the future to fetch the pending transactions
   *        from a caching service/database such as redis/mysql etc. Returns 0 if none
   */
  getPendingTransactions = async () => {
    return {
      source: this.txQueue['source'] ? this.txQueue['source'] : 0,
      target: this.txQueue['target'] ? this.txQueue['target'] : 0,
    };
  };

  /**
   * Polls the transaction till required number of block confirmations, then sends to cache
   * @param {String} network
   * @param {Object} eventObj
   */
  transactionPoller = async (network, eventObj) => {
    const txHash = eventObj.pop().transactionHash;
    if (network === "source") {
      this.sourceContract.provider
        .waitForTransaction(txHash, this.sourceConfirmations)
        .then(async () => {
          await this.appendPendingTransaction(network, eventObj);
        });
    } else if (network === "target") {
      this.targetContract.provider
        .waitForTransaction(txHash, this.targetConfirmations)
        .then(async () => {
          await this.appendPendingTransaction(network, eventObj);
        });
    }
  };

  /**
   * Append transaction to cache
   * @param {String} network
   * @param {Object} tx
   */
  appendPendingTransaction = async (network, tx) => {
    if (!this.txQueue[network]) {
      this.txQueue[network] = [tx]
    } else {
      this.txQueue[network].push(tx);
      // If number of appended transactions is greater than the limit defined,
      // execute the pipeline of transactions
      if (this.txQueue[network].length > this.txLimit) {
        await this.executePending();
      }
    }
  };

  /**
   * Executes the pending transactions
   */
  executePending = async () => {
    const { source, target } = await this.getPendingTransactions();
    // If number of pending transactions is 0 don't execute
    if (source !== 0 && source.length > 0) {
      await this.executeTx("source", source);
    }
    if (target !== 0 && target.length > 0) {
      await this.executeTx("target", target);
    }
  };

  executeTx = async (network, transactions) => {
    console.log(network, transactions)
    // TODO: Pending - If batched deposits are implemented in the contracts then 
    //                 the interactions go here
    // As soon as tx is sent - append to the broadcasted tx'es
    // once it is confirmed/failed append to the apt list
  }
}

/**
 * Coerces the getContracts return value into a bridge array
 * @param {Object} configMap config map from the output generated by the getContracts function
 * @returns {Array<Bridge>}
 */
const coerceToBridge = (configMap) => {
  const bridges = [];
  for (const v of configMap.values()) {
    bridges.push(
      new Bridge()
        .setSourceContract(v.sourceContract.contract)
        .setTargetContract(v.targetContract.contract)
        .setSourceEvents(v.sourceContract.eventsToWatch)
        .setTargetEvents(v.targetContract.eventsToWatch)
        .setSourceConfirmations(v.sourceContract.confirmations)
        .setTargetConfirmations(v.targetContract.confirmations)
        .setSyncInterval(v.interval)
        .setHealthRatio(v.healthRatio)
        .setTxLimit(v.txLimit)
    );
  }
  return bridges;
};

module.exports = { Bridge, coerceToBridge };
