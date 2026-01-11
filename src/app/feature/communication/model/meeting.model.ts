import { PagedResult } from "src/app/shared/model/paged-result.model";

export type MeetingType = 'ONLINE_VIDEO' | 'ONLINE_AUDIO' | 'OFFLINE';
export type MeetingStatus = 'CREATED_L' | 'CREATED_G' | 'CANCELLED' | 'COMPLETED';

export interface Meeting {
    id?: string;
    meetingSummary?: string;
    meetingDescription?: string;
    meetingType?: MeetingType;
    meetingLocation?: string;
    meetingDate?: string;
    meetingStartTime?: string;
    meetingEndTime?: string;
    meetingStatus?: MeetingStatus;
    meetingAttendees?: any[];
    extMeetingId?: string;
    extHtmlLink?: string;
    extVideoConferenceLink?: string;
    meetingRefId?: string;
    extConferenceStatus?: string;
    creatorEmail?: string;
    noticeId?: string;
}

/**
 * Type alias for paged meeting results
 */
export type PagedMeeting = PagedResult<Meeting>;
