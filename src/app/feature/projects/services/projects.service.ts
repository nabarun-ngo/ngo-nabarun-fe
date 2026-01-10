import { Injectable } from '@angular/core';
import { DefaultValue } from '../projects.conts';
import { map } from 'rxjs';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { ProjectControllerService } from 'src/app/core/api-client/services';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(private projectsController: ProjectControllerService) { }

  listProjects() {
    return this.projectsController.listProjects({
      pageIndex: DefaultValue.pageNumber,
      pageSize: DefaultValue.pageSize,
    }).pipe(
      map(d => d.responsePayload),
    );
  }

  advancedSearch(criteria: ProjectFilter) {
    let filter = removeNullFields(criteria);
    filter = filter ? filter : {};
    if (filter?.fromDate) {
      filter.fromDate = date(filter?.fromDate, 'yyyy-MM-dd');
    }
    if (filter?.toDate) {
      filter.toDate = date(filter?.toDate, 'yyyy-MM-dd');
    }
    return this.eventController.getSocialEvents({ eventFilter: filter }).pipe(map(d => d.responsePayload));
  }

  defaultValue = DefaultValue;


  getSocialEventList(isCompleted: boolean, pageIndex?: number, pageSize?: number, filter?: EventDetailFilter) {
    if (filter?.fromDate) {
      filter.fromDate = date(filter?.fromDate, 'yyyy-MM-dd');
    }
    if (filter?.toDate) {
      filter.toDate = date(filter?.toDate, 'yyyy-MM-dd');
    }
    return this.eventController.getSocialEvents({ pageIndex: pageIndex, pageSize: pageSize, eventFilter: { completed: isCompleted, ...filter } }).pipe(map(d => d.responsePayload));
  }

  createSocialEvent(body: EventDetail) {
    if ((body.eventBudget as unknown) == "undefined" || body.eventBudget == null) {
      body.eventBudget = 0;
    }
    return this.eventController.createSocialEvent({ body: body }).pipe(map(d => d.responsePayload));
  }

  editSocialEvent(id: string, body: EventDetail) {
    return this.eventController.updateSocialEvent({ id: id, body: body }).pipe(map(d => d.responsePayload));
  }
}
