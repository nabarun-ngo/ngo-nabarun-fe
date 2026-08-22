import type { HelpArticle, HelpCatalog } from 'src/app/feature/help/domain/help.model';

/** Demo fixtures mirror JSON-store seed shapes so UI stays content-driven under MOCK_DATA. */
export const HELP_DEMO_CATALOG: HelpCatalog = {
  categories: [
    { key: 'getting-started', title: 'Getting started', order: 1 },
    { key: 'members', title: 'Members', order: 2 },
    { key: 'finance', title: 'Finance & donations', order: 3 },
    { key: 'meetings', title: 'Events & Meetings', order: 4 },
  ],
  featuredSlugs: ['getting-started', 'complete-member-profile', 'record-a-donation'],
  articles: [
    {
      slug: 'getting-started',
      title: 'Getting started with the app',
      categoryKey: 'getting-started',
      summary: 'Sign in, find Home, and open Help when you need guidance.',
      order: 1,
      active: true,
      estimatedMinutes: 3,
    },
    {
      slug: 'complete-member-profile',
      title: 'Complete a member profile',
      categoryKey: 'members',
      summary: 'Fill required fields and save a member profile.',
      order: 1,
      active: true,
      estimatedMinutes: 5,
    },
    {
      slug: 'record-a-donation',
      title: 'Record a donation',
      categoryKey: 'finance',
      summary: 'Create a donation with amount, donor, and payment details.',
      order: 1,
      active: true,
      estimatedMinutes: 6,
    },
    {
      slug: 'create-a-meeting',
      title: 'Create a meeting and invite',
      categoryKey: 'meetings',
      summary: 'Set date, agenda, attendees, and save a meeting.',
      order: 1,
      active: true,
      estimatedMinutes: 5,
    },
  ],
};

export const HELP_DEMO_ARTICLES: Record<string, HelpArticle> = {
  'getting-started': {
    slug: 'getting-started',
    title: 'Getting started with the app',
    categoryKey: 'getting-started',
    summary: 'Sign in, find Home, and open Help when you need guidance.',
    updatedAt: '2026-08-15',
    relatedSlugs: ['complete-member-profile'],
    blocks: [
      { type: 'heading', level: 2, text: 'Welcome' },
      {
        type: 'paragraph',
        text: 'This app helps your organisation manage members, donations, meetings, and more. Use this Help portal whenever you need a short walkthrough.',
      },
      {
        type: 'steps',
        items: [
          'Sign in with your organisation account',
          'Open Home from the main navigation',
          'Use More → Help to return here anytime',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Search on the Help home page by topic words such as donation or meeting.',
      },
      { type: 'heading', level: 2, text: 'What to learn next' },
      {
        type: 'bullets',
        items: [
          'Complete a member profile',
          'Record a donation',
          'Create a meeting and invite',
        ],
      },
    ],
  },
  'complete-member-profile': {
    slug: 'complete-member-profile',
    title: 'Complete a member profile',
    categoryKey: 'members',
    summary: 'Fill required fields and save a member profile.',
    updatedAt: '2026-08-15',
    relatedSlugs: ['getting-started'],
    blocks: [
      { type: 'heading', level: 2, text: 'Before you start' },
      {
        type: 'paragraph',
        text: 'You need permission to update members. Open the member from the Members list, then choose Complete profile.',
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Incomplete profiles stay visible until required fields are filled.',
      },
      { type: 'heading', level: 2, text: 'Required information' },
      {
        type: 'steps',
        items: [
          'Confirm name and contact details',
          'Fill membership status',
          'Review address and extras',
          'Save',
        ],
      },
    ],
  },
  'record-a-donation': {
    slug: 'record-a-donation',
    title: 'Record a donation',
    categoryKey: 'finance',
    summary: 'Create a donation with amount, donor, and payment details.',
    updatedAt: '2026-08-15',
    relatedSlugs: ['getting-started'],
    blocks: [
      { type: 'heading', level: 2, text: 'Open donations' },
      {
        type: 'paragraph',
        text: 'From Finance, open Donations. Use Create to start a new donation record.',
      },
      {
        type: 'steps',
        items: [
          'Choose or create the donor',
          'Enter amount and donation type',
          'Select payment method and status',
          'Save the donation',
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'You may not be able to edit some donations after they are closed.',
      },
    ],
  },
  'create-a-meeting': {
    slug: 'create-a-meeting',
    title: 'Create a meeting and invite',
    categoryKey: 'meetings',
    summary: 'Set date, agenda, attendees, and save a meeting.',
    updatedAt: '2026-08-15',
    relatedSlugs: ['getting-started'],
    blocks: [
      { type: 'heading', level: 2, text: 'Open Events & Meetings' },
      {
        type: 'paragraph',
        text: 'From the main navigation, open Events & Meetings. Use Create to schedule a new meeting.',
      },
      {
        type: 'steps',
        items: [
          'Enter title, date, and time',
          'Add agenda items',
          'Invite attendees',
          'Save the meeting',
        ],
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Create a meeting walkthrough',
      },
    ],
  },
};
