const { DB, COLLECTION } = require('./lib');
const enJson = require('./content/locales/en.json');
const locale = 'en';

module.exports.up = async function (next) {
  await Object.keys(enJson).reduce(async (lp, key) => {
    await lp;

    const item = await DB.collection(COLLECTION.TEXT_TRANS_I18N).findOne({ 
      key,
      locale
    });
    if (!item) {
      await DB.collection(COLLECTION.TEXT_TRANS_I18N).insertOne({ 
        key,
        locale,
        value: enJson[key]
      });
    } else if (!item.value) {
      await DB.collection(COLLECTION.TEXT_TRANS_I18N).updateOne({ _id: item._id }, { 
        key,
        locale,
        value: enJson[key]
      });
    }

    return Promise.resolve();
  }, Promise.resolve());

  next();
}

module.exports.down = function (next) {
  next();
}
