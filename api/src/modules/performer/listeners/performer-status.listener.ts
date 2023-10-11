import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { PERFORMER_UPDATE_STATUS_CHANNEL, PERFORMER_STATUSES } from 'src/modules/performer/constants';
import { EVENT } from 'src/kernel/constants';
import { MailerService } from 'src/modules/mailer/services';
import { Model } from 'mongoose';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { PerformerService } from '../services';
import { CommissionSettingModel, PerformerModel } from '../models';
import { PERFORMER_COMMISSION_SETTING_MODEL_PROVIDER, PERFORMER_MODEL_PROVIDER } from '../providers';

const PERFORMER_STATUS_TOPIC = 'PERFORMER_STATUS_TOPIC';

@Injectable()
export class UpdatePerformerStatusListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => MailerService))
    private readonly mailService: MailerService,
    private readonly performerService: PerformerService,
    private readonly settingService: SettingService,
    @Inject(PERFORMER_COMMISSION_SETTING_MODEL_PROVIDER)
    private readonly commissionSettingModel: Model<CommissionSettingModel>,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_UPDATE_STATUS_CHANNEL,
      PERFORMER_STATUS_TOPIC,
      this.handleUpdateStatus.bind(this)
    );
  }

  public async handleUpdateStatus(event: QueueEvent) {
    if (![EVENT.UPDATED].includes(event.eventName)) {
      return false;
    }
    const {
      oldStatus, status, email, name, _id
    } = event.data;
    if (oldStatus === PERFORMER_STATUSES.ACTIVE) {
      return false;
    }
    const performer = await this.performerModel.findById(_id);
    if (!performer) return false;
    if (status === PERFORMER_STATUSES.ACTIVE) {
      email && await this.mailService.send({
        subject: 'Your account has been approved',
        to: email,
        data: { name },
        template: 'approved-performer-account'
      });
      if (performer.invitedById && !performer.isPaidRewardForInviter) {
        const inviter = await this.performerService.findById(performer.invitedById);
        if (inviter) {
          await this.performerModel.updateOne({ _id }, { $set: { isPaidRewardForInviter: true } });
          const countReferrals = await this.performerModel.countDocuments({ invitedById: performer.invitedById, isPaidRewardForInviter: true }) || 1;
          await this.performerModel.updateOne({ _id: performer.invitedById }, { $set: { 'stats.referrals': countReferrals } });

          // update commission
          const reducedCommission = 0.01 * (countReferrals > 5 ? 5 : countReferrals);
          const [
            settingMonthlyCommission,
            settingYearlyCommission,
            settingProductCommission,
            settingVideoCommission,
            settingPrivateChatCommission,
            settingTipCommission,
            settingFeedCommission
          ] = await Promise.all([
            this.settingService.getKeyValue(SETTING_KEYS.MONTHLY_SUBSCRIPTION_COMMISSION) || 0.2,
            this.settingService.getKeyValue(SETTING_KEYS.YEARLY_SUBSCRIPTION_COMMISSION) || 0.2,
            this.settingService.getKeyValue(SETTING_KEYS.PRODUCT_SALE_COMMISSION) || 0.2,
            this.settingService.getKeyValue(SETTING_KEYS.VIDEO_SALE_COMMISSION) || 0.2,
            this.settingService.getKeyValue(SETTING_KEYS.PRIVATE_CHAT_COMMISSION) || 0.2,
            this.settingService.getKeyValue(SETTING_KEYS.TOKEN_TIP_COMMISSION) || 0.2,
            this.settingService.getKeyValue(SETTING_KEYS.FEED_SALE_COMMISSION) || 0.2
          ]);
          let commissions = await this.commissionSettingModel.findOne({
            performerId: inviter._id
          });
          if (!commissions) {
            // eslint-disable-next-line new-cap
            commissions = new this.commissionSettingModel();
          }
          commissions.monthlySubscriptionCommission = settingMonthlyCommission - reducedCommission;
          commissions.yearlySubscriptionCommission = settingYearlyCommission - reducedCommission;
          commissions.videoSaleCommission = settingProductCommission - reducedCommission;
          commissions.productSaleCommission = settingVideoCommission - reducedCommission;
          commissions.privateChatCommission = settingPrivateChatCommission - reducedCommission;
          commissions.tokenTipCommission = settingTipCommission - reducedCommission;
          commissions.feedSaleCommission = settingFeedCommission - reducedCommission;
          commissions.performerId = inviter._id;
          commissions.updatedAt = new Date();
          await commissions.save();
        }
      }
    }
    return true;
  }
}
