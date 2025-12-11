import { registerEnumType } from '@nestjs/graphql';

export enum CurrenciesEnum {
  // --- Arab Countries ---
  EGP = 'egp', // Egypt
  SAR = 'sar', // Saudi Arabia
  AED = 'aed', // UAE
  KWD = 'kwd', // Kuwait
  QAR = 'qar', // Qatar
  BHD = 'bhd', // Bahrain
  OMR = 'omr', // Oman
  DZD = 'dzd', // Algeria
  MAD = 'mad', // Morocco
  TND = 'tnd', // Tunisia
  LYD = 'lyd', // Libya
  SDG = 'sdg', // Sudan
  SOS = 'sos', // Somalia
  DJF = 'djf', // Djibouti
  KMF = 'kmf', // Comoros
  MRU = 'mru', // Mauritania
  YER = 'yer', // Yemen
  SYP = 'syp', // Syria
  IQD = 'iqd', // Iraq
  LBP = 'lbp', // Lebanon
  ILS = 'ils', // Palestine/Israel (used in Palestine)

  // --- Europe ---
  EUR = 'eur', // Eurozone
  GBP = 'gbp', // United Kingdom
  CHF = 'chf', // Switzerland
  NOK = 'nok', // Norway
  SEK = 'sek', // Sweden
  DKK = 'dkk', // Denmark
  PLN = 'pln', // Poland
  HUF = 'huf', // Hungary
  CZK = 'czk', // Czech Republic
  RON = 'ron', // Romania
  BGN = 'bgn', // Bulgaria
  HRK = 'hrk', // Croatia (now EUR)
  RSD = 'rsd', // Serbia
  BAM = 'bam', // Bosnia & Herzegovina
  MKD = 'mkd', // North Macedonia
  ALL = 'all', // Albania
  ISK = 'isk', // Iceland
  RUB = 'rub', // Russia
  BYN = 'byn', // Belarus
  UAH = 'uah', // Ukraine
  MDL = 'mdl', // Moldova
  GEL = 'gel', // Georgia
  AMD = 'amd', // Armenia

  // --- Africa ---
  NGN = 'ngn', // Nigeria – Naira
  GHS = 'ghs', // Ghana – Cedi
  KES = 'kes', // Kenya – Shilling
  UGX = 'ugx', // Uganda – Shilling
  TZS = 'tzs', // Tanzania – Shilling
  ZMW = 'zmw', // Zambia – Kwacha
  ZWL = 'zwl', // Zimbabwe – Dollar
  XOF = 'xof', // West African CFA Franc
  XAF = 'xaf', // Central African CFA Franc
  MUR = 'mur', // Mauritius – Rupee
  SCR = 'scr', // Seychelles – Rupee
  NAD = 'nad', // Namibia – Dollar
  BWP = 'bwp', // Botswana – Pula
  ETB = 'etb', // Ethiopia – Birr

  // --- Asia ---
  INR = 'inr', // India – Rupee
  PKR = 'pkr', // Pakistan – Rupee
  BDT = 'bdt', // Bangladesh – Taka
  LKR = 'lkr', // Sri Lanka – Rupee
  NPR = 'npr', // Nepal – Rupee
  MVR = 'mvr', // Maldives – Rufiyaa
  CNY = 'cny', // China – Yuan
  JPY = 'jpy', // Japan – Yen
  KRW = 'krw', // South Korea – Won
  VND = 'vnd', // Vietnam – Dong
  THB = 'thb', // Thailand – Baht
  MYR = 'myr', // Malaysia – Ringgit
  SGD = 'sgd', // Singapore – Dollar
  PHP = 'php', // Philippines – Peso
  IDR = 'idr', // Indonesia – Rupiah
  MNT = 'mnt', // Mongolia – Tugrik
  KZT = 'kzt', // Kazakhstan – Tenge
  UZS = 'uzs', // Uzbekistan – Som
  TMT = 'tmt', // Turkmenistan – Manat
  AZN = 'azn', // Azerbaijan – Manat
  AFN = 'afn', // Afghanistan – Afghani
  IRR = 'irr', // Iran – Rial

  // --- Americas ---
  USD = 'usd', // United States – Dollar
  CAD = 'cad', // Canada – Dollar
  MXN = 'mxn', // Mexico – Peso
  BRL = 'brl', // Brazil – Real
  ARS = 'ars', // Argentina – Peso
  CLP = 'clp', // Chile – Peso
  COP = 'cop', // Colombia – Peso
  PEN = 'pen', // Peru – Sol
  BOB = 'bob', // Bolivia – Boliviano
  PYG = 'pyg', // Paraguay – Guarani
  UYU = 'uyu', // Uruguay – Peso
  VES = 'ves', // Venezuela – Bolívar
  DOP = 'dop', // Dominican Republic – Peso
  HTG = 'htg', // Haiti – Gourde
  JMD = 'jmd', // Jamaica – Dollar
  TTD = 'ttd', // Trinidad & Tobago – Dollar
  BSD = 'bsd', // Bahamas – Dollar
  BBD = 'bbd', // Barbados – Dollar
  XCD = 'xcd', // East Caribbean Dollar

  // --- Oceania ---
  AUD = 'aud', // Australia – Dollar
  NZD = 'nzd', // New Zealand – Dollar
  FJD = 'fjd', // Fiji – Dollar
  PGK = 'pgk', // Papua New Guinea – Kina
  WST = 'wst', // Samoa – Tala
  TOP = 'top', // Tonga – Paʻanga
  VUV = 'vuv', // Vanuatu – Vatu
  SBD = 'sbd', // Solomon Islands – Dollar
}

registerEnumType(CurrenciesEnum, { name: 'CurrenciesEnum' });
