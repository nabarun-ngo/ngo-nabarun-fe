import { Pipe, PipeTransform } from '@angular/core';
import { UserDetail } from 'src/app/core/api/models';

@Pipe({
  name: 'memberSearch'
})
export class MemberSearchPipe implements PipeTransform {

  transform(profiles: UserDetail[] | undefined, searchValue:string): UserDetail[] {
    console.log(profiles,searchValue)
    if(!profiles){
      return [];
    }
    if(!searchValue){
      return profiles;
    }
    //console.log(searchValue)
    searchValue=searchValue.toLowerCase();
    return profiles.filter((profile:UserDetail)=>

      (profile.firstName != null && profile.firstName.toLowerCase().includes(searchValue))
      ||
      (profile.lastName != null && profile.lastName.toLowerCase().includes(searchValue)) 
      ||
      (profile.middleName != null && profile.middleName.toLowerCase().includes(searchValue)) 
      ||
      (profile.fullName != null && profile.fullName.toLowerCase().includes(searchValue)) 
      ||
      (profile.email != null && profile.email.toLowerCase().includes(searchValue)) 
      ||
      (profile.roles != null && profile.roleString?.toString().toLowerCase().includes(searchValue)) 
    );
  }

}
