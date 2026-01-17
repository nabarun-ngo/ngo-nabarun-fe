import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProjectService } from './service/project.service';
import { ProjectDefaultValue, ActivityDefaultValue } from './project.const';
import { PagedProject, Project } from './model/project.model';
import { PagedActivity } from './model/activity.model';
import { combineLatest } from 'rxjs';
import { User } from '../member/models/member.model';

const defaultValue = ProjectDefaultValue;
const activityDefaultValue = ActivityDefaultValue;

export const projectsResolver: ResolveFn<{ projects: PagedProject, managers: User[] | undefined }> = (route, state) => {
  return combineLatest({
    projects: inject(ProjectService).fetchProjects(defaultValue.pageNumber, defaultValue.pageSize),
    managers: inject(ProjectService).getManagers()
  });
};

export const projectRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(ProjectService).getRefData();
};

export const projectResolver: ResolveFn<Project> = (route, state) => {
  const projectId = atob(route.params['id']);
  return inject(ProjectService).getProjectDetail(projectId);
};

export const projectActivitiesResolver: ResolveFn<PagedActivity> = (route, state) => {
  const projectId = atob(route.params['id']);
  console.log(projectId)
  return inject(ProjectService).fetchProjectActivities(
    projectId,
    activityDefaultValue.pageNumber,
    activityDefaultValue.pageSize,
  );
};
