import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DefaultValue, eventTabs } from './projects.conts';
import { ProjectsService } from './services/projects.service';

export const eventListResolver: ResolveFn<any> = (route, state) => {
  let tab = (route.data['tab'] || DefaultValue.tabName) as eventTabs;
  let completed = tab == 'completed_events'
  return inject(EventsService).getSocialEventList(completed, DefaultValue.pageNumber, DefaultValue.pageSize);
};

export const eventRefDataResolver: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getRefData();
};


export const projectsResolver: ResolveFn<any> = (route, state) => {
  return inject(ProjectsService).listProjects();
};

