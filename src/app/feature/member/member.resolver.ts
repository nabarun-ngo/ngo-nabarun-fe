import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MemberService } from './member.service';
import { MemberDefaultValue } from './member.const';
import { RefDataType, UserDetail } from 'src/app/core/api/models';
import { CommonService } from 'src/app/shared/services/common.service';

const defaultValue = MemberDefaultValue;

export const membersResolver: ResolveFn<any> = (route, state) => {
  return inject(MemberService).fetchMembers(defaultValue.pageNumber, defaultValue.pageSize);
};

export const memberRefDataResolver: ResolveFn<any> = (route, state) => {
  //console.log(route,state)
  return inject(CommonService).getRefData([RefDataType.User]);
};

export const memberResolver: ResolveFn<any> = (route, state) => {
 // console.log(route,state)
  return inject(MemberService).getUserDetail(route.params['id']);
};

export const myProfileResolver: ResolveFn<any> = (route, state) => {
  // console.log(route,state)
   return inject(MemberService).getMyDetail();
 };

 

