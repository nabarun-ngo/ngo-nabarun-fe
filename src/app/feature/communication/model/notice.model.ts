import { PagedResult } from "src/app/shared/model/paged-result.model";
import { Meeting } from "./meeting.model";

export type NoticeStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface Notice {
    id: string;
    title: string;
    description: string;
    noticeDate: string;
    noticeStatus?: NoticeStatus;
    hasMeeting?: boolean;
    meeting?: Meeting;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Type alias for paged notice results
 */
export type PagedNotice = PagedResult<Notice>;
