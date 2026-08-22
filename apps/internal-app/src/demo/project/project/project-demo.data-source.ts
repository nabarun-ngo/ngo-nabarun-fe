import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import { normalizeProjectChip } from 'src/app/feature/project/project/config/project.rules';
import type {
  PagedProjects,
  Project,
  ProjectDashboardSnapshot,
  ProjectFilterCriteria,
} from 'src/app/feature/project/project/domain';
import type {
  ProjectDataSource,
  ProjectListPageQuery,
} from 'src/app/feature/project/project/data/project-data.source';
import {
  buildDemoCreatedProject,
  DEMO_PROJECT_REF_DATA,
  findDemoProject,
  getDemoProjectDashboard,
  getDemoProjectPage,
  updateDemoProject,
} from './project-demo.fixtures';

const DEMO_USER_OPTIONS: FieldOption[] = [
  { key: 'usr-001', label: 'Anita Roy' },
  { key: 'usr-002', label: 'Debashis Ghosh' },
  { key: 'usr-003', label: 'Farhana Khatun' },
];

@Injectable()
export class ProjectDemoDataSource implements ProjectDataSource {
  loadListPage(query: ProjectListPageQuery): Observable<PagedProjects> {
    const { items, totalSize } = getDemoProjectPage(
      normalizeProjectChip(query.chipId),
      (query.criteria ?? {}) as ProjectFilterCriteria,
      query.searchText,
      query.pageIndex,
      query.pageSize,
    );
    return of({
      content: items,
      totalSize,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(250));
  }

  fetchProjectById(id: string): Observable<Project | undefined> {
    return of(findDemoProject(id)).pipe(delay(150));
  }

  fetchDashboard(id: string): Observable<ProjectDashboardSnapshot | undefined> {
    return of(getDemoProjectDashboard(id)).pipe(delay(200));
  }

  createProject(data: Partial<Project>): Observable<Project> {
    return of(buildDemoCreatedProject(data)).pipe(delay(200));
  }

  updateProject(id: string, patch: Partial<Project>): Observable<Project> {
    return of(updateDemoProject(id, patch)).pipe(delay(200));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return of(DEMO_USER_OPTIONS).pipe(delay(120));
  }

  fetchRefData(): Observable<ProjectRefDataDto | undefined> {
    return of(DEMO_PROJECT_REF_DATA).pipe(delay(100));
  }
}
