import { Injectable } from '@angular/core';
import { SocialEventControllerService } from 'src/app/core/api/services';
import { DefaultValue } from './events.conts';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  defaultValue = DefaultValue;

  constructor(private eventController:SocialEventControllerService) { }

  getSocialEventList(pageIndex: number = this.defaultValue.pageNumber, pageSize: number = this.defaultValue.pageSize){
    return this.eventController.getSocialEvents({pageIndex:pageIndex , pageSize : pageSize, eventFilter:{}}).pipe(map(d => d.responsePayload));
  }
}
