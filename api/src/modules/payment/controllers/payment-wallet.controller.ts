import {
  Injectable,
  Post,
  HttpCode,
  HttpStatus,
  Controller,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param,
  Body
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { Roles, CurrentUser } from 'src/modules/auth/decorators';
import { DataResponse } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import {
  PurchaseProductsPayload,
  PurchaseSinglePhotoPayload,
  PurchaseVideoPayload,
  SendTipsPayload,
  PurchaseFeedPayload,
  TipFeedPayload
} from '../payloads';
import { OrderService, PaymentWalletService } from '../services';

@Injectable()
@Controller('payment-wallet')
export class PaymentWalletController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentWalletService: PaymentWalletService
  ) { }

  @Post('/send-tip-wallet/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async sendTips(
    @CurrentUser() user: UserDto,
    @Param('id') id: string,
    @Body() payload: SendTipsPayload
  ): Promise<DataResponse<any>> {
    const data = await this.paymentWalletService.sendTips(user, id, payload);
    return DataResponse.ok(data);
  }

  @Post('/tip-feed')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async tipFeed(
    @CurrentUser() user: UserDto,
    @Body() payload: TipFeedPayload
  ): Promise<DataResponse<any>> {
    const data = await this.paymentWalletService.tipFeed(user, payload);
    return DataResponse.ok(data);
  }

  @Post('/send-private-chat/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async sendPaidToken(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const info = await this.paymentWalletService.payPrivateChat(user, id);
    return DataResponse.ok(info);
  }

  /**
   * purchase a performer video
   * @param user current login user
   * @param videoId performer video
   * @param payload
   */
  @Post('/purchase-video')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async purchaseVideo(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseVideoPayload
  ): Promise<DataResponse<any>> {
    // eslint-disable-next-line no-param-reassign
    payload.paymentGateway = 'wallet';
    const order = await this.orderService.createFromPerformerVOD(payload, user);
    const info = await this.paymentWalletService.purchaseWalletFromOrder(order);
    return DataResponse.ok(info);
  }

  @Post('/purchase-products')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async purchaseProducts(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseProductsPayload
  ): Promise<DataResponse<any>> {
    // eslint-disable-next-line no-param-reassign
    payload.paymentGateway = 'wallet';
    const order = await this.orderService.createFromPerformerProducts(payload, user);
    const info = await this.paymentWalletService.purchaseWalletFromOrder(order);
    return DataResponse.ok(info);
  }

  @Post('/purchase-single-photo')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async purchaseSinglePhoto(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseSinglePhotoPayload
  ): Promise<DataResponse<any>> {
    // eslint-disable-next-line no-param-reassign
    payload.paymentGateway = 'wallet';
    const order = await this.orderService.createFromPerformerSinglePhoto(payload, user);
    const info = await this.paymentWalletService.purchaseWalletFromOrder(order);
    return DataResponse.ok(info);
  }

  /**
   * purchase a performer feed
   * @param user current login user
   * @param feedId performer feed
   * @param payload
   */
  @Post('/purchase-feed')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseFeed(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseFeedPayload
  ): Promise<DataResponse<any>> {
    // eslint-disable-next-line no-param-reassign
    payload.paymentGateway = 'wallet';
    const order = await this.orderService.createFromPerformerFeed(payload, user);
    const info = await this.paymentWalletService.purchaseWalletFromOrder(order);
    return DataResponse.ok(info);
  }

  @Post('/purchase-message/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async userBuysMessagesById(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const resp = await this.paymentWalletService.userBuysMessagesById(id, user);
    return DataResponse.ok(resp);
  }
}
