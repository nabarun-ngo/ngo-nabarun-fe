import { PagedResult } from "src/app/shared/model/paged-result.model";

export type ActivityPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ActivityScale = 'TASK' | 'ACTIVITY' | 'EVENT';
export type ActivityStatus = 'PLANNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD' | 'POSTPONED';
export type ActivityType = 'TRAINING' | 'AWARENESS' | 'DISTRIBUTION' | 'SURVEY' | 'MEETING' | 'FIELD_VISIT' | 'DOCUMENTATION' | 'WORKSHOP' | 'SEMINAR' | 'FUNDRAISING' | 'VOLUNTEER_ACTIVITY' | 'CONFERENCE' | 'EXHIBITION' | 'OTHER';

export interface ProjectActivity {
    id: string;
    name: string;
    description?: string;
    projectId: string;
    type: ActivityType;
    scale: ActivityScale;
    priority: ActivityPriority;
    status: ActivityStatus;
    startDate?: string;
    endDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    location?: string;
    venue?: string;
    estimatedCost?: number;
    actualCost?: number;
    currency?: string;
    expectedParticipants?: number;
    actualParticipants?: number;
    assignedTo?: string;
    organizerId?: string;
    parentActivityId?: string;
    tags: string[];
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

/**
 * Type alias for paged activity results
 */
export type PagedActivity = PagedResult<ProjectActivity>;
