export const NoticeDefaultValue = {
    pageNumber: 0,
    pageSize: 20,
    pageSizeOptions: [20, 50, 75, 100],
    pageTitle: 'Notices'
}

export const MeetingDefaultValue = {
    pageNumber: 0,
    pageSize: 20,
    pageSizeOptions: [20, 50, 75, 100],
    pageTitle: 'Meetings'
}

export const NoticeConstant = {
    refDataName: 'NOTICE',
    refDataKey: {
        statuses: 'statuses',
    },
    enum: {
        // Add enums here as needed
    }
}

export const MeetingConstant = {
    refDataName: 'MEETING',
    refDataKey: {
        types: 'types',
        statuses: 'statuses',
    },
    enum: {
        // Add enums here as needed
    }
}
