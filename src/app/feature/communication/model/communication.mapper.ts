import { Notice, PagedNotice } from "./notice.model";
import { Meeting, PagedMeeting } from "./meeting.model";
import { mapPagedResult } from "src/app/shared/model/paged-result.model";
import { MeetingDto } from "src/app/core/api-client/models";

/**
 * Map domain Notice to API DTO format
 * This is a placeholder - replace with actual DTO when API is available
 */
export function mapNoticeToDto(notice: Partial<Notice>): any {
    return {
        id: notice.id,
        title: notice.title,
        description: notice.description,
        noticeDate: notice.noticeDate,
        noticeStatus: notice.noticeStatus,
        hasMeeting: notice.hasMeeting,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
    };
}

/**
 * Map API DTO to domain Notice
 * This is a placeholder - replace with actual DTO when API is available
 */
export function mapDtoToNotice(dto: any): Notice {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        noticeDate: dto.noticeDate,
        noticeStatus: dto.noticeStatus,
        hasMeeting: dto.hasMeeting,
        meeting: dto.meeting ? mapDtoToMeeting(dto.meeting) : undefined,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

/**
 * Map API DTO to domain Meeting
 */
export function mapDtoToMeeting(dto: MeetingDto): Meeting {
    return {
        id: dto.id,
        agenda: dto.agenda,
        attendees: dto.attendees,
        calendarLink: dto.calendarLink,
        description: dto.description,
        endTime: new Date(dto.endTime),
        location: dto.location,
        meetLink: dto.meetLink,
        outcomes: dto.outcomes,
        startTime: new Date(dto.startTime),
        status: dto.status,
        summary: dto.summary,
        type: dto.type,
        hostEmail: dto.hostEmail,
    };
}


/**
 * Map paged DTO to domain PagedNotice
 */
export function mapPagedDtoToPagedNotice(dto: any): PagedNotice {
    return mapPagedResult(dto, mapDtoToNotice);
}

/**
 * Map paged DTO to domain PagedMeeting
 */
export function mapPagedDtoToPagedMeeting(dto: any): PagedMeeting {
    return mapPagedResult(dto, mapDtoToMeeting);
}
