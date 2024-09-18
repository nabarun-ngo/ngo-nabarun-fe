import { Pipe, PipeTransform } from '@angular/core';
import { DonationDetail } from 'src/app/core/api/models';
import { DonationList } from './donation.model';

@Pipe({
  name: 'donationSearch'
})
export class DonationPipe implements PipeTransform {

  transform(donations:DonationList[],searchValue: string): DonationList[] {
    if(!donations){
      return [];
    }
    if(!searchValue){
      return donations;
    }
    //console.log(searchValue)
    searchValue=searchValue.toLowerCase();
    return donations.filter((donation:DonationList)=>
      
      (donation.donation?.id != null && donation.donation?.id .toLowerCase().includes(searchValue))
      ||
      (donation.donation?.donorDetails?.fullName  != null && donation.donation?.donorDetails?.fullName.toLowerCase().includes(searchValue)) 
      ||
      (donation.donation?.donorDetails?.email != null && donation.donation?.donorDetails?.email.toLowerCase().includes(searchValue)) 
      ||
      (donation.donation?.amount && donation.donation?.amount.toLocaleString().includes(searchValue)) 
      ||
      (donation.donation?.status != null && donation.donation?.status.toLowerCase().includes(searchValue)) 
    );
  }

}
