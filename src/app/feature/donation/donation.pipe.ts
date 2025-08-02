import { Pipe, PipeTransform } from '@angular/core';
import { DonationList, MemberList } from './donation.model';
import { isEmptyObject } from 'src/app/core/service/utilities.service';

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
    if(isEmptyObject(searchValue)){
      return donations; 
    }
    console.log(searchValue)
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


@Pipe({
  name: 'memberSearch'
})
export class MemberSearchPipe implements PipeTransform {

  transform(profiles: MemberList[] | undefined, searchValue:string): MemberList[] {
    //console.log(profiles,searchValue)
    if(!profiles){
      return [];
    }
    if(!searchValue){
      return profiles;
    }
     
    if(isEmptyObject(searchValue)){
      return profiles; 
    }
    console.log(searchValue)
    searchValue=searchValue.toLowerCase();
    return profiles.filter((profile:MemberList)=>

      (profile.member?.firstName != null && profile.member?.firstName.toLowerCase().includes(searchValue))
      ||
      (profile.member?.lastName != null && profile.member?.lastName.toLowerCase().includes(searchValue)) 
      ||
      (profile.member?.middleName != null && profile.member?.middleName.toLowerCase().includes(searchValue)) 
      ||
      (profile.member?.fullName != null && profile.member?.fullName.toLowerCase().includes(searchValue)) 
      ||
      (profile.member?.email != null && profile.member?.email.toLowerCase().includes(searchValue)) 
      ||
      (profile.member?.roles != null && profile.member?.roleString?.toString().toLowerCase().includes(searchValue)) 
    );
  }

}
