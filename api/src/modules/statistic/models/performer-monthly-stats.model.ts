import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PerformerMonthlyStatsModel extends Document {
  performerId: ObjectId;

  year: number;

  monthly: number;

  type: string;

  totalEarning: number;

  totalNewSubscriptions: number;

  totalLostSubscriptions: number;

  totalNewVideos: number;

  totalNewFeeds: number;

  totalAllLikes: number;

  totalAllComments: number;

  totalVideoFavourites: number;

  totalTips: number;

  totalStreamingTime: number;

  createdAt?: Date;

  updatedAt: Date;
}
