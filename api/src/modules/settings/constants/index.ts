export const SETTING_CHANNEL = 'SETTINGS';

export const SETTING_KEYS = {
  SITE_NAME: 'siteName',
  LOGO_URL: 'logoUrl',
  FAVICON: 'favicon',
  LOGIN_PLACEHOLDER_IMAGE: 'loginPlaceholderImage',
  REQUIRE_EMAIL_VERIFICATION: 'requireEmailVerification',
  ADMIN_EMAIL: 'adminEmail',
  SENDER_EMAIL: 'senderEmail',
  META_KEYWORDS: 'metaKeywords',
  META_DESCRIPTION: 'metaDescription',
  HEADER_SCRIPT: 'headerScript',
  AFTER_BODY_SCRIPT: 'afterBodyScript',
  MONTHLY_SUBSCRIPTION_COMMISSION: 'monthlySubscriptionCommission',
  YEARLY_SUBSCRIPTION_COMMISSION: 'yearlySubscriptionCommission',
  VIDEO_SALE_COMMISSION: 'videoSaleCommission',
  PRODUCT_SALE_COMMISSION: 'productSaleCommission',
  ENABLE_CCBILL: 'ccbillEnabled',
  FEED_SALE_COMMISSION: 'feedSaleCommission',
  CCBILL_SUB_ACCOUNT_NUMBER: 'ccbillSubAccountNumber',
  CCBILL_FLEXFORM_ID: 'ccbillFlexformId',
  CCBILL_SALT: 'ccbillSalt',
  CCBILL_CURRENCY_CODE: 'ccbilCurrencyCode',
  USE_SENDGRID_TRANSPORTER: 'useSengridTransporter',
  SMTP_TRANSPORTER: 'smtpTransporter',
  GOOGLE_ANALYTICS_CODE: 'gaCode',
  MAINTENANCE_MODE: 'maintenanceMode',
  CCBILL_CLIENT_ACCOUNT_NUMBER: 'ccbillClientAccountNumber',
  CCBILL_DATALINK_USERNAME: 'ccbillDatalinkUsername',
  CCBILL_DATALINK_PASSWROD: 'ccbillDatalinkPassword',
  PRIVATE_C2C_DEFAULT_PRICE: 'privateC2CDefaultPrice',
  PRIVATE_CHAT_COMMISSION: ' privateChatDefaultCommission',
  TOKEN_TIP_COMMISSION: 'tokenTipCommission',
  VIEWER_URL: 'viewerURL',
  PUBLISHER_URL: 'publisherURL',
  SUBSCRIBER_URL: 'subscriberUrl',
  OPTION_FOR_BROADCAST: 'optionForBroadcast',
  OPTION_FOR_PRIVATE: 'optionForPrivate',
  SECURE_OPTION: 'secureOption',
  ANT_MEDIA_API_ENDPOINT: 'AntMediaApiEndpoint',
  ANT_MEDIA_APPNAME: 'AntMediaAppname',
  FOOTER_CONTENT: 'footerContent',
  USER_BENEFIT: 'userBenefit',
  MODEL_BENEFIT: 'modelBenefit',

  // verotel configuration
  VEROTEL_SHOP_ID: 'verotelShopId',
  VEROTEL_FLEXPAY_SIGNATURE_KEY: 'verotelFlexpaySignatureKey',
  VEROTEL_API_VERSION: 'verotelApiVersion',
  VEROTEL_CURRENCY: 'verotelCurrency',
  VEROTEL_ENABLED: 'verotelEnabled',
  VEROTEL_TEST_MODE: 'verotelTestMode',

  SEND_MODEL_ONBOARD_INSTRUCTION: 'sendModelOnboardInstruction',
  REQUIRE_EMAIL_VERIFICATION_USER: 'requireEmailVerificationUser',
  REQUIRE_EMAIL_VERIFICATION_PERFORMER: 'requireEmailVerificationPerformer',

  ENABLE_MODEL_RANKING_HOME_PAGE: 'enableModelRankingHomePage',

  // watermark feature
  WATERMARK_ENABLED: 'watermarkEnabled',
  WATERMARK_TEXT_PATTERN: 'watermarkTextPattern',
  WATERMARK_OPACITY: 'watermarkOpacity',
  WATERMARK_COLOR: 'watermarkColor',
  WATERMARK_FONT_SIZE: 'watermarkFontSize',
  WATERMARK_BOTTOM: 'watermarkBottom',
  WATERMARK_TOP: 'watermarkTop',
  WATERMARK_LEFT: 'watermarkLeft',
  WATERMARK_ALIGN: 'watermarkAlign',
  WATERMARK_FILE: 'watermarkFile',

  CURRENCY_EXCHANGE_API_KEY: 'currencyExchangeApiKey',

  // referral program
  INVITE_MODEL_REWARD: 'inviteModelReward',
  INVITE_USER_REWARD: 'inviteUserReward',

  // for social connect
  // consummer key
  TWITTER_CONNECT_CLIENT_ID: 'twitterConnectClientId',
  // consumer secret
  TWITTER_CONNECT_CLIENT_SECRET: 'twitterConnectClientSecret',
  TWITTER_CALLBACK_URL: 'twitterCallbackUrl',

  MAX_WALLET_TOPUP_AMOUNT: 'maxWalletTopupAmount',

  CURRENCY_CONVERSTION_API_ENDPOINT: 'currencyConversionApiEndpoint',
  CURRENCY_CONVERSTION_API_KEY: 'currencyConversionApiKey',
  CURRENCY_CONVERSTION_BASE_CURRENCY: 'currencyConversionBaseCurrency',

  // referral
  REFERRAL_ENABLED: 'referralEnabled',
  OPTION_FOR_REFERRAL: 'optionForReferral',
  INVITE_USER_FLAT_FEE: 'inviteUserFlatFee',
  INVITE_PERFORMER_FLAT_FEE: 'invitePerformerFlatFee',
  INVITE_USER_COMMISSION: 'inviteUserCommission',
  INVITE_PERFORMER_COMMISSION: 'invitePerformerCommission'
};

export const MENU_SECTION = {
  MAIN: 'main',
  HEADER: 'header',
  FOOTER: 'footer'
};

export const WHITELIST_IPS = [
  // local IP
  '127.0.0.1', '0.0.0.1', '0.0.0.0', '::1', '::ffff:'
];
