import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { PerformerStatsSchema, PerformerMonthlyStatsSchema } from './schemas';

export const PERFORMER_STATS_PROVIDER = 'PERFORMER_STATS_PROVIDER';

export const PERFORMER_MONTHLY_STATS_PROVIDER = 'PERFORMER_MONTHLY_STATS_PROVIDER';

export const providers = [
  {
    provide: PERFORMER_STATS_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerStats', PerformerStatsSchema),
    inject: [MONGO_DB_PROVIDER]
  },

  {
    provide: PERFORMER_MONTHLY_STATS_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerMonthlyStats', PerformerMonthlyStatsSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
