export type OperationMode = 'edit_admin' | 'edit_self' | 'view_self' | 'view_admin'|'password_form';


export const MemberDefaultValue={
    pageNumber: 0,
    pageSize:20,
    pageSizeOptions: [20, 50, 75,100]
}

export const UserConstant = {
    refDataName: 'USER',
    refDataKey: {
        countries:'countries',
        districts:'districts',
        states:'states',
        availableRoles:'availableRoles',
        loginMethods:'loginMethods',
        phoneCodes:'phoneCodes',
        userGenders:'userGenders',
        userStatuses:'userStatuses',
        userTitles:'userTitles',
        
    },
    enum: {
        
    }

}
