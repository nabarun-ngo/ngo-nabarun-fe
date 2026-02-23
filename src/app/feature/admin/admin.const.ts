export type adminTabs = 'api_keys' | 'oauth' | 'bg_jobs' | 'tasks' | 'cron_jobs';


export const AdminDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'Admin Console',
    tabName: 'api_keys'
}
export const AdminConstant = {
    refDataName: 'ADMIN',
    refDataKey: {
        importantLinks: 'importantLinks',
    },
    enum: {

    }

}
