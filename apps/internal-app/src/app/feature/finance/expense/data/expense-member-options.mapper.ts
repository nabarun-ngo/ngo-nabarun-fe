import type { FieldOption } from '@nabarun-ngo/forms-core';
import { User } from 'src/app/feature/member/domain';

export function mapUsersToMemberOptions(users: User[]): FieldOption[] {
  return users
    .filter(user => !!user.id)
    .map(user => ({
      key: user.id!,
      label: user.fullName?.trim() || user.email?.trim() || user.id!,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
