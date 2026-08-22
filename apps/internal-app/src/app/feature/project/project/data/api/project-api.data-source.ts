import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import {
  buildProjectApiFilter,
  matchesProjectSearch,
  normalizeProjectChip,
} from '../../config/project.rules';
import type {
  PagedProjects,
  Project,
  ProjectDashboardSnapshot,
} from '../../domain';
import type {
  ProjectDataSource,
  ProjectListPageQuery,
} from '../project-data.source';
import { ProjectService } from '../project.service';

/** Widest page the search fallback requests before filtering name and code locally. */
const SEARCH_PAGE_SIZE = 100;

@Injectable()
export class ProjectApiDataSource implements ProjectDataSource {
  constructor(private readonly projects: ProjectService) {}

  loadListPage(query: ProjectListPageQuery): Observable<PagedProjects> {
    const filter = buildProjectApiFilter(
      normalizeProjectChip(query.chipId),
      query.criteria,
    );
    const search = query.searchText?.trim();

    if (!search) {
      return this.projects.fetchProjects(query.pageIndex, query.pageSize, filter);
    }

    // `GET /projects` has no text query, so search pages through the widest
    // supported page and narrows on name and code without changing the API.
    return this.projects.fetchProjects(0, SEARCH_PAGE_SIZE, filter).pipe(
      map(page => {
        const matches = (page.content ?? [])
          .filter(project => matchesProjectSearch(project, search));
        const start = query.pageIndex * query.pageSize;
        return {
          content: matches.slice(start, start + query.pageSize),
          totalSize: matches.length,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
        };
      }),
    );
  }

  fetchProjectById(id: string): Observable<Project | undefined> {
    return this.projects.fetchProjectById(id).pipe(catchError(() => of(undefined)));
  }

  fetchDashboard(id: string): Observable<ProjectDashboardSnapshot | undefined> {
    return this.projects.fetchDashboard(id).pipe(catchError(() => of(undefined)));
  }

  createProject(data: Partial<Project>): Observable<Project> {
    return this.projects.createProject(data);
  }

  updateProject(id: string, patch: Partial<Project>): Observable<Project> {
    return this.projects.updateProject(id, patch);
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.projects.fetchUserOptions().pipe(catchError(() => of([])));
  }

  fetchRefData(): Observable<ProjectRefDataDto | undefined> {
    return this.projects.fetchRefData();
  }
}
