const nodeCache = require("node-cache");
const cache = new nodeCache({ StdTTL: 3600 });
module.exports = cache;
