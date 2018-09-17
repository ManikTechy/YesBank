"use strict";

const configFile = require(`${process.cwd()}/src/jeans/tasks/.jeans.js`);

module.exports = {
  srcFolder: configFile.srcFolder || "src",
};
