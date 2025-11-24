export class MultiversXApiAboutFeatures {
  updateCollectionExtraDetails: boolean;
  marketplace: boolean;
  exchange: boolean;
  dataApi: boolean;
  stakingV5: boolean;
  stakingV5ActivationEpoch: number;
}

export class MultiversXApiAbout {
  appVersion: string;
  pluginsVersion: string;
  network: string;
  cluster: string;
  version: string;
  indexerVersion: string;
  gatewayVersion: string;
  scamEngineVersion: string;

  features: MultiversXApiAboutFeatures;
}
