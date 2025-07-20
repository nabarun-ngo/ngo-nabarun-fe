import { Injectable } from '@angular/core';
import { SocialEventControllerService } from 'src/app/core/api/services';
import { DefaultValue } from './events.conts';
import { map } from 'rxjs';
import { EventDetail, EventDetailFilter } from 'src/app/core/api/models';
import { date, getNonNullValues, removeNullFields } from 'src/app/core/service/utilities.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  advancedSearch(criteria: EventDetailFilter) {
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

  constructor(private eventController: SocialEventControllerService) { }

  getSocialEventList(pageIndex: number = this.defaultValue.pageNumber, pageSize: number = this.defaultValue.pageSize, isCompleted: boolean) {
    return this.eventController.getSocialEvents({ pageIndex: pageIndex, pageSize: pageSize, eventFilter: { completed: isCompleted } }).pipe(map(d => d.responsePayload));
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
