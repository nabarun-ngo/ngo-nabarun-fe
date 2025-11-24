import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { UserDto, UserUpdateAdminDto, UserUpdateDto } from 'src/app/core/api-client/models';
import { DocumentManagementSystemDmsService, UserService } from 'src/app/core/api-client/services';
import { CommonControllerService, UserControllerService } from 'src/app/core/api/services';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(
    private userController: UserControllerService,
    private commonController: CommonControllerService,
    private userService: UserService,
    private dmsService: DocumentManagementSystemDmsService,

  ) { }

  fetchMembers(pageIndex: number = 0, pageSize: number = 20) {
    return this.userService.userControllerListUsers({ page: pageIndex, size: pageSize, status: 'ACTIVE' }).pipe(map(d => d.responsePayload));
  }
  fetchAllMembers() {
    return this.userService.userControllerListUsers().pipe(map(d => d.responsePayload));
  }

  fetchRefData(countryCode?: string, stateCode?: string) {
    return this.userService.userControllerReferenceData({ countryCode: countryCode, stateCode: stateCode }).pipe(map(d => d.responsePayload));
  }

  uploadPicture(id: string, base64: string) {
    return this.dmsService.dmsControllerUploadFile({
      body: {
        contentType: 'image/png',
        fileBase64: base64,
        filename: 'profile_pic.png',
        documentMapping: [{
          entityId: id,
          entityType: 'profile'
        }]
      }
    }).pipe(map(d => d.responsePayload))
  }

  getUserDetail(id: string) {
    return this.userService.userControllerGetUser({ id: id }).pipe(map(d => d.responsePayload));
  }

  getMyDetail() {
    return this.userService.userControllerGetLoggedInUser().pipe(map(d => d.responsePayload));
    //return this.userController.getLoggedInUserDetails().pipe(map(d => d.responsePayload));

  }

  advancedSearch(filter: { firstName?: string, lastName?: string, email?: string, role?: string[], phoneNumber?: string }) {
    return this.userService.userControllerListUsers({
      email: filter.email ? filter.email : undefined,
      firstName: filter.firstName ? filter.firstName : undefined,
      lastName: filter.lastName ? filter.lastName : undefined,
      phoneNumber: filter.phoneNumber ? filter.phoneNumber : undefined,
      roleCodes: filter.role ? [...filter.role, 'default'] : undefined,
    }).pipe(map(d => d.responsePayload));
  }


  fetchMembersByRole(roleCodes: string[]) {
    return this.userService.userControllerListUsers({
      status: 'ACTIVE',
      roleCodes: [...roleCodes, 'default'],
    })
      .pipe(map(d => d.responsePayload));
  }

  saveRoleUserWise(roleCode: string, users: UserDto[]) {
    return this.userService.userControllerAssignRoleToUser({
      roleCode: roleCode,
      body: users.map(u => u.id!)
    });
  }

  updateMyProfiledetail(updatedDetail: UserUpdateDto) {
    return this.userService.userControllerUpdateMyDetails({
      body: updatedDetail,
    }).pipe(map(d => d.responsePayload));
  }

  updateProfiledetail(id: string, updatedDetail: UserUpdateAdminDto) {
    return this.userService.userControllerUpdateUser({ id: id, body: updatedDetail }).pipe(map(d => d.responsePayload));
  }

}

