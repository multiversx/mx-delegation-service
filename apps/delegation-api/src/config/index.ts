import { envload } from './env_load';
envload();
import config from 'config';
import { CachingConfig } from '../models';
import { GithubConfigurationInterface } from './interfaces/github-configuration.interface';

export const elrondConfig = {
  ...config.get('elrond'),
  elastic: process.env.ELROND_INDEX,
  elrondApi: process.env.ELROND_API,
  gateway: process.env.ELROND_GATEWAY,
  explorer: process.env.ELROND_EXPLORER,
};
/**
 * Caching time config.
 * The values are in seconds
 */
export const cacheConfig: CachingConfig = config.get('caching');

export const getGithubConfiguration = (): GithubConfigurationInterface => {
  const token = process.env.GITHUB_TOKEN;
  if (token == null) {
    throw new Error('GITHUB_TOKEN is not defined');
  }

  const organization = process.env.GITHUB_ORGANIZATION;
  if (organization == null) {
    throw new Error('GITHUB_ORGANIZATION is not defined');
  }

  const assetsRepository = process.env.GITHUB_ASSETS_REPOSITORY;
  if (assetsRepository == null) {
    throw new Error('GITHUB_ASSETS_REPOSITORY is not defined');
  }

  const rawUrl = process.env.GITHUB_RAW_URL;
  if (rawUrl == null) {
    throw new Error('GITHUB_RAW_URL is not defined');
  }

  const apiUrl = process.env.GITHUB_API_URL;
  if (apiUrl == null) {
    throw new Error('GITHUB_API_URL is not defined');
  }

  return {
    token,
    organization,
    assetsRepository,
    rawUrl,
    apiUrl,
  };
};
