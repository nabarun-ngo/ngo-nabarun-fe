import { Injectable } from '@angular/core';
import { SocialEventControllerService } from 'src/app/core/api/services';
import { DefaultValue } from './events.conts';
import { map } from 'rxjs';
import { EventDetail } from 'src/app/core/api/models';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  
  defaultValue = DefaultValue;

  constructor(private eventController:SocialEventControllerService) { }

  getSocialEventList(pageIndex: number = this.defaultValue.pageNumber, pageSize: number = this.defaultValue.pageSize){
    return this.eventController.getSocialEvents({pageIndex:pageIndex , pageSize : pageSize, eventFilter:{}}).pipe(map(d => d.responsePayload));
  }

  createSocialEvent(body: EventDetail) {
    return this.eventController.createSocialEvent({body: body}).pipe(map(d => d.responsePayload));
  }

  editSocialEvent(id:string,body: EventDetail) {
    return this.eventController.updateSocialEvent({id: id,body: body}).pipe(map(d => d.responsePayload));
  }
}
