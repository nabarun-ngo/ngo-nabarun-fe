export interface DemoDonorRecord {
  id: string;
  fullName: string;
  status: string;
  type: 'MEMBER' | 'GUEST';
  email?: string;
  phone?: string;
}

/** Registered member donors used by donor demo data source. */
export const DEMO_MEMBER_DONORS: DemoDonorRecord[] = [
  { id: 'donor-1', fullName: 'Priya Sharma', email: 'priya.sharma@example.org', phone: '+919876543210', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-2', fullName: 'Rahul Mehta', email: 'rahul.mehta@example.org', phone: '+919812345678', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-3', fullName: 'Ananya Iyer', email: 'ananya.iyer@example.org', phone: '+919900112233', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-4', fullName: 'Vikram Singh', email: 'vikram.singh@example.org', phone: '+919811223344', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-5', fullName: 'Kavita Desai', email: 'kavita.desai@example.org', phone: '+919822334455', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-6', fullName: 'Arjun Patel', email: 'arjun.patel@example.org', phone: '+919833445566', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-7', fullName: 'Meera Nair', email: 'meera.nair@example.org', phone: '+919844556677', status: 'PAUSED', type: 'MEMBER' },
  { id: 'donor-8', fullName: 'Sanjay Gupta', email: 'sanjay.gupta@example.org', phone: '+919855667788', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-9', fullName: 'Deepa Reddy', email: 'deepa.reddy@example.org', phone: '+919866778899', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-10', fullName: 'Karan Malhotra', email: 'karan.malhotra@example.org', phone: '+919877889900', status: 'ACTIVE', type: 'MEMBER' },
  { id: 'donor-11', fullName: 'Neha Kapoor', email: 'neha.kapoor@example.org', phone: '+919888990011', status: 'WAIVED', type: 'MEMBER' },
  { id: 'donor-12', fullName: 'Rohit Choudhary', email: 'rohit.choudhary@example.org', phone: '+919899001122', status: 'ACTIVE', type: 'MEMBER' },
];

/** Guest donors used by donor demo data source. */
export const DEMO_GUEST_DONORS: DemoDonorRecord[] = [
  { id: 'guest-1', fullName: 'Asha Verma', email: 'asha.verma@example.org', phone: '+919701234567', status: 'ACTIVE', type: 'GUEST' },
  { id: 'guest-2', fullName: 'Imran Khan', email: 'imran.khan@example.org', phone: '+919702345678', status: 'ACTIVE', type: 'GUEST' },
  { id: 'guest-3', fullName: 'Lakshmi Pillai', email: 'lakshmi.pillai@example.org', phone: '+919703456789', status: 'ACTIVE', type: 'GUEST' },
  { id: 'guest-4', fullName: 'Farhan Ali', email: 'farhan.ali@example.org', phone: '+919704567890', status: 'ACTIVE', type: 'GUEST' },
  { id: 'guest-5', fullName: 'Sunita Bose', email: 'sunita.bose@example.org', phone: '+919705678901', status: 'ACTIVE', type: 'GUEST' },
  { id: 'guest-6', fullName: 'Manish Tiwari', email: 'manish.tiwari@example.org', phone: '+919706789012', status: 'PAUSED', type: 'GUEST' },
  { id: 'guest-7', fullName: 'Rekha Menon', email: 'rekha.menon@example.org', phone: '+919707890123', status: 'ACTIVE', type: 'GUEST' },
  { id: 'guest-8', fullName: 'Aditi Joshi', email: 'aditi.joshi@example.org', phone: '+919708901234', status: 'ACTIVE', type: 'GUEST' },
];

export const DEMO_DONORS: DemoDonorRecord[] = [...DEMO_MEMBER_DONORS, ...DEMO_GUEST_DONORS];

export const DEMO_DONOR_REF_DATA = {
  donorStatuses: [
    { key: 'ACTIVE', value: 'Active' },
    { key: 'PAUSED', value: 'Paused' },
    { key: 'WAIVED', value: 'Waived' },
    { key: 'DELETED', value: 'Deleted' },
  ],
  memberEditableDonorStatuses: [
    { key: 'ACTIVE', value: 'Active' },
    { key: 'PAUSED', value: 'Paused' },
    { key: 'WAIVED', value: 'Waived' },
  ],
  statusesRequiringEndDate: ['PAUSED', 'WAIVED'],
};
