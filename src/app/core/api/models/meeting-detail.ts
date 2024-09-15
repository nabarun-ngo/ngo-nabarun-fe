/* tslint:disable */
/* eslint-disable */
import { UserDetail } from '../models/user-detail';
export interface MeetingDetail {
  creatorEmail?: string;
  extAudioConferenceLink?: string;
  extConferenceStatus?: string;
  extHtmlLink?: string;
  extMeetingId?: string;
  extVideoConferenceLink?: string;
  id?: string;
  meetingAttendees?: Array<UserDetail>;
  meetingDate?: string;
  meetingDescription?: string;
  meetingEndTime?: string;
  meetingLocation?: string;
  meetingRefId?: string;
  meetingRefType?: 'NOTICE' | 'EVENT';
  meetingRemarks?: string;
  meetingStartTime?: string;
  meetingStatus?: 'CREATED_L' | 'CREATED_G' | 'FAILED_L' | 'FAILED_G' | 'UPDATED_L' | 'UPDATED_G';
  meetingSummary?: string;
  meetingType?: 'OFFLINE' | 'ONLINE_VIDEO' | 'ONLINE_AUDIO';
}
