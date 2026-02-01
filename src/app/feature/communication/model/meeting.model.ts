import { PagedResult } from "src/app/shared/model/paged-result.model";

export interface MeetingParticipant {
    id?: string;
    email: string;
    name?: string;
    attended?: string;
}

export interface AgendaItem {
    agenda: string;
    outcomes?: string;
}

export interface Meeting {
    agenda?: AgendaItem[];
    attendees?: Array<MeetingParticipant>;
    calendarLink: string;
    description?: string;
    endTime: Date;
    id: string;
    location?: string;
    meetLink?: string;
    outcomes?: string;
    startTime: Date;
    meetingDate?: Date;
    status: string;
    summary: string;
    type: 'OFFLINE' | 'ONLINE';
    hostEmail?: string;
}

export function formatMeetingDate(date: Date | string, time: string | Date): string {
    if (time instanceof Date) {
        return time.toISOString();
    }
    const combinedDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate.toISOString();
}

/**
 * Type alias for paged meeting results
 */
export type PagedMeeting = PagedResult<Meeting>;
