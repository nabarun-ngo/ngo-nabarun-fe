export const ProjectDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 75, 100],
    pageTitle: 'Projects'
}

export const ProjectConstant = {
    refDataName: 'PROJECT',
    refDataKey: {
        categories: 'projectCategories',
        statuses: 'projectStatuses',
        phases: 'projectPhases',
    },
    enum: {
        // Add enums here as needed
    }
}

export const ProjectField = {
    // Project fields will be defined here later
}

export type activityTab = 'in_progress' | 'other';

export const ActivityDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 75, 100],
    pageTitle: 'Project Activities',
    tabName: 'in_progress' as activityTab
}

export const ActivityConstant = {
    refDataName: 'ACTIVITY',
    refDataKey: {
        types: 'activityTypes',
        statuses: 'activityStatuses',
        priorities: 'activityPriorities',
        scales: 'activityScales',
    },
    enum: {
        // Add enums here as needed
    }
}
