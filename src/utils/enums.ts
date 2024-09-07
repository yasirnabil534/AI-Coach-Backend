const loginType = {
  REFRESH: 'refresh',
  EMAIL: 'email',
};

const userType = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  USER: 'user',
};

const otpStatus = {
  UNUSED: 0,
  USED: 1,
  CANCELED: 2,
};

const currency = {
  USD: 'usd',
  GBP: 'gbp',
  EUR: 'eur',
  AUD: 'aud',
  CAD: 'cad',
  INR: 'inr',
  JPY: 'jpy',
  CHF: 'chf',
  MXN: 'mxn',
  NZD: 'nzd',
  ZAR: 'zar',
  SGD:'sgd',
  TRY: 'try',
  BRL: 'brl',
  BDT: 'bdt',
};

const paymentInterval = {
  DAILY: 'day',
  WEEKLY: 'week',
  MONTHLY: 'month',
  ANNUAL: 'year',
};

const rank = {
  [userType.SUPER_ADMIN]: 50,
  [userType.ADMIN]: 30,
  [userType.USER]: 10,
};

export {
  loginType,
  userType,
  otpStatus,
  currency,
  paymentInterval,
  rank,
};
