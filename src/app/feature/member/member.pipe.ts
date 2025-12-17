import { Pipe, PipeTransform } from '@angular/core';
import { UserDto } from 'src/app/core/api-client/models';
import { isEmptyObject } from 'src/app/core/service/utilities.service';

@Pipe({
  name: 'memberSearch'
})
export class MemberSearchPipe implements PipeTransform {

  transform(profiles: UserDto[] | undefined, searchValue: string): UserDto[] {
    ////console.log(profiles,searchValue)
    if (!profiles) {
      return [];
    }
    if (!searchValue || isEmptyObject(searchValue)) {
      return profiles;
    }
    //console.log(searchValue)
    searchValue = searchValue.toLowerCase();
    return profiles.filter((profile: UserDto) =>

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
      (profile.roles != null && profile.roles.map(m => m.roleName.toLowerCase()).find(m => m.toLowerCase().includes(searchValue))
      ));
  }

}
