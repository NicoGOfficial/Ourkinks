const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  REFERRAL_ENABLED: 'referralEnabled',
  INVITE_PERFORMER_COMMISSION: 'invitePerformerCommission'
};

const settings = [
  {
    key: SETTING_KEYS.REFERRAL_ENABLED,
    value: false,
    name: 'Enable/Disable referral program',
    description:
      'Enable/Disable referral program, inviter will not receive any commission if you turn this option off',
    public: true,
    group: 'referral',
    editable: true,
    autoload: true,
    type: 'boolean',
    ordering: 0
  },
  {
    key: SETTING_KEYS.INVITE_PERFORMER_COMMISSION,
    value: 0.19,
    name: 'Invite model starting commission 0.06-0.99 (6%-99%)',
    description:
      'Maximum percent of total money/wallet that inviter receive everytime user spend money to purchase something from invited model, will reduce 1% after intive a model and up to 5 times, after that commission will not be reduced any more',
    public: false,
    group: 'referral',
    editable: true,
    type: 'number',
    meta: {
      min: 0.06,
      max: 1,
      step: 0.01
    },
    ordering: 1
  }
];

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate referral program settings');

  // eslint-disable-next-line no-restricted-syntax
  for (const setting of settings) {
    // eslint-disable-next-line no-await-in-loop
    const checkKey = await DB.collection(COLLECTION.SETTING).findOne({
      key: setting.key
    });
    if (!checkKey) {
      // eslint-disable-next-line no-await-in-loop
      await DB.collection(COLLECTION.SETTING).insertOne({
        ...setting,
        type: setting.type || 'text',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log('Migrate referral program done');
  next();
};

module.exports.down = function down(next) {
  next();
};
