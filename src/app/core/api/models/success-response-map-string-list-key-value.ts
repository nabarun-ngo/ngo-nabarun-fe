/* tslint:disable */
/* eslint-disable */
import { KeyValue } from '../models/key-value';
export interface SuccessResponseMapStringListKeyValue {
  info?: string;
  messages?: Array<string>;
  responsePayload?: {
[key: string]: Array<KeyValue>;
};
  status?: number;
  timestamp?: string;
}
