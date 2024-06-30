/* tslint:disable */
/* eslint-disable */
import { MeetingDetail } from '../models/meeting-detail';
export interface NoticeDetail {
  creatorName?: string;
  creatorRole?: string;
  creatorRoleCode?: string;
  description?: string;
  id?: string;
  meeting?: MeetingDetail;
  noticeDate?: string;
  noticeNumber?: string;
  publishDate?: string;
  title?: string;
}
