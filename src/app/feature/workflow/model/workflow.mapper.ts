import { WorkflowInstanceDto, WorkflowStepDto, WorkflowTaskDto, TaskAssignmentDto, PagedResultWorkflowInstanceDto, PagedResultWorkflowTaskDto } from "src/app/core/api-client/models";
import { PagedRequest, WorkflowRequest, WorkflowStep } from "./request.model";
import { PagedTask, Task, TaskAssignment } from "./task.model";
import { mapPagedResult } from "src/app/shared/model/paged-result.model";


//##########################
// REQUEST MAPPERS
// ##########################

/**
 * Map API WorkflowStepDto to domain WorkflowStep
 * @param dto 
 * @returns 
 */
export function mapToWorkflowStepDtoToWorkflowStep(dto: WorkflowStepDto): WorkflowStep {
    return {
        id: dto.id,
        stepId: dto.stepId,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        orderIndex: dto.orderIndex,
        startedAt: dto.startedAt,
        completedAt: dto.completedAt,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        remarks: dto.remarks
    };
}

/**
 * Map API WorkflowInstanceDto to domain WorkflowRequest
 * @param dto 
 * @returns 
 */
export function mapToWorkflowInstanceDtoToWorkflowRequest(dto: WorkflowInstanceDto): WorkflowRequest {
    return {
        id: dto.id,
        type: dto.type,
        description: dto.description,
        status: dto.status,
        initiatedById: dto.initiatedById,
        initiatedByName: dto.initiatedByName,
        initiatedForId: dto.initiatedForId,
        initiatedForName: dto.initiatedForName,
        currentStepId: dto.currentStepId,
        requestData: dto.requestData,
        resultData: dto.resultData,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        completedAt: dto.completedAt,
        remarks: dto.remarks,
        steps: (dto.steps || []).map(s => mapToWorkflowStepDtoToWorkflowStep(s))
    };
}

/**
 * Map API PagedResultWorkflowInstanceDto to domain PagedRequest
 * @param dto 
 * @returns 
 */
export function mapPagedWorkflowInstanceDtoToPagedRequest(dto: PagedResultWorkflowInstanceDto): PagedRequest {
    return mapPagedResult(dto, mapToWorkflowInstanceDtoToWorkflowRequest);
}

//##########################
// TASK MAPPERS
//##########################

/**
 * Map API TaskAssignmentDto to domain TaskAssignment
 * @param dto 
 * @returns 
 */
export function mapToTaskAssignmentDtoToTaskAssignment(dto: TaskAssignmentDto): TaskAssignment {
    return {
        id: dto.id,
        taskId: dto.taskId,
        assignedToId: dto.assignedToId,
        assignedToName: dto.assignedToName,
        status: dto.status,
        acceptedAt: dto.acceptedAt,
        completedAt: dto.completedAt,
        notes: dto.notes,
        roleName: dto.roleName
    };
}

/**
 * Map API WorkflowTaskDto to domain Task
 * @param dto 
 * @returns 
 */
export function mapToWorkflowTaskDtoToTask(dto: WorkflowTaskDto): Task {
    return {
        id: dto.id,
        taskId: dto.taskId,
        stepId: dto.stepId,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        type: dto.type,
        handler: dto.handler,
        jobId: dto.jobId,
        assignedToId: dto.assignedToId,
        assignedToName: dto.assignedToName,
        completedById: dto.completedById,
        completedByName: dto.completedByName,
        completedAt: dto.completedAt,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        remarks: dto.remarks,
        checklist: dto.checklist,
        resultData: dto.resultData,
        workflowId: dto.workflowId,
        assignments: (dto.assignments || []).map(a => mapToTaskAssignmentDtoToTaskAssignment(a))
    };
}

export function mapPagedWorkflowTaskDtoToPagedTask(dto: PagedResultWorkflowTaskDto): PagedTask {
    return mapPagedResult(dto, mapToWorkflowTaskDtoToTask);
}

