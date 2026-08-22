import { MemberLinkedConnection, User } from 'src/app/feature/member/domain';

export const DEMO_MEMBER_REF_DATA: Record<string, {
  key: string;
  displayValue: string;
  description?: string;
  countryCode?: string;
  stateCode?: string;
}[]> = {
  countries: [{ key: 'IN', displayValue: 'India' }],
  states: [{ key: 'WB', displayValue: 'West Bengal', countryCode: 'IN' }],
  districts: [{ key: 'WB_KOLKATA', displayValue: 'Kolkata', countryCode: 'IN', stateCode: 'WB' }],
  availableRoles: [
    { key: 'MEMBER', displayValue: 'Member' },
    { key: 'PRESIDENT', displayValue: 'President' },
    { key: 'VICE_PRESIDENT', displayValue: 'Vice President' },
    { key: 'SECRETARY', displayValue: 'Secretary' },
    { key: 'ASSISTANT_SECRETARY', displayValue: 'Assistant Secretary' },
    { key: 'TREASURER', displayValue: 'Treasurer' },
    { key: 'COMMUNITY_MANAGER', displayValue: 'Social Media Manager' },
  ],
  availableRoleGroups: [
    { key: 'EXECUTIVE_BOARD', displayValue: 'Executive Board' },
    { key: 'SECRETARIAT', displayValue: 'Secretariat' },
    { key: 'FINANCE_TEAM', displayValue: 'Finance Team' },
    { key: 'GOVERNING_COMMITTEE', displayValue: 'Governing Committee' },
  ],
  availablePermissions: [
    { key: 'read:projects', displayValue: 'Read projects' },
    { key: 'update:project', displayValue: 'Update project' },
    { key: 'read:donations', displayValue: 'Read donations' },
  ],
  phoneCodes: [
    { key: 'IN', displayValue: 'India (+91)', description: '+91' },
    { key: 'US', displayValue: 'United States (+1)', description: '+1' },
  ],
  userGenders: [
    { key: 'MALE', displayValue: 'Male' },
    { key: 'FEMALE', displayValue: 'Female' },
  ],
  userStatuses: [
    { key: 'DRAFT', displayValue: 'Draft' },
    { key: 'ACTIVE', displayValue: 'Active' },
    { key: 'BLOCKED', displayValue: 'Blocked' },
    { key: 'DELETED', displayValue: 'Deleted' },
  ],
  userTitles: [{ key: 'MR', displayValue: 'Mr' }, { key: 'MS', displayValue: 'Ms' }],
  documentTypes: [
    { key: 'PROFILE_DOC', displayValue: 'Profile Document' },
    { key: 'PROFILE', displayValue: 'Profile Picture' },
    { key: 'AADHAAR', displayValue: 'Aadhaar Card' },
  ],
};

const DEMO_USERS: User[] = [
  {
    id: 'demo-user-1',
    userId: 'demo-user-1',
    email: 'asha.verma@example.org',
    title: 'MS',
    firstName: 'Asha',
    middleName: 'Rani',
    lastName: 'Verma',
    fullName: 'Ms Asha Rani Verma',
    gender: 'FEMALE',
    dateOfBirth: '1994-03-14',
    picture: 'https://ui-avatars.com/api/?name=Asha+Verma&background=f97316&color=fff',
    primaryNumber: { code: '91', number: '9876543210', fullNumber: '+91 9876543210' },
    secondaryNumber: { code: '91', number: '9123456780', fullNumber: '+91 9123456780' },
    presentAddress: {
      addressLine1: '12 Gandhi Road',
      addressLine2: 'Near Kali Temple',
      landmark: 'Opposite community hall',
      hometown: 'Barasat',
      zipCode: '700124',
      district: 'WB_KOLKATA',
      state: 'WB',
      country: 'IN',
    },
    permanentAddress: {
      addressLine1: '45 Lake View Apartments',
      addressLine2: 'Sector 5',
      landmark: 'Beside city park',
      hometown: 'Salt Lake',
      zipCode: '700091',
      district: 'WB_KOLKATA',
      state: 'WB',
      country: 'IN',
    },
    addressSame: false,
    activeDonor: true,
    blocked: false,
    createdOn: '2024-01-15T00:00:00.000Z',
    loginMethod: ['EMAIL'],
    publicProfile: true,
    status: 'ACTIVE',
    roles: [{ roleCode: 'MEMBER', roleName: 'Member' }],
    roleCodes: ['MEMBER'],
    roleGroupCodes: ['field_team'],
    permissionCodes: [],
    socialMediaLinks: [{
      linkType: 'whatsapp',
      linkName: 'WhatsApp',
      linkValue: 'https://wa.me/919876543210',
    }],
    idpSub: 'auth0|demo-1',
  },
  {
    id: 'demo-user-2',
    userId: 'demo-user-2',
    email: 'rahul.sen@example.org',
    firstName: 'Rahul',
    lastName: 'Sen',
    fullName: 'Rahul Sen',
    activeDonor: false,
    blocked: true,
    createdOn: '2024-02-20T00:00:00.000Z',
    loginMethod: ['EMAIL'],
    publicProfile: false,
    status: 'BLOCKED',
    roles: [{ roleCode: 'MEMBER', roleName: 'Member' }],
    roleCodes: ['MEMBER'],
    roleGroupCodes: [],
    permissionCodes: [],
    socialMediaLinks: [],
    idpSub: 'auth0|demo-2',
  },
];

function matchesSearch(user: User, searchText?: string): boolean {
  if (!searchText?.trim()) {
    return true;
  }
  const q = searchText.trim().toLowerCase();
  return [user.fullName, user.email, user.firstName, user.lastName]
    .filter(Boolean)
    .some(v => v!.toLowerCase().includes(q));
}

function matchesCriteria(user: User, criteria: Record<string, unknown>): boolean {
  if (criteria['firstName'] && !user.firstName.toLowerCase().includes(String(criteria['firstName']).toLowerCase())) {
    return false;
  }
  if (criteria['lastName'] && !user.lastName.toLowerCase().includes(String(criteria['lastName']).toLowerCase())) {
    return false;
  }
  if (criteria['email'] && !user.email.toLowerCase().includes(String(criteria['email']).toLowerCase())) {
    return false;
  }
  const roles = criteria['role'] as string[] | undefined;
  if (roles?.length && !roles.some(r => user.roleCodes.includes(r))) {
    return false;
  }
  return true;
}

export function getDemoMemberPage(
  chipId: string,
  criteria: Record<string, unknown>,
  searchText: string | undefined,
  pageIndex: number,
  pageSize: number,
): { items: User[]; totalSize: number } {
  let pool = [...DEMO_USERS];
  if (chipId === 'active') {
    pool = pool.filter(u => u.status === 'ACTIVE');
  } else if (chipId === 'past') {
    // Align with production MEMBER_CHIP_PRESETS.past → BLOCKED
    pool = pool.filter(u => u.status === 'BLOCKED');
  }
  pool = pool.filter(u => matchesCriteria(u, criteria) && matchesSearch(u, searchText));
  const start = pageIndex * pageSize;
  return {
    items: pool.slice(start, start + pageSize),
    totalSize: pool.length,
  };
}

export function findDemoMemberById(id: string): User | undefined {
  return DEMO_USERS.find(u => u.id.toLowerCase() === id.toLowerCase());
}

export function updateDemoMember(id: string, patch: Partial<User>): User | undefined {
  const index = DEMO_USERS.findIndex(user => user.id.toLowerCase() === id.toLowerCase());
  if (index < 0) {
    return undefined;
  }
  const updated = { ...DEMO_USERS[index], ...patch, id: DEMO_USERS[index].id } as User;
  DEMO_USERS[index] = updated;
  return updated;
}

export function createDemoMember(body: {
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  about?: string;
  picture?: string;
  isPublic?: boolean;
}): User {
  const email = body.email.trim().toLowerCase();
  if (DEMO_USERS.some(user => user.email.toLowerCase() === email && user.status !== 'DELETED')) {
    throw new Error('A member with this email already exists.');
  }
  const deleted = DEMO_USERS.find(
    user => user.email.toLowerCase() === email && user.status === 'DELETED',
  );
  if (deleted) {
    const restored: User = {
      ...deleted,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      title: body.title,
      middleName: body.middleName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      about: body.about,
      picture: body.picture ?? deleted.picture,
      fullName: [body.title, body.firstName, body.middleName, body.lastName]
        .map(part => part?.trim())
        .filter(Boolean)
        .join(' '),
      status: 'ACTIVE',
      blocked: false,
    };
    return updateDemoMember(deleted.id, restored) ?? restored;
  }

  const id = `demo-user-${Date.now()}`;
  const created: User = {
    id,
    userId: id,
    email: body.email.trim(),
    title: body.title,
    firstName: body.firstName.trim(),
    middleName: body.middleName,
    lastName: body.lastName.trim(),
    fullName: [body.title, body.firstName, body.middleName, body.lastName]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(' '),
    gender: body.gender,
    dateOfBirth: body.dateOfBirth,
    about: body.about,
    picture: body.picture,
    addressSame: true,
    activeDonor: false,
    blocked: false,
    createdOn: new Date().toISOString(),
    loginMethod: ['EMAIL'],
    publicProfile: body.isPublic ?? false,
    status: 'ACTIVE',
    roleCodes: [],
    roles: [],
    roleGroupCodes: [],
    permissionCodes: [],
    connectionKeys: ['default'],
    socialMediaLinks: [],
    idpSub: `auth0|${id}`,
  };
  DEMO_USERS.push(created);
  DEMO_CONNECTIONS.set(id, [
    {
      connectionKey: 'default',
      connectionName: 'Username-Password-Authentication',
      type: 'password',
      provider: 'auth0',
      isPrimary: true,
    },
  ]);
  return created;
}

export function deleteDemoMember(id: string): void {
  const user = findDemoMemberById(id);
  if (!user) {
    throw new Error('Member not found');
  }
  if (user.status === 'DELETED') {
    throw new Error('Member is already deleted');
  }
  updateDemoMember(id, { status: 'DELETED', blocked: true });
}

export function getDemoMyProfile(): User {
  return { ...DEMO_USERS[0] };
}

const DEMO_CONNECTIONS = new Map<string, MemberLinkedConnection[]>([
  ['demo-user-1', [
    {
      connectionKey: 'default',
      connectionName: 'Username-Password-Authentication',
      type: 'password',
      provider: 'auth0',
      isPrimary: true,
    },
  ]],
  ['demo-user-2', [
    {
      connectionKey: 'default',
      connectionName: 'Username-Password-Authentication',
      type: 'password',
      provider: 'auth0',
      isPrimary: true,
    },
    {
      connectionKey: 'passwordless_email',
      connectionName: 'email',
      type: 'passwordless',
      provider: 'email',
      isPrimary: false,
    },
  ]],
]);

export function getDemoMemberConnections(id: string): MemberLinkedConnection[] {
  const key = DEMO_USERS.find(u => u.id.toLowerCase() === id.toLowerCase())?.id ?? id;
  return [...(DEMO_CONNECTIONS.get(key) ?? [])];
}

export function grantDemoMemberConnection(id: string, connectionKey: string): void {
  const user = findDemoMemberById(id);
  if (!user) {
    throw new Error('Member not found');
  }
  const current = getDemoMemberConnections(user.id);
  if (current.some(c => c.connectionKey === connectionKey)) {
    return;
  }
  const next: MemberLinkedConnection = {
    connectionKey,
    connectionName: connectionKey === 'passwordless_email' ? 'email' : connectionKey,
    type: connectionKey === 'passwordless_email' ? 'passwordless' : 'password',
    provider: connectionKey === 'passwordless_email' ? 'email' : 'auth0',
    isPrimary: false,
  };
  DEMO_CONNECTIONS.set(user.id, [...current, next]);
}

export function revokeDemoMemberConnection(id: string, connectionKey: string): void {
  const user = findDemoMemberById(id);
  if (!user) {
    throw new Error('Member not found');
  }
  const current = getDemoMemberConnections(user.id);
  const target = current.find(c => c.connectionKey === connectionKey);
  if (target?.isPrimary || connectionKey === 'default') {
    throw new Error('The primary connection cannot be revoked.');
  }
  DEMO_CONNECTIONS.set(
    user.id,
    current.filter(c => c.connectionKey !== connectionKey),
  );
}
