import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MemberService } from './member.service';
import { MemberDefaultValue } from './member.const';

const defaultValue = MemberDefaultValue;

export const membersResolver: ResolveFn<any> = (route, state) => {
  return inject(MemberService).fetchMembers(defaultValue.pageNumber, defaultValue.pageSize);
};

export const memberRefDataResolver: ResolveFn<any> = (route, state) => {
  //console.log(route,state)
  return inject(MemberService).fetchRefData();
  //return true
};

export const memberResolver: ResolveFn<any> = (route, state) => {
 // console.log(route,state)
  return inject(MemberService).getUserDetail(atob(route.params['id']));
};

export const myProfileResolver: ResolveFn<any> = (route, state) => {
  // console.log(route,state)
   return inject(MemberService).getMyDetail();
 };

 

