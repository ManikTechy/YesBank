"use strict";

const fs = require("fs");
const config = require("./config");
const jeans = require(`${process.cwd()}/.jeans.js`);

module.exports = options => {
  if (options.onlyDeployableTargets) {
    const serviceDirectory = config.servicesLocation;
    let serviceNames = [];
    if (serviceDirectory) {
      const files = fs.readdirSync(serviceDirectory);
      serviceNames = files.filter(file =>
        fs.statSync(`${serviceDirectory}/${file}`).isDirectory()
      );
    } else {
      serviceNames = jeans.services;
    }
    return serviceNames;
  }
  const srcDirectory = config.srcFolder;
  let serviceNames = [];
  if (srcDirectory) {
    const files = fs.readdirSync(srcDirectory);
    serviceNames = files.filter(file =>
      fs.statSync(`${srcDirectory}/${file}`).isDirectory()
    );
  }
  return serviceNames;
};
