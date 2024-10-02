export type adminTabs = 'ext_service_list'|'cron_jobs' | 'doppler_prop' | 'app_config';


export const AdminDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10,20, 50, 100],
    pageTitle: 'Admin Console',
    tabName: 'cron_jobs'
}
export const AdminConstant = {
    refDataName: 'ACCOUNT',
    refDataKey: {
        accountType: 'accountTypes',
        accountStatus: 'accountStatuses'
    },
    enum: {
        
    }

}
