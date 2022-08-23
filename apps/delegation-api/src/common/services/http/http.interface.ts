import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface HttpInterface {
  endpoints: {[key: string]: string};
  getConfig: () => AxiosRequestConfig;

  get?<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post?<T = any>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete?<T = any>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>>
}
