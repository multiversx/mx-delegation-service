import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Injectable } from '@nestjs/common';

/**
 * Wrapper for axios
 */
@Injectable()
export class HttpService {
  /**
   * Axios instance
   */
  public axiosInstance: AxiosInstance;

  /**
   * Create a new instance for the received url
   */
  constructor() {
    this.setup();
  }

  /**
   * Method used to create axios instance
   */
  private setup() {
    this.axiosInstance = axios.create();
    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: retryCount => {
        return retryCount * 500;
      },
    });
  }

  /**
   * Get request
   * @param url
   * @param config
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return await this.axiosInstance.get<T, R>(url, this.configWithURL(config));
  }

  /**
   * Post Request
   * @param url
   * @param data
   * @param config
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T = any, R = AxiosResponse<T>>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return await this.axiosInstance.post<T, R>(url, data, this.configWithURL(config));
  }

  /**
   * Post Request
   * @param url
   * @param data
   * @param config
   */
  async delete<T, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return await this.axiosInstance.delete<T, R>(url, {
      data,
      ...config,
    });
  }

  /**
   * Head request
   * @param url
   * @param config
   */
  head<T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ) {
    return this.axiosInstance.head<T, R>(url, this.configWithURL(config));
  }

  /**
   * Update config to include the correct baseURL based on context network
   * @param config
   */
  private configWithURL(config?: AxiosRequestConfig): AxiosRequestConfig {
    const baseURL = config?.baseURL;
    return {
      ...config,
      baseURL,
      transformResponse: [
        (data) => {
          try {
            return JSON.parse(data);
          } catch (e) {
            return data;
          }
        },
      ],
    };
  }

  private static getHostname(url: string): string {
    return new URL(url).hostname;
  }
}
