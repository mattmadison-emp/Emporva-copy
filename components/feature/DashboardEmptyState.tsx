
import EmptyState from '../../components/base/EmptyState';

interface DashboardEmptyStatesProps {
  section: 'jobs' | 'quotes' | 'earnings' | 'pipeline' | 'crm' | 'messages' | 'schedule' | 'marketplace' | 'automation' | 'reviews' | 'analytics' | 'tasks';
  onAction?: () => void;
  onSecondary?: () => void;
}

const emptyStateConfig: Record<string, {
  icon: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaIcon?: string;
  secondaryLabel?: string;
  secondaryIcon?: string;
}> = {
  jobs: {
    icon: 'ri-briefcase-line',
    title: 'No Active Jobs Yet',
    description: 'Once you accept a quote or get matched with a homeowner, your active jobs will appear here with full project management tools.',
    ctaLabel: 'Browse Job Marketplace',
    ctaIcon: 'ri-store-3-line',
    secondaryLabel: 'Import a Lead',
    secondaryIcon: 'ri-download-line',
  },
  quotes: {
    icon: 'ri-file-text-line',
    title: 'No Quotes Created Yet',
    description: 'Create your first quote to send professional proposals to homeowners. AI will help you build accurate, detailed quotes in minutes.',
    ctaLabel: 'Create Your First Quote',
    ctaIcon: 'ri-add-line',
  },
  earnings: {
    icon: 'ri-wallet-3-line',
    title: 'No Earnings to Display',
    description: 'Your revenue, payouts, and escrow holds will appear here once you complete your first job through Emporva.',
    ctaLabel: 'Find Jobs to Bid On',
    ctaIcon: 'ri-store-3-line',
  },
  pipeline: {
    icon: 'ri-flow-chart',
    title: 'Your Pipeline is Empty',
    description: 'Add jobs to your pipeline to track them from lead to completion. Drag cards between stages to manage your workflow.',
    ctaLabel: 'Add Your First Job',
    ctaIcon: 'ri-add-line',
  },
  crm: {
    icon: 'ri-contacts-line',
    title: 'No Contacts Yet',
    description: 'Add your first customer to start building your CRM. Track contact info, job history, and communication all in one place.',
    ctaLabel: 'Add a Contact',
    ctaIcon: 'ri-user-add-line',
  },
  messages: {
    icon: 'ri-message-3-line',
    title: 'No Messages Yet',
    description: 'Your inbox will populate as you communicate with homeowners and other trades on active projects.',
    ctaLabel: 'View Active Jobs',
    ctaIcon: 'ri-briefcase-line',
  },
  schedule: {
    icon: 'ri-calendar-2-line',
    title: 'Nothing Scheduled',
    description: 'Your calendar is clear. Add appointments, site visits, or job milestones to keep your week organized.',
    ctaLabel: 'Create an Appointment',
    ctaIcon: 'ri-add-line',
  },
  marketplace: {
    icon: 'ri-store-3-line',
    title: 'No Matching Jobs Right Now',
    description: 'New jobs are posted daily. Check back soon or adjust your trade preferences to see more opportunities in your area.',
    secondaryLabel: 'Update Trade Preferences',
    secondaryIcon: 'ri-settings-3-line',
  },
  automation: {
    icon: 'ri-robot-line',
    title: 'No Automations Set Up',
    description: 'Build workflows that run your business on autopilot — auto follow-ups, review requests, lead nurturing, and more.',
    ctaLabel: 'Create Your First Automation',
    ctaIcon: 'ri-add-line',
    secondaryLabel: 'Browse Templates',
    secondaryIcon: 'ri-layout-grid-line',
  },
  reviews: {
    icon: 'ri-star-line',
    title: 'No Reviews Yet',
    description: 'Complete your first job and request a review from the homeowner. Strong reviews help you win more jobs on the marketplace.',
    ctaLabel: 'View Active Jobs',
    ctaIcon: 'ri-briefcase-line',
  },
  analytics: {
    icon: 'ri-line-chart-line',
    title: 'Not Enough Data Yet',
    description: 'Analytics will populate as you complete jobs, send quotes, and grow your business. Complete a few more projects to unlock insights.',
    ctaLabel: 'Go to Dashboard',
    ctaIcon: 'ri-dashboard-line',
  },
  tasks: {
    icon: 'ri-task-line',
    title: 'No Tasks or Follow-Ups',
    description: 'Stay on top of your work by adding tasks, site visits, and follow-up reminders. Your to-do list starts here.',
    ctaLabel: 'Add a Task',
    ctaIcon: 'ri-add-line',
  },
};

export default function DashboardEmptyState({ section, onAction, onSecondary }: DashboardEmptyStatesProps) {
  const config = emptyStateConfig[section];
  if (!config) return null;

  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      ctaLabel={config.ctaLabel}
      ctaIcon={config.ctaIcon}
      onCtaClick={onAction}
      secondaryLabel={config.secondaryLabel}
      secondaryIcon={config.secondaryIcon}
      onSecondaryClick={onSecondary}
    />
  );
}
