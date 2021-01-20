const fs = require('fs')
const CircularJSON = require('circular-json')

/**
 * Dumps the process info into a file for later analysis
 * @param {Array} bridges
 * @returns {bool} if dumped
 */
const dumpData = (objects) => {
  try {
    objects.forEach((ob, i) => {
      const o = ob.constructor.name;
      fs.writeFileSync(`logdata-${o}-${i}.json`, CircularJSON.stringify(ob, null, 4))
    });
    return true;
  } catch (e) {
    console.log(e)
    return false
  }
}

module.exports = dumpData