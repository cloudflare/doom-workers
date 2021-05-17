var path = require("path");

module.exports = {
    target: "webworker",
    entry: path.resolve(__dirname, "../site/index.js"),
    mode: "production",
    optimization: { minimize: true },
};
