export type requestTab = 'self_request' | 'delegated_request';

export const RequestDefaultValue={
    pageNumber: 0,
    pageSize:20,
    pageSizeOptions: [20, 50, 75,100],
    pageTitle:'Requests',
    tabName:'self_request'
}

export const RequestField={
    requestId: 'Request Id',
    requestType:'Request Type',
    requestStatus: 'Request Status',
    requestedOn:'Requesed On',
    requesterName:'Requester Name'
}

export const RequestConstant = {
    refDataName: 'WORKFLOW',
    refDataKey: {
        visibleWorkflowTypes: 'visibleWorkflowTypes',
        workflowSteps: 'workflowSteps',
        workflowTypes:'workflowTypes',
        workType:'workType'
    },
    enum: {
        
    }

}

export type workListTab = 'pending_worklist' | 'completed_worklist';


export const TaskDefaultValue={
    pageNumber: 0,
    pageSize:20,
    pageSizeOptions: [20, 50,100],
    pageTitle:'My Tasks',
    tabName:'pending_worklist'
}
export const TaskField={
    workId: 'Work Id',
    workType:'Work Type',
    requestId:'Request Id',
    pendingSince:'Pending Since',
    completedOn:'Completed On',
    requestStatus: 'Request Status',
    requestedOn:'Requesed On',
    requesterName:'Requester Name'
}

