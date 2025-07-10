import { Template } from '../types';

export const defaultTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Welcome Email',
    subject: 'Welcome to Our Platform!',
    content: `<p>Hi {{name}},</p><p>We're excited to have you on board. Get started by exploring your dashboard and updating your profile.</p><p>Cheers,<br/>The Dovepeak Team</p>`,
    tags: ['welcome', 'onboarding'],
    createdAt: '2025-01-01T09:00:00Z',
    lastUsed: '2025-06-15T10:30:00Z'
  },
  {
    id: 'template-2',
    name: 'Newsletter - July 2025',
    subject: '📰 July Updates & Features You’ll Love!',
    content: `<h2>What's New This Month</h2><ul><li>📊 New Analytics Dashboard</li><li>📢 Referral Program Launched</li></ul><p>Thank you for being part of our journey!</p>`,
    tags: ['newsletter', 'july', 'updates'],
    createdAt: '2025-07-01T08:00:00Z',
    lastUsed: '2025-07-07T14:45:00Z'
  },
  {
    id: 'template-3',
    name: 'Promotion Offer',
    subject: '🎁 Special Offer Just for You!',
    content: `<p>Hi {{name}},</p><p>Enjoy 20% off on all premium plans this week only. Use code <strong>PROMO20</strong> at checkout.</p><p>Best,<br/>The Dovepeak Team</p>`,
    tags: ['promotion', 'discount', 'marketing'],
    createdAt: '2025-06-10T11:00:00Z',
    lastUsed: '2025-06-20T09:15:00Z'
  },
  {
    id: 'template-4',
    name: 'Feedback Request',
    subject: 'We’d Love Your Feedback!',
    content: `<p>Hello {{name}},</p><p>Your opinion matters! Please take 2 minutes to fill out our quick survey and help us improve.</p><p><a href="https://feedback.example.com">Give Feedback</a></p>`,
    tags: ['feedback', 'survey'],
    createdAt: '2025-05-20T16:30:00Z',
    lastUsed: '2025-06-01T12:10:00Z'
  },
  {
    id: 'template-5',
    name: 'Event Invitation',
    subject: '🎉 You’re Invited: Live Webinar on Email Marketing',
    content: `<p>Join us for an exclusive webinar where we’ll dive into advanced email strategies that boost engagement and conversions.</p><p><strong>Date:</strong> July 20, 2025<br/><strong>Time:</strong> 4:00 PM EAT</p><p><a href="https://event.dovepeak.com">Register Now</a></p>`,
    tags: ['event', 'invitation', 'webinar'],
    createdAt: '2025-07-05T10:00:00Z',
    lastUsed: '2025-07-09T18:00:00Z'
  }
];

export function getDefaultTemplates(): Template[] {
  return defaultTemplates;
}
