const { DB, COLLECTION } = require('./lib');

module.exports.up = async function (next) {
  const checkKey = await DB.collection(COLLECTION.SETTING).findOne({
    key: 'languages'
  });
  if (!checkKey) {
    await DB.collection(COLLECTION.SETTING).insertOne({
      key: 'languages',
      group: 'multilingual',
      name: 'Languages',
      description: 'Select languages to show in FE selection.',
      value: ['us'],
      type: 'select',
      editable: true,
      public: true,
      visible: true,
      autoload: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ordering: 0
    });
  }
  next()
}

module.exports.down = function (next) {
  next()
}
