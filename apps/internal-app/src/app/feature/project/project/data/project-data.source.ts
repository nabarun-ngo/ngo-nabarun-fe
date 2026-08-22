import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import type {
  PagedProjects,
  Project,
  ProjectCategory,
  ProjectDashboardSnapshot,
  ProjectFilterCriteria,
  ProjectPhase,
  ProjectStatus,
} from '../domain';

/** Server-side filters accepted by `GET /projects`. */
export interface ProjectListFilter {
  status?: ProjectStatus;
  category?: ProjectCategory;
  phase?: ProjectPhase;
  managerId?: string;
  sponsorId?: string;
  location?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface ProjectListPageQuery {
  chipId?: string;
  criteria?: ProjectFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface ProjectDataSource {
  loadListPage(query: ProjectListPageQuery): Observable<PagedProjects>;
  fetchProjectById(id: string): Observable<Project | undefined>;
  /** Progress counts plus recent activities and upcoming milestones for the detail preview. */
  fetchDashboard(id: string): Observable<ProjectDashboardSnapshot | undefined>;
  createProject(data: Partial<Project>): Observable<Project>;
  updateProject(id: string, patch: Partial<Project>): Observable<Project>;
  fetchUserOptions(): Observable<FieldOption[]>;
  fetchRefData(): Observable<ProjectRefDataDto | undefined>;
}

export const ProjectDataSource = new InjectionToken<ProjectDataSource>('ProjectDataSource');
