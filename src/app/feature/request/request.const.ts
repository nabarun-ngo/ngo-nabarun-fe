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

