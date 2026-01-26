export type adminTabs = 'service_list' | 'global_config' | 'api_keys' | 'oauth' | 'jobs' | 'tasks';


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
