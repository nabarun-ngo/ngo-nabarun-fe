import { Injectable } from '@angular/core';
import { combineLatest, concatMap, interval, map, merge, Observable, of } from 'rxjs';
import { PaginateUserDetail, RefDataType, SuccessResponsePaginateUserDetail, UserDetail, UserDetailFilter } from 'src/app/core/api/models';
import { CommonControllerService, UserControllerService } from 'src/app/core/api/services';
import { CommonService } from 'src/app/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  
  constructor(
    private userController: UserControllerService,
    private commonController: CommonControllerService,
    ) { }

  fetchMembers(pageIndex: number = 0, pageSize: number = 20) {
    return this.userController.getUsers({ pageIndex: pageIndex, pageSize: pageSize,filter:{}}).pipe(map(d => d.responsePayload));
  }
  fetchAllMembers() {
    return this.userController.getUsers({filter:{}}).pipe(map(d => d.responsePayload));
  }
  
  // fetchRefData(countryCode?:string,stateCode?:string) {
  //   return this.commonController.getReferenceData({ names: [RefDataType.User],countryCode:countryCode,stateCode:stateCode}).pipe(map(d => d.responsePayload));
  // }

  getUserDetail(id: string) {
    return this.userController.getUserDetails({id:id,idType:"ID"}).pipe(map(d => d.responsePayload));
  }

  getMyDetail() {
    //console.log("jhjhs")
    return this.userController.getLoggedInUserDetails().pipe(map(d => d.responsePayload));
  }

  advancedSearch(filter:{firstName?:string,lastName?:string,email?:string,role?:string[],phoneNumber?:string}){
    let filterOps:UserDetailFilter={};
    if(filter.firstName){
      filterOps.firstName=filter.firstName
    }
    if(filter.lastName){
      filterOps.lastName=filter.lastName
    }
    if(filter.email){
      filterOps.email=filter.email
    }
    if(filter.phoneNumber){
      filterOps.phoneNumber=filter.phoneNumber
    }
    if(filter.role){
      filterOps.roles=filter.role as any
    }
    return this.userController.getUsers({ filter:filterOps}).pipe(map(d => d.responsePayload));
  }


  fetchMembersByRole(roleCode:string) {
    return this.userController.getUsers({ filter:{
      status:['ACTIVE'],
      roles:[roleCode as any],
      userByRole:true
    }})
    .pipe(map(d => d.responsePayload));
  }

  saveRoleUserWise(roleCode: string, users: UserDetail[]) {
    return this.userController.assignUsersToRoles({id:roleCode as any,body:users}).pipe(map(d => d.responsePayload));
  }

  updateMyProfiledetail(updatedDetail:UserDetail){
    let updatePicture= updatedDetail.pictureBase64 != undefined || updatedDetail.pictureBase64 != null;
    return this.userController.updateLoggedInUserDetails({body:updatedDetail,updatePicture:updatePicture}).pipe(map(d => d.responsePayload));
  }

  updateProfiledetail(id:string,updatedDetail:UserDetail){
    return this.userController.updateUserDetails({id: id ,body:updatedDetail}).pipe(map(d => d.responsePayload));
  }

}

