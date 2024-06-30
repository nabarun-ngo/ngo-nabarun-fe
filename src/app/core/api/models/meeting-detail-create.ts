/* tslint:disable */
/* eslint-disable */
import { AuthorizationDetail } from '../models/authorization-detail';
import { MeetingDiscussion } from '../models/meeting-discussion';
import { UserDetail } from '../models/user-detail';
export interface MeetingDetailCreate {
  authorization?: AuthorizationDetail;
  draft?: boolean;
  meetingAttendees?: Array<UserDetail>;
  meetingDescription?: string;
  meetingDiscussions?: Array<MeetingDiscussion>;
  meetingEndTime?: string;
  meetingLocation?: string;
  meetingRefId?: string;
  meetingRefType?: 'NOTICE' | 'EVENT';
  meetingRemarks?: string;
  meetingStartTime?: string;
  meetingSummary?: string;
  meetingType?: 'OFFLINE' | 'ONLINE_VIDEO' | 'ONLINE_AUDIO';
}
