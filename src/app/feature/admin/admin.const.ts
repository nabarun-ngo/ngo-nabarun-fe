export type adminTabs = 'service_list' | 'app_logs' | 'global_config'|'api_keys';


export const AdminDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10,20, 50, 100],
    pageTitle: 'Admin Console',
    tabName: 'service_list'
}
export const AdminConstant = {
    refDataName: 'ADMIN',
    refDataKey: {
        importantLinks: 'importantLinks',
    },
    enum: {
        
    }

}
