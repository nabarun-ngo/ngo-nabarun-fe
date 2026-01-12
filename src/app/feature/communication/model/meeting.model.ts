import { PagedResult } from "src/app/shared/model/paged-result.model";

export interface MeetingParticipant {
    email: string;
    name: string;
}
export interface Meeting {
    agenda?: string;
    attendees?: Array<MeetingParticipant>;
    calendarLink: string;
    description?: string;
    endTime: string;
    id: string;
    location?: string;
    meetLink?: string;
    outcomes?: string;
    startTime: string;
    status: string;
    summary: string;
    type: 'OFFLINE' | 'ONLINE';
}

/**
 * Type alias for paged meeting results
 */
export type PagedMeeting = PagedResult<Meeting>;
