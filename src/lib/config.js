const config = {
  DEV: process.env.DEVELOPMENT,
  QA: process.env.QA,
  UAT: process.env.UAT,
  PRODUCTION: process.env.PRODUCTION,
  endpoint: {
    stats: "/request/stats",
  },
};

module.exports = config;
