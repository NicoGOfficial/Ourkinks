export interface IPaymentToken {
  _id: string;
  originalPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  products: any;
  sourceId: string;
  sourceInfo: any;
  targetId: string;
  targetInfo: any;
  type: string;
  status: string;
}
