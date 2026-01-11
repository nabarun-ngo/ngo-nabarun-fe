import { Notice, PagedNotice } from "./notice.model";
import { Meeting, PagedMeeting } from "./meeting.model";
import { mapPagedResult } from "src/app/shared/model/paged-result.model";

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
        meeting: notice.meeting ? mapMeetingToDto(notice.meeting) : undefined,
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
 * Map domain Meeting to API DTO format
 */
export function mapMeetingToDto(meeting: Partial<Meeting>): any {
    return {
        id: meeting.id,
        meetingSummary: meeting.meetingSummary,
        meetingDescription: meeting.meetingDescription,
        meetingType: meeting.meetingType,
        meetingLocation: meeting.meetingLocation,
        meetingDate: meeting.meetingDate,
        meetingStartTime: meeting.meetingStartTime,
        meetingEndTime: meeting.meetingEndTime,
        meetingStatus: meeting.meetingStatus,
        meetingAttendees: meeting.meetingAttendees,
        extMeetingId: meeting.extMeetingId,
        extHtmlLink: meeting.extHtmlLink,
        extVideoConferenceLink: meeting.extVideoConferenceLink,
        meetingRefId: meeting.meetingRefId,
        extConferenceStatus: meeting.extConferenceStatus,
        creatorEmail: meeting.creatorEmail,
        noticeId: meeting.noticeId,
    };
}

/**
 * Map API DTO to domain Meeting
 */
export function mapDtoToMeeting(dto: any): Meeting {
    return {
        id: dto.id,
        meetingSummary: dto.meetingSummary,
        meetingDescription: dto.meetingDescription,
        meetingType: dto.meetingType,
        meetingLocation: dto.meetingLocation,
        meetingDate: dto.meetingDate,
        meetingStartTime: dto.meetingStartTime,
        meetingEndTime: dto.meetingEndTime,
        meetingStatus: dto.meetingStatus,
        meetingAttendees: dto.meetingAttendees,
        extMeetingId: dto.extMeetingId,
        extHtmlLink: dto.extHtmlLink,
        extVideoConferenceLink: dto.extVideoConferenceLink,
        meetingRefId: dto.meetingRefId,
        extConferenceStatus: dto.extConferenceStatus,
        creatorEmail: dto.creatorEmail,
        noticeId: dto.noticeId,
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
