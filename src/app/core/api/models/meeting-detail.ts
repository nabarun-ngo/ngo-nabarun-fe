/* tslint:disable */
/* eslint-disable */
import { MeetingDiscussion } from '../models/meeting-discussion';
import { UserDetail } from '../models/user-detail';
export interface MeetingDetail {
  extAudioConferenceLink?: string;
  extHtmlLink?: string;
  extMeetingId?: string;
  extVideoConferenceLink?: string;
  googleSignInRequired?: boolean;
  googleSignInURL?: string;
  id?: string;
  meetingAttendees?: Array<UserDetail>;
  meetingDescription?: string;
  meetingDiscussions?: Array<MeetingDiscussion>;
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
