export type workListTab = 'pending_worklist' | 'completed_worklist';


export const TaskDefaultValue={
    pageNumber: 0,
    pageSize:20,
    pageSizeOptions: [20, 50,100],
    pageTitle:'My Worklist',
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