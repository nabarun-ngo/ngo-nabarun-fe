/* tslint:disable */
/* eslint-disable */
import { MeetingDetail } from '../models/meeting-detail';
import { UserDetail } from '../models/user-detail';
export interface NoticeDetail {
  creator?: UserDetail;
  creatorRoleCode?: string;
  description?: string;
  hasMeeting?: boolean;
  id?: string;
  meeting?: MeetingDetail;
  noticeDate?: string;
  noticeStatus?: 'ACTIVE' | 'EXPIRED' | 'DRAFT';
  publishDate?: string;
  title?: string;
}
