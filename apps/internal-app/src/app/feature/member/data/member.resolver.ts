import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MemberDataSource } from './member-data.source';

export const memberRefDataResolver: ResolveFn<unknown> = () => {
  return inject(MemberDataSource).fetchRefData();
};

export const myProfileResolver: ResolveFn<unknown> = () => {
  return inject(MemberDataSource).getMyProfile();
};
