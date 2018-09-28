const config = {
  dev: process.env.LOCAL,
  stage: process.env.STAGE,
  prod: process.env.PRODUCTION,
  endpoint: {
    stats: "/request/stats",
  },
};

module.exports = config;
