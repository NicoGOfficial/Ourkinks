const routes = require('next-routes');

export default routes()
  .add('account', '/model/account', '/model/account')
  .add('live', '/live', '/model/live')
  .add('public-stream', '/stream/:username', '/stream')
  .add(
    'user-private-chat',
    '/stream/privatechat/:username',
    '/stream/privatechat'
  )
  .add(
    'webrtc-user-private-chat',
    '/stream/webrtc/privatechat/:username',
    '/stream/webrtc/privatechat'
  )
  .add(
    'model-private-chat',
    '/model/live/privatechat/:id',
    '/model/live/privatechat'
  )
  .add(
    'webrtc-model-private-chat',
    '/model/live/webrtc/privatechat/:id',
    '/model/live/webrtc/privatechat'
  )
  .add('banking', '/model/banking', '/model/banking')
  .add('my-gallery', '/model/my-gallery', '/model/my-gallery')
  .add('product-orders', '/model/product-orders', '/model/product-orders')
  .add('store-manager', '/model/my-store', '/model/my-store')
  .add('video-manager', '/model/my-video', '/model/my-video')
  .add('my-subscriber', '/model/my-subscriber', '/model/my-subscriber')
  .add('statistical', '/model/statistical', '/model/statistical')
  .add('monthly-trends', '/model/monthly-trends', '/model/monthly-trends')
  .add('earning', '/model/earning', '/model/earning')
  .add('payout-request', '/model/payout-request', '/model/payout-request')
  .add('back-list', '/model/black-list', '/model/black-list')
  .add('violations-reported', '/model/violations-reported', '/model/violations-reported')
  .add('model', '/model/:username', '/model/profile')
  .add('video', '/video/:id', '/video')
  .add('gallery', '/gallery/:id', '/gallery')
  .add('product', '/store/:id', '/store/details')
  .add('page', '/page/:id', '/page');
