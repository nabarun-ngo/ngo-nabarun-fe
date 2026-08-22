import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import type {
  Project,
  ProjectDashboardSnapshot,
  ProjectFilterCriteria,
  ProjectPrimaryChip,
} from 'src/app/feature/project/project/domain';
import { matchesProjectSearch, projectStatusForChip } from 'src/app/feature/project/project/config/project.rules';

const DEMO_PROJECTS: Project[] = [
  {
    id: 'prj-001',
    code: 'EDU',
    name: 'Village School Support',
    description: 'Improve attendance and learning outcomes in two village schools.',
    category: 'EDUCATION',
    phase: 'EXECUTION',
    status: 'ACTIVE',
    budget: 450000,
    spentAmount: 187500,
    currency: 'INR',
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    location: 'Nadia, West Bengal',
    managerId: 'usr-001',
    sponsorId: 'usr-002',
    targetBeneficiaryCount: 320,
    actualBeneficiaryCount: 210,
    isPublic: true,
    nextStatus: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
    tags: ['education', 'children'],
    createdAt: '2026-01-10T06:00:00.000Z',
    updatedAt: '2026-07-02T06:00:00.000Z',
  },
  {
    id: 'prj-002',
    code: 'HLT',
    name: 'Mobile Health Camps',
    description: 'Monthly health screening camps across four gram panchayats.',
    category: 'HEALTH',
    phase: 'MONITORING',
    status: 'ACTIVE',
    budget: 260000,
    spentAmount: 240500,
    currency: 'INR',
    startDate: '2025-11-01',
    endDate: '2026-10-31',
    location: 'Purulia, West Bengal',
    managerId: 'usr-002',
    targetBeneficiaryCount: 1200,
    actualBeneficiaryCount: 980,
    isPublic: true,
    nextStatus: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
    tags: ['health'],
    createdAt: '2025-10-20T06:00:00.000Z',
    updatedAt: '2026-06-18T06:00:00.000Z',
  },
  {
    id: 'prj-003',
    code: 'WTR',
    name: 'Safe Water Access',
    description: 'Install and maintain community water filtration units.',
    category: 'RURAL_DEVELOPMENT',
    phase: 'CLOSURE',
    status: 'COMPLETED',
    budget: 310000,
    spentAmount: 305200,
    currency: 'INR',
    startDate: '2024-06-01',
    endDate: '2025-12-31',
    actualEndDate: '2025-12-20',
    location: 'Bankura, West Bengal',
    managerId: 'usr-003',
    targetBeneficiaryCount: 700,
    actualBeneficiaryCount: 742,
    isPublic: false,
    nextStatus: [],
    tags: ['water', 'infrastructure'],
    createdAt: '2024-05-12T06:00:00.000Z',
    updatedAt: '2026-01-04T06:00:00.000Z',
  },
  {
    id: 'prj-004',
    code: 'WMN',
    name: 'Women Skill Collective',
    description: 'Tailoring and handicraft training with market linkage.',
    category: 'WOMEN_EMPOWERMENT',
    phase: 'PLANNING',
    status: 'PLANNING',
    budget: 180000,
    spentAmount: 0,
    currency: 'INR',
    startDate: '2026-09-01',
    location: 'Howrah, West Bengal',
    managerId: 'usr-001',
    targetBeneficiaryCount: 60,
    actualBeneficiaryCount: 0,
    isPublic: false,
    nextStatus: ['ACTIVE', 'CANCELLED'],
    tags: ['livelihood'],
    createdAt: '2026-07-28T06:00:00.000Z',
    updatedAt: '2026-08-01T06:00:00.000Z',
  },
];

const store = DEMO_PROJECTS.map(project => ({ ...project }));

export function getDemoProjectPage(
  chipId: ProjectPrimaryChip,
  criteria: ProjectFilterCriteria,
  searchText: string | undefined,
  pageIndex: number,
  pageSize: number,
): { items: Project[]; totalSize: number } {
  const status = projectStatusForChip(chipId) ?? criteria.status;
  const matches = store.filter(project =>
    (!status || project.status === status)
    && (!criteria.category || project.category === criteria.category)
    && (!criteria.phase || project.phase === criteria.phase)
    && (!criteria.managerId || project.managerId === criteria.managerId)
    && (!criteria.sponsorId || project.sponsorId === criteria.sponsorId)
    && (!criteria.location || (project.location ?? '').includes(criteria.location))
    && (criteria.isPublic === undefined || project.isPublic === criteria.isPublic)
    && matchesProjectSearch(project, searchText));

  const start = pageIndex * pageSize;
  return { items: matches.slice(start, start + pageSize), totalSize: matches.length };
}

export function findDemoProject(id: string): Project | undefined {
  return store.find(project => project.id === id);
}

export function buildDemoCreatedProject(data: Partial<Project>): Project {
  const created: Project = {
    id: `prj-${String(store.length + 1).padStart(3, '0')}`,
    code: data.code ?? 'NEW',
    name: data.name ?? 'New project',
    description: data.description ?? '',
    category: data.category ?? 'OTHER',
    phase: data.phase ?? 'INITIATION',
    status: data.status ?? 'PLANNING',
    budget: data.budget ?? 0,
    spentAmount: 0,
    currency: data.currency ?? 'INR',
    startDate: data.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: data.endDate,
    location: data.location,
    managerId: data.managerId ?? 'usr-001',
    sponsorId: data.sponsorId,
    targetBeneficiaryCount: data.targetBeneficiaryCount,
    actualBeneficiaryCount: 0,
    isPublic: data.isPublic ?? false,
    nextStatus: ['ACTIVE', 'CANCELLED'],
    tags: data.tags ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.unshift(created);
  return created;
}

export function updateDemoProject(id: string, patch: Partial<Project>): Project {
  const index = store.findIndex(project => project.id === id);
  const current = index >= 0 ? store[index] : store[0];
  const updated: Project = { ...current, ...patch, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    store[index] = updated;
  }
  return updated;
}

export function getDemoProjectDashboard(id: string): ProjectDashboardSnapshot {
  const project = findDemoProject(id);
  return {
    progress: {
      projectId: id,
      activityCount: 6,
      beneficiaryCount: project?.actualBeneficiaryCount ?? 0,
      budget: project?.budget ?? 0,
      spentAmount: project?.spentAmount ?? 0,
      budgetUtilization: project?.budget
        ? Math.round(((project.spentAmount ?? 0) / project.budget) * 100)
        : 0,
      goalCount: 3,
      milestoneCount: 4,
      openRiskCount: 1,
    },
    recentActivities: [
      { id: 'act-001', name: 'Teacher orientation workshop', scale: 'ACTIVITY', status: 'COMPLETED' },
      { id: 'act-002', name: 'Study material distribution', scale: 'TASK', status: 'IN_PROGRESS' },
    ],
    upcomingMilestones: [
      { id: 'mil-001', name: 'Mid-term review', status: 'PENDING', targetDate: '2026-09-30' },
    ],
  };
}

export const DEMO_PROJECT_REF_DATA = {
  projectCategories: [
    { key: 'EDUCATION', displayValue: 'Education' },
    { key: 'HEALTH', displayValue: 'Health' },
    { key: 'ENVIRONMENT', displayValue: 'Environment' },
    { key: 'RURAL_DEVELOPMENT', displayValue: 'Rural development' },
    { key: 'WOMEN_EMPOWERMENT', displayValue: 'Women empowerment' },
    { key: 'CHILD_WELFARE', displayValue: 'Child welfare' },
    { key: 'DISASTER_RELIEF', displayValue: 'Disaster relief' },
    { key: 'OTHER', displayValue: 'Other' },
  ],
  projectStatuses: [
    { key: 'PLANNING', displayValue: 'Planning' },
    { key: 'ACTIVE', displayValue: 'Active' },
    { key: 'ON_HOLD', displayValue: 'On hold' },
    { key: 'COMPLETED', displayValue: 'Completed' },
    { key: 'CANCELLED', displayValue: 'Cancelled' },
  ],
  projectPhases: [
    { key: 'INITIATION', displayValue: 'Initiation' },
    { key: 'PLANNING', displayValue: 'Planning' },
    { key: 'EXECUTION', displayValue: 'Execution' },
    { key: 'MONITORING', displayValue: 'Monitoring' },
    { key: 'CLOSURE', displayValue: 'Closure' },
  ],
} as unknown as ProjectRefDataDto;
