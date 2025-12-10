import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { UserDto, UserUpdateAdminDto, UserUpdateDto } from 'src/app/core/api-client/models';
import { DmsControllerService, UserControllerService } from 'src/app/core/api-client/services';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(
    private userController: UserControllerService,
    private dmsService: DmsControllerService,

  ) { }

  fetchMembers(pageIndex: number = 0, pageSize: number = 20) {
    return this.userController.listUsers({ pageIndex: pageIndex, pageSize: pageSize, status: 'ACTIVE' }).pipe(map(d => d.responsePayload));
  }
  fetchAllMembers() {
    return this.userController.listUsers().pipe(map(d => d.responsePayload));
  }

  fetchRefData(countryCode?: string, stateCode?: string) {
    return this.userController.referenceData({ countryCode: countryCode, stateCode: stateCode }).pipe(map(d => d.responsePayload));
  }

  uploadPicture(id: string, base64: string) {
    return this.dmsService.uploadFile({
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
    return this.userController.getUser({ id: id }).pipe(map(d => d.responsePayload));
  }

  getMyDetail() {
    return this.userController.getLoggedInUser().pipe(map(d => d.responsePayload));
    //return this.userController.getLoggedInUserDetails().pipe(map(d => d.responsePayload));

  }

  advancedSearch(filter: { firstName?: string, lastName?: string, email?: string, role?: string[], phoneNumber?: string }) {
    return this.userController.listUsers({
      email: filter.email ? filter.email : undefined,
      firstName: filter.firstName ? filter.firstName : undefined,
      lastName: filter.lastName ? filter.lastName : undefined,
      phoneNumber: filter.phoneNumber ? filter.phoneNumber : undefined,
      roleCodes: filter.role ? [...filter.role, 'default'] : undefined,
    }).pipe(map(d => d.responsePayload));
  }


  fetchMembersByRole(roleCodes: string[]) {
    return this.userController.listUsers({
      status: 'ACTIVE',
      roleCodes: [...roleCodes, 'default'],
    })
      .pipe(map(d => d.responsePayload));
  }

  saveRoleUserWise(roleCode: string, users: UserDto[]) {
    return this.userController.assignRoleToUser({
      roleCode: roleCode,
      body: users.map(u => u.id!)
    });
  }

  updateMyProfiledetail(updatedDetail: UserUpdateDto) {
    return this.userController.updateMyDetails({
      body: updatedDetail,
    }).pipe(map(d => d.responsePayload));
  }

  updateProfiledetail(id: string, updatedDetail: UserUpdateAdminDto) {
    return this.userController.updateUser({ id: id, body: updatedDetail }).pipe(map(d => d.responsePayload));
  }

}

