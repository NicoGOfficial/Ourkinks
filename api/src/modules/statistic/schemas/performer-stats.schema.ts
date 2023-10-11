import * as mongoose from 'mongoose';

export const PerformerStatsSchema = new mongoose.Schema({
  performerId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  totalAllLikes: {
    type: Number,
    default: 0
  },
  totalAllComments: {
    type: Number,
    default: 0
  },
  totalMonthlyComments: {
    type: Number,
    default: 0
  },
  totalVideoFavourites: {
    type: Number,
    default: 0
  },
  year: {
    type: Number,
    index: true
  },
  month: {
    type: Number,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'performerstats'
});
