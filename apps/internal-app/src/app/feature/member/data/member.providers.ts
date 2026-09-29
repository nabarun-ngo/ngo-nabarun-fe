import { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../environments/environment';
import { MemberDataSource } from './member-data.source';
import { MemberApiDataSource } from './api/member-api.data-source';
import { MemberDemoDataSource } from 'src/demo/member/member-demo.data-source';

export function provideMemberInfrastructure(): Provider[] {
  if (MOCK_DATA) {
    return [
      MemberDemoDataSource,
      { provide: MemberDataSource, useExisting: MemberDemoDataSource },
    ];
  }
  return [
    MemberApiDataSource,
    { provide: MemberDataSource, useExisting: MemberApiDataSource },
  ];
}
