export type requestTab = 'self_request' | 'delegated_request';

export const RequestType = {
    JoinRequestUser: 'JOIN_REQUEST_USER',
    ContactRequest: 'CONTACT_REQUEST',
    DonationRequest: 'DONATION_REQUEST'
}

export const RequestDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'Requests',
    tabName: 'self_request'
}

export const RequestField = {
    requestId: 'Request Id',
    requestType: 'Request Type',
    requestStatus: 'Request Status',
    requestedOn: 'Requesed On',
    requesterName: 'Requester Name'
}

export const WorkflowConstant = {
    refDataName: 'WORKFLOW',
    refDataKey: {
        visibleWorkflowTypes: 'visibleWorkflowTypes',
        workflowSteps: 'workflowSteps',
        workflowTypes: 'workflowTypes',
        workflowStatuses: 'workflowStatuses',
        workType: 'workType',
        additionalFields: 'additionalFields',
        workflowStepStatuses: 'workflowStepStatuses',
        workflowTaskStatuses: 'workflowTaskStatuses',
        workflowTaskTypes: 'workflowTaskTypes',
        visibleTaskStatuses: 'visibleTaskStatuses'
    },
    enum: {

    }

}

export type workListTab = 'pending_worklist' | 'completed_worklist';


export const TaskDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'My Tasks',
    tabName: 'pending_worklist'
}
export const TaskField = {
    workId: 'Work Id',
    workType: 'Work Type',
    requestId: 'Request Id',
    pendingSince: 'Pending Since',
    completedOn: 'Completed On',
    requestStatus: 'Request Status',
    requestedOn: 'Requesed On',
    requesterName: 'Requester Name'
}
