import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { DonationStatus, DonationType } from 'src/app/core/api/models';
import { CommonControllerService } from 'src/app/core/api/services';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private commonController:CommonControllerService) { }

  getRefData(options:{names?:any[],donationStatus?:DonationStatus,donationType?:DonationType}){
    return this.commonController.getReferenceData({
      names:options.names!,
      currentDonationStatus:options.donationStatus,
      donationType:options.donationType
    }).pipe(map(m=>m.responsePayload));
  }

}
