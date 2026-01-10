import { PagedResult } from "src/app/shared/model/paged-result.model";
import { Task } from "./task.model";

export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface WorkflowStep {
    id: string;
    stepId: string;
    name: string;
    description?: string | null;
    status: StepStatus;
    orderIndex: number;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    remarks?: string;
    tasks?: Task[];
}

export interface WorkflowRequest {
    id: string;
    type: string;
    description: string;
    status: RequestStatus;
    initiatedById?: string;
    initiatedByName?: string;
    initiatedForId?: string;
    initiatedForName?: string;
    currentStepId?: string | null;
    requestData: any;
    resultData?: any;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    remarks?: string;
    steps: WorkflowStep[];
}


/**
 * Type alias for paged expense results
 */
export type PagedRequest = PagedResult<WorkflowRequest>;
