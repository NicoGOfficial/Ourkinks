const templateMigrate = require('../migrations/1674094179618-seed-en-language');

module.exports = async () => {
  await new Promise((resolve) => templateMigrate.up(resolve));
};
