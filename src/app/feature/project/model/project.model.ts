import { PagedResult } from "src/app/shared/model/paged-result.model";

export type ProjectCategory = 'EDUCATION' | 'HEALTH' | 'ENVIRONMENT' | 'RURAL_DEVELOPMENT' | 'WOMEN_EMPOWERMENT' | 'CHILD_WELFARE' | 'DISASTER_RELIEF' | 'OTHER';
export type ProjectPhase = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSURE';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface Project {
    id: string;
    code: string;
    name: string;
    description: string;
    category: ProjectCategory;
    phase: ProjectPhase;
    status: ProjectStatus;
    budget: number;
    spentAmount: number;
    currency: string;
    startDate: string;
    endDate?: string;
    actualEndDate?: string;
    location?: string;
    managerId: string;
    sponsorId?: string;
    targetBeneficiaryCount?: number;
    actualBeneficiaryCount?: number;
    tags: string[];
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

/**
 * Type alias for paged project results
 */
export type PagedProject = PagedResult<Project>;
