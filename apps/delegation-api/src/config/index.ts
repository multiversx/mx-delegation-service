import {envload} from './env_load';
envload();
import config from 'config';
import { CachingConfig } from '../models';

export const elrondConfig = {
  ...config.get('elrond'),
  elastic: process.env.ELROND_INDEX,
  elrondApi: process.env.ELROND_API,
  gateway: process.env.ELROND_GATEWAY,
  explorer: process.env.ELROND_EXPLORER,
}
/**
 * Caching time config.
 * The values are in seconds
 */
export const cacheConfig: CachingConfig = config.get('caching');
