import { PagedResult } from "src/app/shared/model/paged-result.model";

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
export type TaskType = 'AUTOMATIC' | 'MANUAL';
export type TaskAssignmentStatus = 'PENDING' | 'ACCEPTED' | 'REMOVED' | 'REJECTED' | 'DELETED';

export interface TaskAssignment {
    id: string;
    taskId: string;
    assignedToId: string;
    assignedToName: string;
    status: TaskAssignmentStatus;
    acceptedAt?: string;
    completedAt?: string;
    notes?: string;
    roleName?: string | null;
}

export interface Task {
    workflowId: any;
    id: string;
    taskId: string;
    stepId: string;
    name: string;
    description?: string | null;
    status: TaskStatus;
    type: TaskType;
    handler?: string;
    jobId?: string;
    assignedToId?: string;
    assignedToName?: string;
    completedById?: string;
    completedByName?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    remarks?: string;
    checklist?: string[];
    resultData?: any;
    assignments: TaskAssignment[];
}

export type PagedTask = PagedResult<Task>;
