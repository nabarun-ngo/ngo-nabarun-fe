import { Injectable } from "@angular/core";
import { PagedTask } from "../model/task.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { WorkflowControllerService } from "src/app/core/api-client/services";
import { mapPagedWorkflowTaskDtoToPagedTask, mapToWorkflowInstanceDtoToWorkflowRequest, mapToWorkflowTaskDtoToTask } from "../model/workflow.mapper";
import { WorkflowRequest } from "../model/request.model";
import { RequestDefaultValue } from "../workflow.const";

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    constructor(private workflowController: WorkflowControllerService) { }

    findMyTasks(
        page?: number,
        size?: number
    ): Observable<PagedTask> {
        return this.workflowController.listTasks({
            page: page || RequestDefaultValue.pageNumber,
            size: size || RequestDefaultValue.pageSize
        }).pipe(
            map(d => d.responsePayload),
            map(mapPagedWorkflowTaskDtoToPagedTask)
        );
    }

    updateTask(id: string, taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED', remarks: string, resultData?: any) {
        return this.workflowController.updateTask({
            id,
            taskId,
            body: {
                status,
                remarks,
                resultData
            }
        }).pipe(map(d => mapToWorkflowTaskDtoToTask(d.responsePayload!)));
    }

    getRequestDetail(id: string): Observable<WorkflowRequest> {
        return this.workflowController.getInstance({ id }).pipe(
            map(d => d.responsePayload),
            map(mapToWorkflowInstanceDtoToWorkflowRequest)
        );
    }
}