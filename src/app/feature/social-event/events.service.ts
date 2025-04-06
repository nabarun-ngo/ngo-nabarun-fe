import { Injectable } from '@angular/core';
import { EventControllerService } from 'src/app/core/api/services';
import { DefaultValue } from './events.conts';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  defaultValue = DefaultValue;

  constructor(private eventController:EventControllerService) { }

  getSocialEventList(pageIndex: number = this.defaultValue.pageNumber, pageSize: number = this.defaultValue.pageSize){
    return this.eventController.getSocialEvents({pageIndex:pageIndex , pageSize : pageSize})
  }
}
