import * as mongoose from 'mongoose';

const performerMonthlyStatsSchema = new mongoose.Schema({
  performerId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  year: {
    type: Number,
    index: true
  },
  month: {
    type: Number,
    index: true
  },
  totalEarning: {
    type: Number,
    default: 0
  },
  totalNewSubscriptions: {
    type: Number,
    default: 0
  },
  totalLostSubscriptions: {
    type: Number,
    default: 0
  },
  totalNewVideos: {
    type: Number,
    default: 0
  },
  totalNewFeeds: {
    type: Number,
    default: 0
  },
  totalAllLikes: {
    type: Number,
    default: 0
  },
  totalAllComments: {
    type: Number,
    default: 0
  },
  totalVideoFavourites: {
    type: Number,
    default: 0
  },
  totalTips: {
    type: Number,
    default: 0
  },
  totalStreamingTime: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const PerformerMonthlyStatsSchema = performerMonthlyStatsSchema;
