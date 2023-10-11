export interface ISettings {
  verotelEnabled: boolean;
  ccbillEnabled: boolean;
  cookiePolicyEnabled: boolean;
  cookiePolicyContentId: string;
  maintenanceMode: boolean;
  popup18Enabled: boolean;
  popup18ContentId: string;
  contactContentId: string;
  metaDescription: string;
  metaKeywords: string;
  currency: string;
  symbol: string;
  rate: number;
  maxWalletTopupAmount: number;
  referralEnabled: boolean;
}

export interface IContact {
  email: string;
  message: any;
  name: string;
}

export interface IError {
  statusCode: number;
  message: string;
}
