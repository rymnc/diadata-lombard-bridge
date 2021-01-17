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
   * Sets up the event handlers, and any other async tasks
   * Meant to be used last in the builder pattern
   */
  setup = async () => {
    await this.setupEventListeners();
  };

  setupEventListeners = async () => {
    this.sourceEvents.forEach((eventName) => {
      this.sourceContract.on(eventName, this.sourceEventHandler);
    });
    this.targetEvents.forEach((eventName) => {
      this.targetContract.on(eventName, this.targetEventHandler);
    });
  };

  sourceEventHandler = async (...eventObj) => {
    console.log(eventObj)
  };

  targetEventHandler = async (...eventObj) => { };
}

const coerceToBridge = (configMap) => {
  const bridges = []
  for (const v of configMap.values()) {
    bridges.push(new Bridge()
      .setSourceContract(v.sourceContract.contract)
      .setTargetContract(v.targetContract.contract)
      .setSourceEvents(v.sourceContract.eventsToWatch)
      .setTargetEvents(v.targetContract.eventsToWatch)
      .setSourceConfirmations(v.sourceContract.confirmations)
      .setTargetConfirmations(v.targetContract.confirmations)
      .setSyncInterval(v.interval)
      .setHealthRatio(v.healthRatio)
    )
  }
  return bridges;
}

module.exports = { Bridge, coerceToBridge };
