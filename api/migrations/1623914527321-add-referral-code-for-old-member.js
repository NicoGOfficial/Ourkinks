const { DB, COLLECTION } = require('./lib');

module.exports.up = async function up(next) {
  const performers = await DB.collection(COLLECTION.PERFORMER).find({ referralCode: { $exists: false } }).toArray();
  await performers.reduce(async (lp, performer) => {
    await lp;
    await DB.collection(COLLECTION.PERFORMER).updateOne({ _id: performer._id }, {
      $set: {
        referralCode: Math.random().toString(32).slice(3)
      }
    });
  }, Promise.resolve());
  next();

  const users = await DB.collection(COLLECTION.USER).find({ referralCode: { $exists: false } }).toArray();
  await users.reduce(async (lp, user) => {
    await lp;
    await DB.collection(COLLECTION.USER).updateOne({ _id: user._id }, {
      $set: {
        referralCode: Math.random().toString(32).slice(3)
      }
    });
  }, Promise.resolve());
};

module.exports.down = function down(next) {
  next();
};
