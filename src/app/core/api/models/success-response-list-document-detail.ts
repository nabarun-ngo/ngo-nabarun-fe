/* tslint:disable */
/* eslint-disable */
import { DocumentDetail } from '../models/document-detail';
export interface SuccessResponseListDocumentDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: Array<DocumentDetail>;
  status?: number;
  timestamp?: string;
}
