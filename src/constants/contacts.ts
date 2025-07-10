import { Contact } from '../types';

export const getdefaultContacts: Contact[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    company: 'Bluewave Tech',
    phone: '+254700111222',
    tags: ['customer', 'newsletter'],
    notes: 'Interested in upcoming features',
    isActive: true,
    createdAt: '2024-10-01T10:15:00Z'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    company: 'Smith & Co.',
    phone: '+254701234567',
    tags: ['vip', 'event'],
    notes: 'High-priority client',
    isActive: true,
    createdAt: '2024-11-12T14:30:00Z'
  },
  {
    id: '3',
    name: 'Carol Wanjiku',
    email: 'carol.wanjiku@example.com',
    company: 'Zuri Ventures',
    phone: '+254733876543',
    tags: ['customer'],
    notes: '',
    isActive: false,
    createdAt: '2024-12-05T08:45:00Z'
  },
  {
    id: '4',
    name: 'David Kimani',
    email: 'david.kimani@example.com',
    company: 'Ngoma Studios',
    phone: '+254711998877',
    tags: ['newsletter', 'beta'],
    notes: 'Beta tester, prefers dark mode',
    isActive: true,
    createdAt: '2025-01-18T09:20:00Z'
  },
  {
    id: '5',
    name: 'Emily Otieno',
    email: 'emily.otieno@example.com',
    company: 'Safedata Analytics',
    phone: '+254721445566',
    tags: ['customer', 'enterprise'],
    notes: 'Uses enterprise plan',
    isActive: true,
    createdAt: '2025-02-28T11:00:00Z'
  }
];

export function getDefaultContacts(): Contact[] {
  return getdefaultContacts;
}

