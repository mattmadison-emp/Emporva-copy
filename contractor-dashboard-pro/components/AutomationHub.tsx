
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface WorkflowStep {
  id: number;
  type: 'trigger' | 'delay' | 'condition' | 'action';
  label: string;
  config: Record<string, string>;
  icon: string;
  color: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerIcon: string;
  steps: WorkflowStep[];
  enabled: boolean;
  timesTriggered: number;
  lastTriggered: string;
  successRate: number;
  category: 'follow-up' | 'scheduling' | 'communication' | 'marketing' | 'operations';
  createdAt: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  bg: string;
  popularity: number;
  steps: WorkflowStep[];
  trigger: string;
  triggerIcon: string;
}

interface ExecutionLog {
  id: string;
  automationName: string;
  contact: string;
  status: 'success' | 'failed' | 'skipped' | 'pending';
  triggeredAt: string;
  completedAt: string;
  stepsCompleted: number;
  totalSteps: number;
  details: string;
}

const CRM_TAGS = ['VIP', 'Repeat Client', 'Referral Source', 'High Value', 'Residential', 'Commercial', 'Emergency', 'Maintenance', 'New Construction', 'Renovation', 'Responsive', 'Slow Payer', 'Premium', 'Budget', 'Priority'];

const triggerOptions = [
  { id: 'job_completed', label: 'Job Marked Complete', icon: 'ri-checkbox-circle-line', desc: 'Fires when any job is marked as completed' },
  { id: 'quote_sent', label: 'Quote Sent', icon: 'ri-file-text-line', desc: 'Fires when a quote is sent to a client' },
  { id: 'quote_no_response', label: 'Quote No Response', icon: 'ri-time-line', desc: 'Fires when a quote has no response after X days' },
  { id: 'new_lead', label: 'New Lead Received', icon: 'ri-user-add-line', desc: 'Fires when a new lead enters your pipeline' },
  { id: 'appointment_booked', label: 'Appointment Booked', icon: 'ri-calendar-check-line', desc: 'Fires when a client books an appointment' },
  { id: 'payment_received', label: 'Payment Received', icon: 'ri-money-dollar-circle-line', desc: 'Fires when a payment is received' },
  { id: 'review_received', label: 'Review Received', icon: 'ri-star-line', desc: 'Fires when a new review is posted' },
  { id: 'milestone_complete', label: 'Milestone Completed', icon: 'ri-flag-line', desc: 'Fires when a job milestone is completed' },
  { id: 'inactivity', label: 'Client Inactivity', icon: 'ri-zzz-line', desc: 'Fires after X days of no client contact' },
  { id: 'seasonal', label: 'Seasonal Date', icon: 'ri-calendar-event-line', desc: 'Fires on a specific date or season start' },
  { id: 'anniversary', label: 'Service Anniversary', icon: 'ri-cake-2-line', desc: 'Fires on the anniversary of a completed job' },
  { id: 'form_submitted', label: 'Form Submitted', icon: 'ri-survey-line', desc: 'Fires when a website form is submitted' },
];

const actionOptions = [
  { id: 'send_email', label: 'Send Email', icon: 'ri-mail-send-line', color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'send_sms', label: 'Send SMS', icon: 'ri-message-2-line', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'create_task', label: 'Create Task', icon: 'ri-task-line', color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'update_crm', label: 'Update CRM Status', icon: 'ri-contacts-line', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'add_tag', label: 'Add Tag to Contact', icon: 'ri-price-tag-3-line', color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'move_pipeline', label: 'Move in Pipeline', icon: 'ri-flow-chart', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'assign_team', label: 'Assign to Team Member', icon: 'ri-user-settings-line', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'send_notification', label: 'Internal Notification', icon: 'ri-notification-3-line', color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'request_review', label: 'Request Review', icon: 'ri-star-smile-line', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'schedule_followup', label: 'Schedule Follow-Up', icon: 'ri-calendar-todo-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const delayOptions = [
  { label: '15 minutes', value: '15m' },
  { label: '1 hour', value: '1h' },
  { label: '4 hours', value: '4h' },
  { label: '1 day', value: '1d' },
  { label: '2 days', value: '2d' },
  { label: '3 days', value: '3d' },
  { label: '5 days', value: '5d' },
  { label: '7 days', value: '7d' },
  { label: '14 days', value: '14d' },
  { label: '30 days', value: '30d' },
];

const conditionOptions = [
  { id: 'contact_type', label: 'Contact Type', options: ['Homeowner', 'Property Manager', 'Real Estate Agent'] },
  { id: 'job_value', label: 'Job Value', options: ['Under $1,000', '$1,000–$5,000', '$5,000–$15,000', 'Over $15,000'] },
  { id: 'service_type', label: 'Service Type', options: ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Remodeling', 'General'] },
  { id: 'rating_given', label: 'Rating Given', options: ['5 Stars', '4 Stars', '3 Stars or Below'] },
  { id: 'has_responded', label: 'Has Responded', options: ['Yes', 'No'] },
  { id: 'repeat_client', label: 'Repeat Client', options: ['Yes', 'No'] },
];

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'post-job-followup',
    name: 'Post-Job Follow-Up',
    description: 'Thank clients after job completion, request a review, and offer maintenance plans',
    category: 'follow-up',
    icon: 'ri-mail-check-line',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    popularity: 94,
    trigger: 'Job Marked Complete',
    triggerIcon: 'ri-checkbox-circle-line',
    steps: [
      { id: 1, type: 'trigger', label: 'Job Marked Complete', config: {}, icon: 'ri-checkbox-circle-line', color: 'bg-emerald-500' },
      { id: 2, type: 'delay', label: 'Wait 1 Day', config: { duration: '1d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 3, type: 'action', label: 'Send Thank You Email', config: { type: 'send_email', template: 'thank_you' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 4, type: 'delay', label: 'Wait 3 Days', config: { duration: '3d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 5, type: 'action', label: 'Request Review', config: { type: 'request_review' }, icon: 'ri-star-smile-line', color: 'bg-yellow-500' },
      { id: 6, type: 'condition', label: 'If No Review After 7 Days', config: { check: 'has_responded', value: 'No' }, icon: 'ri-git-branch-line', color: 'bg-orange-500' },
      { id: 7, type: 'action', label: 'Send Reminder SMS', config: { type: 'send_sms', template: 'review_reminder' }, icon: 'ri-message-2-line', color: 'bg-green-500' },
    ]
  },
  {
    id: 'quote-followup',
    name: 'Quote Follow-Up Sequence',
    description: 'Automatically follow up on unanswered quotes with escalating urgency',
    category: 'follow-up',
    icon: 'ri-file-text-line',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    popularity: 88,
    trigger: 'Quote No Response',
    triggerIcon: 'ri-time-line',
    steps: [
      { id: 1, type: 'trigger', label: 'Quote Sent — No Response 3 Days', config: { delay: '3d' }, icon: 'ri-time-line', color: 'bg-amber-500' },
      { id: 2, type: 'action', label: 'Send Friendly Check-In Email', config: { type: 'send_email', template: 'quote_checkin' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 3, type: 'delay', label: 'Wait 4 Days', config: { duration: '4d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 4, type: 'condition', label: 'If Still No Response', config: { check: 'has_responded', value: 'No' }, icon: 'ri-git-branch-line', color: 'bg-orange-500' },
      { id: 5, type: 'action', label: 'Send SMS Follow-Up', config: { type: 'send_sms', template: 'quote_followup' }, icon: 'ri-message-2-line', color: 'bg-green-500' },
      { id: 6, type: 'delay', label: 'Wait 7 Days', config: { duration: '7d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 7, type: 'action', label: 'Create Follow-Up Task', config: { type: 'create_task', priority: 'high' }, icon: 'ri-task-line', color: 'bg-amber-500' },
    ]
  },
  {
    id: 'new-lead-nurture',
    name: 'New Lead Nurture',
    description: 'Welcome new leads, qualify them, and move them through your pipeline',
    category: 'marketing',
    icon: 'ri-user-heart-line',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    popularity: 82,
    trigger: 'New Lead Received',
    triggerIcon: 'ri-user-add-line',
    steps: [
      { id: 1, type: 'trigger', label: 'New Lead Received', config: {}, icon: 'ri-user-add-line', color: 'bg-emerald-500' },
      { id: 2, type: 'action', label: 'Send Welcome Email', config: { type: 'send_email', template: 'welcome' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 3, type: 'action', label: 'Add to CRM as Lead', config: { type: 'update_crm', status: 'New Lead' }, icon: 'ri-contacts-line', color: 'bg-indigo-500' },
      { id: 4, type: 'action', label: 'Internal Notification', config: { type: 'send_notification' }, icon: 'ri-notification-3-line', color: 'bg-red-500' },
      { id: 5, type: 'delay', label: 'Wait 2 Days', config: { duration: '2d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 6, type: 'action', label: 'Send Portfolio Showcase', config: { type: 'send_email', template: 'portfolio' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
    ]
  },
  {
    id: 'maintenance-reminder',
    name: 'Maintenance Reminder',
    description: 'Remind past clients about annual maintenance based on their service anniversary',
    category: 'scheduling',
    icon: 'ri-tools-line',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    popularity: 76,
    trigger: 'Service Anniversary',
    triggerIcon: 'ri-cake-2-line',
    steps: [
      { id: 1, type: 'trigger', label: 'Service Anniversary (1 Year)', config: { interval: '1y' }, icon: 'ri-cake-2-line', color: 'bg-orange-500' },
      { id: 2, type: 'action', label: 'Send Maintenance Reminder', config: { type: 'send_email', template: 'maintenance' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 3, type: 'delay', label: 'Wait 5 Days', config: { duration: '5d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 4, type: 'condition', label: 'If No Booking', config: { check: 'has_responded', value: 'No' }, icon: 'ri-git-branch-line', color: 'bg-orange-500' },
      { id: 5, type: 'action', label: 'Send Special Offer SMS', config: { type: 'send_sms', template: 'maintenance_offer' }, icon: 'ri-message-2-line', color: 'bg-green-500' },
    ]
  },
  {
    id: 'referral-program',
    name: 'Referral Program',
    description: 'Ask happy clients for referrals after receiving a positive review',
    category: 'marketing',
    icon: 'ri-gift-line',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    popularity: 71,
    trigger: 'Review Received',
    triggerIcon: 'ri-star-line',
    steps: [
      { id: 1, type: 'trigger', label: 'Positive Review Received (4+ Stars)', config: { minRating: '4' }, icon: 'ri-star-line', color: 'bg-yellow-500' },
      { id: 2, type: 'delay', label: 'Wait 1 Day', config: { duration: '1d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 3, type: 'action', label: 'Send Referral Request Email', config: { type: 'send_email', template: 'referral' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 4, type: 'action', label: 'Tag as Referral Candidate', config: { type: 'add_tag', tag: 'referral-candidate' }, icon: 'ri-price-tag-3-line', color: 'bg-pink-500' },
    ]
  },
  {
    id: 'milestone-update',
    name: 'Milestone Progress Update',
    description: 'Keep homeowners informed when project milestones are completed',
    category: 'communication',
    icon: 'ri-flag-line',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    popularity: 68,
    trigger: 'Milestone Completed',
    triggerIcon: 'ri-flag-line',
    steps: [
      { id: 1, type: 'trigger', label: 'Milestone Completed', config: {}, icon: 'ri-flag-line', color: 'bg-cyan-500' },
      { id: 2, type: 'action', label: 'Send Progress Update Email', config: { type: 'send_email', template: 'milestone_update' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 3, type: 'action', label: 'Send SMS Notification', config: { type: 'send_sms', template: 'milestone_sms' }, icon: 'ri-message-2-line', color: 'bg-green-500' },
      { id: 4, type: 'action', label: 'Create Next Milestone Task', config: { type: 'create_task' }, icon: 'ri-task-line', color: 'bg-amber-500' },
    ]
  },
  {
    id: 'win-back',
    name: 'Win-Back Campaign',
    description: 'Re-engage inactive clients who haven\'t contacted you in 90+ days',
    category: 'marketing',
    icon: 'ri-heart-pulse-line',
    color: 'text-red-500',
    bg: 'bg-red-50',
    popularity: 64,
    trigger: 'Client Inactivity',
    triggerIcon: 'ri-zzz-line',
    steps: [
      { id: 1, type: 'trigger', label: 'No Contact for 90 Days', config: { days: '90' }, icon: 'ri-zzz-line', color: 'bg-gray-500' },
      { id: 2, type: 'action', label: 'Send "We Miss You" Email', config: { type: 'send_email', template: 'win_back' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 3, type: 'delay', label: 'Wait 7 Days', config: { duration: '7d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 4, type: 'condition', label: 'If No Response', config: { check: 'has_responded', value: 'No' }, icon: 'ri-git-branch-line', color: 'bg-orange-500' },
      { id: 5, type: 'action', label: 'Send Exclusive Offer SMS', config: { type: 'send_sms', template: 'exclusive_offer' }, icon: 'ri-message-2-line', color: 'bg-green-500' },
      { id: 6, type: 'action', label: 'Move to "At Risk" in Pipeline', config: { type: 'move_pipeline', stage: 'at_risk' }, icon: 'ri-flow-chart', color: 'bg-cyan-500' },
    ]
  },
  {
    id: 'seasonal-promo',
    name: 'Seasonal Promotion',
    description: 'Automatically launch seasonal campaigns at the right time of year',
    category: 'scheduling',
    icon: 'ri-sun-line',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    popularity: 59,
    trigger: 'Seasonal Date',
    triggerIcon: 'ri-calendar-event-line',
    steps: [
      { id: 1, type: 'trigger', label: 'Season Start Date', config: { season: 'spring' }, icon: 'ri-calendar-event-line', color: 'bg-yellow-500' },
      { id: 2, type: 'action', label: 'Send Seasonal Promo Email', config: { type: 'send_email', template: 'seasonal' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
      { id: 3, type: 'delay', label: 'Wait 3 Days', config: { duration: '3d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 4, type: 'action', label: 'Send SMS Reminder', config: { type: 'send_sms', template: 'seasonal_sms' }, icon: 'ri-message-2-line', color: 'bg-green-500' },
      { id: 5, type: 'delay', label: 'Wait 7 Days', config: { duration: '7d' }, icon: 'ri-time-line', color: 'bg-gray-400' },
      { id: 6, type: 'action', label: 'Send Last Chance Email', config: { type: 'send_email', template: 'last_chance' }, icon: 'ri-mail-send-line', color: 'bg-teal-500' },
    ]
  },
];

const getCategoryConfig = (cat: string) => {
  switch (cat) {
    case 'follow-up': return { label: 'Follow-Up', color: 'bg-teal-100 text-teal-700', icon: 'ri-reply-line' };
    case 'scheduling': return { label: 'Scheduling', color: 'bg-amber-100 text-amber-700', icon: 'ri-calendar-line' };
    case 'communication': return { label: 'Communication', color: 'bg-cyan-100 text-cyan-700', icon: 'ri-message-3-line' };
    case 'marketing': return { label: 'Marketing', color: 'bg-pink-100 text-pink-700', icon: 'ri-megaphone-line' };
    case 'operations': return { label: 'Operations', color: 'bg-indigo-100 text-indigo-700', icon: 'ri-settings-3-line' };
    default: return { label: cat, color: 'bg-gray-100 text-gray-700', icon: 'ri-flashlight-line' };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'success': return { label: 'Success', color: 'bg-green-100 text-green-700', icon: 'ri-check-line' };
    case 'failed': return { label: 'Failed', color: 'bg-red-100 text-red-700', icon: 'ri-close-line' };
    case 'skipped': return { label: 'Skipped', color: 'bg-gray-100 text-gray-600', icon: 'ri-skip-forward-line' };
    case 'pending': return { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: 'ri-loader-4-line' };
    default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: 'ri-question-line' };
  }
};

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatLogTimestamp(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

function getTriggerLabel(triggerType: string): string {
  const trigger = triggerOptions.find(t => t.id === triggerType);
  return trigger?.label || triggerType || 'Unknown Trigger';
}

function getTriggerIcon(triggerType: string): string {
  const trigger = triggerOptions.find(t => t.id === triggerType);
  return trigger?.icon || 'ri-flashlight-line';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAutomationRow(row: any): Automation {
  const steps: WorkflowStep[] = Array.isArray(row.steps) ? row.steps : [];
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    trigger: getTriggerLabel(row.trigger_type),
    triggerIcon: getTriggerIcon(row.trigger_type),
    triggerType: row.trigger_type || '',
    triggerConfig: row.trigger_config || {},
    steps,
    enabled: row.enabled ?? false,
    timesTriggered: row.times_triggered ?? 0,
    lastTriggered: formatRelativeDate(row.last_triggered),
    successRate: row.success_rate != null ? Math.round(Number(row.success_rate)) : 0,
    category: row.category || 'follow-up',
    createdAt: formatDisplayDate(row.created_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformLogRow(row: any, automationsMap: Map<string, string>): ExecutionLog {
  return {
    id: row.id,
    automationName: automationsMap.get(row.automation_id) || 'Unknown Automation',
    contact: row.contact_name || '',
    status: row.status || 'pending',
    triggeredAt: formatLogTimestamp(row.triggered_at),
    completedAt: formatLogTimestamp(row.completed_at),
    stepsCompleted: row.steps_completed ?? 0,
    totalSteps: row.total_steps ?? 0,
    details: row.details || '',
  };
}

export default function AutomationHub() {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'automations' | 'templates' | 'logs'>('automations');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [templateFilter, setTemplateFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  // Builder state
  const [builderName, setBuilderName] = useState('');
  const [builderDescription, setBuilderDescription] = useState('');
  const [builderTrigger, setBuilderTrigger] = useState('');
  const [builderSteps, setBuilderSteps] = useState<WorkflowStep[]>([]);
  const [builderStep, setBuilderStep] = useState(0);
  const [addingStepType, setAddingStepType] = useState<'action' | 'delay' | 'condition' | null>(null);
  const [_editingStepId, _setEditingStepId] = useState<number | null>(null);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [targetMode, setTargetMode] = useState<'all' | 'tags' | 'contacts'>('all');
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [targetContactIds, setTargetContactIds] = useState<string[]>([]);
  const [crmContacts, setCrmContacts] = useState<{ id: string; name: string; email: string }[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const builderRef = useRef<HTMLDivElement>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAutomations = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('contractor_automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching automations:', error);
      return;
    }

    const transformed = (data || []).map(transformAutomationRow);
    setAutomations(transformed);
  }, [user]);

  const fetchExecutionLogs = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('triggered_at', { ascending: false });

    if (error) {
      console.error('Error fetching execution logs:', error);
      return;
    }

    // Build a map of automation_id -> name from current automations
    const automationsMap = new Map<string, string>();
    automations.forEach(a => automationsMap.set(a.id, a.name));

    const transformed = (data || []).map(row => transformLogRow(row, automationsMap));
    setExecutionLogs(transformed);
  }, [user, automations]);

  const fetchCrmContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('contractor_contacts')
      .select('id, name, email')
      .eq('user_id', user.id)
      .order('name');
    setCrmContacts(data || []);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAutomations(), fetchCrmContacts()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAutomations, fetchCrmContacts]);

  useEffect(() => {
    if (automations.length > 0 || !loading) {
      fetchExecutionLogs();
    }
  }, [automations, loading, fetchExecutionLogs]);

  const toggleAutomation = async (id: string) => {
    const auto = automations.find(a => a.id === id);
    if (!auto) return;
    const newState = !auto.enabled;

    // Optimistic update
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: newState } : a));
    if (selectedAutomation?.id === id) {
      setSelectedAutomation(prev => prev ? { ...prev, enabled: newState } : null);
    }
    showToastMsg(`"${auto.name}" ${newState ? 'activated' : 'paused'}`);

    const { error } = await supabase
      .from('contractor_automations')
      .update({ enabled: newState, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error toggling automation:', error);
      // Revert on error
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !newState } : a));
      if (selectedAutomation?.id === id) {
        setSelectedAutomation(prev => prev ? { ...prev, enabled: !newState } : null);
      }
      showToastMsg('Failed to update automation');
    }
  };

  const deleteAutomation = async (id: string) => {
    const auto = automations.find(a => a.id === id);
    if (!auto) return;

    // Optimistic update
    setAutomations(prev => prev.filter(a => a.id !== id));
    if (selectedAutomation?.id === id) setSelectedAutomation(null);
    showToastMsg(`"${auto.name}" deleted`);

    const { error } = await supabase
      .from('contractor_automations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting automation:', error);
      // Revert on error
      setAutomations(prev => [...prev, auto].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      showToastMsg('Failed to delete automation');
    }
  };

  const duplicateAutomation = async (auto: Automation) => {
    if (!user) return;

    const triggerType = auto.triggerType || triggerOptions.find(t => t.label === auto.trigger)?.id || '';

    const { data, error } = await supabase
      .from('contractor_automations')
      .insert({
        user_id: user.id,
        name: `${auto.name} (Copy)`,
        description: auto.description,
        category: auto.category,
        trigger_type: triggerType,
        trigger_config: auto.triggerConfig || {},
        steps: auto.steps,
        enabled: false,
        times_triggered: 0,
        last_triggered: null,
        success_rate: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating automation:', error);
      showToastMsg('Failed to duplicate automation');
      return;
    }

    if (data) {
      const newAuto = transformAutomationRow(data);
      setAutomations(prev => [newAuto, ...prev]);
      showToastMsg(`"${auto.name}" duplicated`);
    }
  };

  const openBuilderFromTemplate = (template: WorkflowTemplate) => {
    setBuilderName(template.name);
    setBuilderDescription(template.description);
    setBuilderTrigger(template.trigger);
    setBuilderSteps([...template.steps]);
    setBuilderStep(2);
    setEditingAutomationId(null);
    setTargetMode('all');
    setTargetTags([]);
    setTargetContactIds([]);
    setContactSearch('');
    setShowBuilder(true);
  };

  const openBuilderNew = () => {
    setBuilderName('');
    setBuilderDescription('');
    setBuilderTrigger('');
    setBuilderSteps([]);
    setBuilderStep(0);
    setEditingAutomationId(null);
    setTargetMode('all');
    setTargetTags([]);
    setTargetContactIds([]);
    setContactSearch('');
    setShowBuilder(true);
  };

  const openBuilderEdit = (auto: Automation) => {
    setBuilderName(auto.name);
    setBuilderDescription(auto.description);
    setBuilderTrigger(auto.trigger);
    setBuilderSteps([...auto.steps]);
    setBuilderStep(2);
    setEditingAutomationId(auto.id);
    const savedTags = Array.isArray(auto.triggerConfig?.targetTags) ? auto.triggerConfig.targetTags as string[] : [];
    const savedContactIds = Array.isArray(auto.triggerConfig?.targetContactIds) ? auto.triggerConfig.targetContactIds as string[] : [];
    setTargetMode(auto.triggerConfig?.targetMode === 'contacts' ? 'contacts' : savedTags.length > 0 ? 'tags' : 'all');
    setTargetTags(savedTags);
    setTargetContactIds(savedContactIds);
    setContactSearch('');
    setShowBuilder(true);
    setSelectedAutomation(null);
  };

  const selectTrigger = (trigger: typeof triggerOptions[0]) => {
    setBuilderTrigger(trigger.label);
    setBuilderSteps([{
      id: 1,
      type: 'trigger',
      label: trigger.label,
      config: {},
      icon: trigger.icon,
      color: 'bg-emerald-500',
    }]);
    setBuilderStep(1);
  };

  const addStepToWorkflow = (stepType: 'action' | 'delay' | 'condition', config: Record<string, string>) => {
    const newId = builderSteps.length > 0 ? Math.max(...builderSteps.map(s => s.id)) + 1 : 1;
    let newStep: WorkflowStep;

    if (stepType === 'action') {
      const action = actionOptions.find(a => a.id === config.actionId);
      newStep = {
        id: newId,
        type: 'action',
        label: action?.label || 'Action',
        config,
        icon: action?.icon || 'ri-flashlight-line',
        color: action?.bg.replace('bg-', 'bg-').replace('-50', '-500') || 'bg-teal-500',
      };
    } else if (stepType === 'delay') {
      const delay = delayOptions.find(d => d.value === config.duration);
      newStep = {
        id: newId,
        type: 'delay',
        label: `Wait ${delay?.label || config.duration}`,
        config,
        icon: 'ri-time-line',
        color: 'bg-gray-400',
      };
    } else {
      const cond = conditionOptions.find(c => c.id === config.conditionId);
      newStep = {
        id: newId,
        type: 'condition',
        label: `If ${cond?.label || 'Condition'}: ${config.value || ''}`,
        config,
        icon: 'ri-git-branch-line',
        color: 'bg-orange-500',
      };
    }

    setBuilderSteps(prev => [...prev, newStep]);
    setAddingStepType(null);
  };

  const removeStep = (stepId: number) => {
    setBuilderSteps(prev => prev.filter(s => s.id !== stepId));
  };

  const saveAutomation = async () => {
    if (!builderName.trim() || builderSteps.length < 2 || !user) return;

    const triggerType = triggerOptions.find(t => t.label === builderTrigger)?.id || '';
    const triggerStep = builderSteps[0];

    const triggerConfig = {
      ...(triggerStep?.config || {}),
      targetMode,
      targetTags: targetMode === 'tags' ? targetTags : [],
      targetContactIds: targetMode === 'contacts' ? targetContactIds : [],
    };

    if (editingAutomationId) {
      // Update existing automation
      const { error } = await supabase
        .from('contractor_automations')
        .update({
          name: builderName,
          description: builderDescription,
          trigger_type: triggerType,
          trigger_config: triggerConfig,
          steps: builderSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingAutomationId);

      if (error) {
        console.error('Error updating automation:', error);
        showToastMsg('Failed to update automation');
        return;
      }

      showToastMsg(`"${builderName}" updated`);
    } else {
      // Create new automation
      const { error } = await supabase
        .from('contractor_automations')
        .insert({
          user_id: user.id,
          name: builderName,
          description: builderDescription,
          category: 'follow-up',
          trigger_type: triggerType,
          trigger_config: triggerConfig,
          steps: builderSteps,
          enabled: true,
          times_triggered: 0,
          success_rate: 0,
        });

      if (error) {
        console.error('Error creating automation:', error);
        showToastMsg('Failed to create automation');
        return;
      }

      showToastMsg(`"${builderName}" created and activated`);
    }

    setShowBuilder(false);
    setEditingAutomationId(null);
    await fetchAutomations();
  };

  const filteredTemplates = templateFilter === 'all'
    ? workflowTemplates
    : workflowTemplates.filter(t => t.category === templateFilter);

  const filteredLogs = executionLogs
    .filter(l => logFilter === 'all' || l.status === logFilter)
    .filter(l => !logSearch || l.automationName.toLowerCase().includes(logSearch.toLowerCase()) || l.contact.toLowerCase().includes(logSearch.toLowerCase()));

  const totalTriggered = automations.reduce((s, a) => s + a.timesTriggered, 0);
  const activeCount = automations.filter(a => a.enabled).length;
  const avgSuccess = automations.length > 0 ? Math.round(automations.reduce((s, a) => s + a.successRate, 0) / automations.length) : 0;
  const timeSaved = Math.round(totalTriggered * 4.5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-semibold text-[#0B1F33]">Loading automations...</p>
            <p className="text-xs text-[#6B7C8F] mt-1">Setting up your automation hub</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in">
          <div className="bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-white text-lg"></i>
            </div>
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33]">Automation Hub</h2>
            <p className="text-sm text-[#6B7C8F] mt-1">Build workflows that run your business on autopilot</p>
          </div>
          <button
            onClick={openBuilderNew}
            className="bg-[#0B1F33] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all whitespace-nowrap cursor-pointer text-sm"
          >
            <i className="ri-add-line mr-2"></i>
            Create Automation
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-6 border-t border-gray-100">
          <div className="flex gap-1">
            {[
              { id: 'automations' as const, label: 'My Automations', icon: 'ri-robot-line' },
              { id: 'templates' as const, label: 'Workflow Templates', icon: 'ri-layout-grid-line' },
              { id: 'logs' as const, label: 'Execution Logs', icon: 'ri-file-list-3-line' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'border-[#0B1F33] text-[#0B1F33]'
                    : 'border-transparent text-[#6B7C8F] hover:text-[#0B1F33]'
                }`}
              >
                <i className={`${tab.icon} text-base`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <i className="ri-robot-line text-teal-600 text-xl"></i>
            </div>
            <p className="text-xs text-[#6B7C8F] font-medium">Active Automations</p>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33]">{activeCount}</p>
          <p className="text-xs text-[#6B7C8F] mt-1">of {automations.length} total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <i className="ri-flashlight-line text-emerald-600 text-xl"></i>
            </div>
            <p className="text-xs text-[#6B7C8F] font-medium">Total Triggered</p>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33]">{totalTriggered}</p>
          <p className="text-xs text-green-600 font-semibold mt-1"><i className="ri-arrow-up-line"></i> +38 this week</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-green-600 text-xl"></i>
            </div>
            <p className="text-xs text-[#6B7C8F] font-medium">Success Rate</p>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33]">{avgSuccess}%</p>
          <p className="text-xs text-green-600 font-semibold mt-1"><i className="ri-arrow-up-line"></i> +2% vs last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <i className="ri-timer-line text-amber-600 text-xl"></i>
            </div>
            <p className="text-xs text-[#6B7C8F] font-medium">Time Saved</p>
          </div>
          <p className="text-3xl font-bold text-[#0B1F33]">~{Math.round(timeSaved / 60)}h</p>
          <p className="text-xs text-[#6B7C8F] mt-1">{timeSaved} min of manual work</p>
        </div>
      </div>

      {/* MY AUTOMATIONS */}
      {activeSection === 'automations' && (
        <div className="space-y-4">
          {automations.map(auto => (
            <div key={auto.id} className={`bg-white rounded-xl shadow-sm border-2 ${auto.enabled ? 'border-gray-100' : 'border-dashed border-gray-200'} overflow-hidden transition-all hover:shadow-md`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${auto.enabled ? 'bg-[#0B1F33]' : 'bg-gray-200'}`}>
                      <i className={`${auto.triggerIcon} text-xl ${auto.enabled ? 'text-[#D4B483]' : 'text-gray-500'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-bold text-[#0B1F33] text-base">{auto.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${auto.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {auto.enabled ? 'Active' : 'Paused'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryConfig(auto.category).color}`}>
                          {getCategoryConfig(auto.category).label}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7C8F] mb-3">{auto.description}</p>

                      {/* Mini Workflow Preview */}
                      <div className="flex items-center gap-1 flex-wrap mb-3">
                        {auto.steps.slice(0, 6).map((step, idx) => (
                          <div key={step.id} className="flex items-center gap-1">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${step.color}`} title={step.label}>
                              <i className={`${step.icon} text-white text-xs`}></i>
                            </div>
                            {idx < Math.min(auto.steps.length - 1, 5) && (
                              <i className="ri-arrow-right-s-line text-gray-300 text-sm"></i>
                            )}
                          </div>
                        ))}
                        {auto.steps.length > 6 && (
                          <span className="text-xs text-[#6B7C8F] font-medium ml-1">+{auto.steps.length - 6} more</span>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-5 text-xs">
                        <span className="text-[#6B7C8F]">
                          <i className="ri-flashlight-line mr-1 text-[#D4B483]"></i>
                          <strong className="text-[#0B1F33]">{auto.timesTriggered}</strong> triggered
                        </span>
                        <span className="text-[#6B7C8F]">
                          <i className="ri-check-double-line mr-1 text-green-500"></i>
                          <strong className="text-[#0B1F33]">{auto.successRate}%</strong> success
                        </span>
                        <span className="text-[#6B7C8F]">
                          <i className="ri-time-line mr-1"></i>
                          Last: {auto.lastTriggered}
                        </span>
                        <span className="text-[#6B7C8F]">
                          <i className="ri-calendar-line mr-1"></i>
                          Created: {auto.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => toggleAutomation(auto.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${auto.enabled ? 'bg-teal-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${auto.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <button
                      onClick={() => setSelectedAutomation(selectedAutomation?.id === auto.id ? null : auto)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer transition-colors"
                    >
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => openBuilderEdit(auto)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer transition-colors"
                    >
                      <i className="ri-edit-line text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {selectedAutomation?.id === auto.id && (
                <div className="border-t border-gray-100 bg-[#FAFBFC] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-[#0B1F33]">Workflow Steps</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => duplicateAutomation(auto)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                        <i className="ri-file-copy-line"></i> Duplicate
                      </button>
                      <button onClick={() => deleteAutomation(auto.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer whitespace-nowrap">
                        <i className="ri-delete-bin-line"></i> Delete
                      </button>
                    </div>
                  </div>

                  {/* Visual Workflow */}
                  <div className="space-y-0">
                    {auto.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color} shadow-sm`}>
                            <i className={`${step.icon} text-white text-lg`}></i>
                          </div>
                          {idx < auto.steps.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${
                              step.type === 'trigger' ? 'text-emerald-600' :
                              step.type === 'delay' ? 'text-gray-500' :
                              step.type === 'condition' ? 'text-orange-600' : 'text-teal-600'
                            }`}>
                              {step.type}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#0B1F33] mt-0.5">{step.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {automations.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-robot-line text-3xl text-gray-300"></i>
              </div>
              <h3 className="font-bold text-[#0B1F33] mb-2">No automations yet</h3>
              <p className="text-sm text-[#6B7C8F] mb-4">Start from a template or build your own from scratch</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setActiveSection('templates')} className="px-5 py-2.5 bg-[#F9F9FB] text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-gray-200 cursor-pointer whitespace-nowrap">
                  Browse Templates
                </button>
                <button onClick={openBuilderNew} className="px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap">
                  Build from Scratch
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORKFLOW TEMPLATES */}
      {activeSection === 'templates' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Templates' },
              { id: 'follow-up', label: 'Follow-Up' },
              { id: 'marketing', label: 'Marketing' },
              { id: 'scheduling', label: 'Scheduling' },
              { id: 'communication', label: 'Communication' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTemplateFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  templateFilter === f.id ? 'bg-[#0B1F33] text-white' : 'bg-white border border-gray-200 text-[#6B7C8F] hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${template.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`${template.icon} ${template.color} text-2xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#0B1F33]">{template.name}</h3>
                        <span className="text-[10px] bg-[#F9F9FB] text-[#6B7C8F] px-2 py-0.5 rounded-full font-semibold">
                          <i className="ri-fire-line mr-0.5"></i>{template.popularity}% popular
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7C8F] leading-relaxed">{template.description}</p>
                    </div>
                  </div>

                  {/* Trigger Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wide">Trigger:</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">
                      <i className={`${template.triggerIcon} text-sm`}></i>
                      {template.trigger}
                    </span>
                  </div>

                  {/* Steps Preview */}
                  <div className="flex items-center gap-1 mb-4 flex-wrap">
                    {template.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-1">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${step.color}`} title={step.label}>
                          <i className={`${step.icon} text-white text-xs`}></i>
                        </div>
                        {idx < template.steps.length - 1 && (
                          <i className="ri-arrow-right-s-line text-gray-300 text-xs"></i>
                        )}
                      </div>
                    ))}
                    <span className="text-xs text-[#6B7C8F] ml-1">{template.steps.length} steps</span>
                  </div>

                  <button
                    onClick={() => openBuilderFromTemplate(template)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line"></i>
                    Use This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXECUTION LOGS */}
      {activeSection === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                  placeholder="Search by automation or contact..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-[#0B1F33] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'success', label: 'Success' },
                  { id: 'failed', label: 'Failed' },
                  { id: 'skipped', label: 'Skipped' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setLogFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      logFilter === f.id ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[#6B7C8F] font-medium ml-auto">{filteredLogs.length} entries</span>
            </div>
          </div>

          {/* Log Entries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filteredLogs.map(log => {
                const statusCfg = getStatusConfig(log.status);
                return (
                  <div key={log.id} className="p-4 hover:bg-[#FAFBFC] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        log.status === 'success' ? 'bg-green-100' :
                        log.status === 'failed' ? 'bg-red-100' :
                        log.status === 'skipped' ? 'bg-gray-100' : 'bg-amber-100'
                      }`}>
                        <i className={`${statusCfg.icon} text-lg ${
                          log.status === 'success' ? 'text-green-600' :
                          log.status === 'failed' ? 'text-red-600' :
                          log.status === 'skipped' ? 'text-gray-500' : 'text-amber-600'
                        }`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-bold text-sm text-[#0B1F33]">{log.automationName}</p>
                          <i className="ri-arrow-right-s-line text-gray-300 text-sm"></i>
                          <p className="text-sm text-[#0B1F33]">{log.contact}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7C8F] leading-relaxed mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6B7C8F]">
                          <span><i className="ri-time-line mr-1"></i>{log.triggeredAt}</span>
                          <span><i className="ri-list-check-2 mr-1"></i>{log.stepsCompleted}/{log.totalSteps} steps</span>
                          {log.status === 'success' && log.stepsCompleted < log.totalSteps && (
                            <span className="text-amber-600 font-semibold"><i className="ri-loader-4-line mr-1"></i>In progress</span>
                          )}
                        </div>
                      </div>
                      {/* Progress mini bar */}
                      <div className="flex-shrink-0 w-20">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              log.status === 'success' ? 'bg-green-500' :
                              log.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${log.totalSteps > 0 ? (log.stepsCompleted / log.totalSteps) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-[#6B7C8F] text-center mt-1">
                          {log.totalSteps > 0 ? Math.round((log.stepsCompleted / log.totalSteps) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredLogs.length === 0 && (
              <div className="p-12 text-center">
                <i className="ri-file-list-3-line text-3xl text-gray-300 mb-3"></i>
                <p className="text-sm font-semibold text-[#0B1F33]">No logs match your filters</p>
                <p className="text-xs text-[#6B7C8F] mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORKFLOW BUILDER MODAL */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowBuilder(false)}>
          <div
            ref={builderRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'fadeScaleIn 0.2s ease-out' }}
          >
            {/* Builder Header */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F33]">
                    {builderStep === 0 ? 'Choose a Trigger' : builderStep === 1 ? 'Name Your Automation' : 'Build Workflow'}
                  </h3>
                  <p className="text-sm text-[#6B7C8F] mt-1">
                    {builderStep === 0 ? 'What event should start this automation?' : builderStep === 1 ? 'Give it a name and description' : 'Add steps to your workflow'}
                  </p>
                </div>
                <button
                  onClick={() => setShowBuilder(false)}
                  className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-[#0B1F33] text-xl"></i>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-5">
                {['Trigger', 'Details', 'Workflow'].map((label, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      builderStep >= idx ? 'bg-[#0B1F33] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {builderStep > idx ? <i className="ri-check-line"></i> : idx + 1}
                    </div>
                    <span className={`text-xs font-semibold ${builderStep >= idx ? 'text-[#0B1F33]' : 'text-[#6B7C8F]'}`}>{label}</span>
                    {idx < 2 && <div className={`flex-1 h-0.5 ${builderStep > idx ? 'bg-[#0B1F33]' : 'bg-gray-200'}`}></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Builder Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 0: Choose Trigger */}
              {builderStep === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {triggerOptions.map(trigger => (
                    <button
                      key={trigger.id}
                      onClick={() => selectTrigger(trigger)}
                      className="text-left p-4 border-2 border-gray-100 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                          <i className={`${trigger.icon} text-emerald-600 text-xl`}></i>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#0B1F33] mb-0.5">{trigger.label}</p>
                          <p className="text-xs text-[#6B7C8F] leading-relaxed">{trigger.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Name & Description */}
              {builderStep === 1 && (
                <div className="space-y-5 max-w-lg mx-auto">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${builderSteps[0]?.icon || 'ri-flashlight-line'} text-white text-lg`}></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Trigger</p>
                      <p className="text-sm font-semibold text-emerald-900">{builderTrigger}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0B1F33] mb-2 block">Automation Name *</label>
                    <input
                      type="text"
                      value={builderName}
                      onChange={e => setBuilderName(e.target.value)}
                      placeholder="e.g., Post-Job Follow-Up Sequence"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#0B1F33] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0B1F33] mb-2 block">Description</label>
                    <textarea
                      value={builderDescription}
                      onChange={e => setBuilderDescription(e.target.value)}
                      placeholder="Briefly describe what this automation does..."
                      maxLength={200}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#0B1F33] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                    <p className="text-xs text-[#6B7C8F] mt-1 text-right">{builderDescription.length}/200</p>
                  </div>
                </div>
              )}

              {/* Step 2: Build Workflow */}
              {builderStep === 2 && (
                <div className="space-y-4">
                  {/* Target Audience */}
                  <div className="bg-[#F9F9FB] rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ri-group-line text-[#0B1F33]"></i>
                      <h4 className="font-bold text-sm text-[#0B1F33]">Target Audience</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => { setTargetMode('all'); setTargetTags([]); }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          targetMode === 'all'
                            ? 'bg-[#0B1F33] text-white'
                            : 'bg-white text-[#6B7C8F] border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        All contacts
                      </button>
                      <button
                        onClick={() => setTargetMode('tags')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          targetMode === 'tags'
                            ? 'bg-[#0B1F33] text-white'
                            : 'bg-white text-[#6B7C8F] border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Contacts with specific tags
                      </button>
                      <button
                        onClick={() => setTargetMode('contacts')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          targetMode === 'contacts'
                            ? 'bg-[#0B1F33] text-white'
                            : 'bg-white text-[#6B7C8F] border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Specific contacts
                      </button>
                    </div>
                    {targetMode === 'tags' && (
                      <div className="flex flex-wrap gap-2">
                        {CRM_TAGS.map(tag => {
                          const selected = targetTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => setTargetTags(prev => selected ? prev.filter(t => t !== tag) : [...prev, tag])}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                selected
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-white text-[#0B1F33] border border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {targetMode === 'contacts' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={contactSearch}
                          onChange={e => setContactSearch(e.target.value)}
                          placeholder="Search contacts by name or email..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                        />
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {crmContacts
                            .filter(c => !contactSearch || c.name.toLowerCase().includes(contactSearch.toLowerCase()) || c.email.toLowerCase().includes(contactSearch.toLowerCase()))
                            .map(contact => {
                              const selected = targetContactIds.includes(contact.id);
                              return (
                                <button
                                  key={contact.id}
                                  onClick={() => setTargetContactIds(prev => selected ? prev.filter(id => id !== contact.id) : [...prev, contact.id])}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                    selected
                                      ? 'bg-teal-50 border border-teal-200'
                                      : 'bg-white border border-gray-100 hover:bg-gray-50'
                                  }`}
                                >
                                  <div>
                                    <span className="font-semibold text-[#0B1F33]">{contact.name}</span>
                                    {contact.email && <span className="text-[#6B7C8F] ml-2">{contact.email}</span>}
                                  </div>
                                  {selected && <i className="ri-check-line text-teal-600"></i>}
                                </button>
                              );
                            })}
                          {crmContacts.length === 0 && (
                            <p className="text-xs text-[#6B7C8F] py-2 text-center">No CRM contacts found. Add contacts in the CRM tab first.</p>
                          )}
                        </div>
                        {targetContactIds.length > 0 && (
                          <p className="text-xs text-teal-600 font-medium">{targetContactIds.length} contact{targetContactIds.length !== 1 ? 's' : ''} selected</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Workflow Steps */}
                  <div className="space-y-0">
                    {builderSteps.map((step, idx) => (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color} shadow-sm`}>
                            <i className={`${step.icon} text-white text-lg`}></i>
                          </div>
                          {idx < builderSteps.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`text-[10px] font-bold uppercase tracking-wide ${
                                step.type === 'trigger' ? 'text-emerald-600' :
                                step.type === 'delay' ? 'text-gray-500' :
                                step.type === 'condition' ? 'text-orange-600' : 'text-teal-600'
                              }`}>
                                {step.type}
                              </span>
                              <p className="text-sm font-semibold text-[#0B1F33] mt-0.5">{step.label}</p>
                            </div>
                            {step.type !== 'trigger' && (
                              <button
                                onClick={() => removeStep(step.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                              >
                                <i className="ri-close-line text-sm"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connector line to add button */}
                  {builderSteps.length > 0 && (
                    <div className="flex items-center gap-4 ml-[18px]">
                      <div className="w-0.5 h-4 bg-gray-200"></div>
                    </div>
                  )}

                  {/* Add Step Buttons */}
                  {!addingStepType && (
                    <div className="flex items-center gap-3 ml-14">
                      <button
                        onClick={() => setAddingStepType('action')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-semibold hover:bg-teal-100 cursor-pointer whitespace-nowrap transition-colors"
                      >
                        <i className="ri-add-line"></i> Add Action
                      </button>
                      <button
                        onClick={() => setAddingStepType('delay')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 cursor-pointer whitespace-nowrap transition-colors"
                      >
                        <i className="ri-time-line"></i> Add Delay
                      </button>
                      <button
                        onClick={() => setAddingStepType('condition')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-semibold hover:bg-orange-100 cursor-pointer whitespace-nowrap transition-colors"
                      >
                        <i className="ri-git-branch-line"></i> Add Condition
                      </button>
                    </div>
                  )}

                  {/* Add Action Panel */}
                  {addingStepType === 'action' && (
                    <div className="ml-14 bg-teal-50/50 border border-teal-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-[#0B1F33]">Choose an Action</h4>
                        <button onClick={() => setAddingStepType(null)} className="text-xs text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer font-semibold">Cancel</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {actionOptions.map(action => (
                          <button
                            key={action.id}
                            onClick={() => addStepToWorkflow('action', { actionId: action.id })}
                            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer text-left"
                          >
                            <div className={`w-9 h-9 ${action.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <i className={`${action.icon} ${action.color} text-lg`}></i>
                            </div>
                            <span className="text-xs font-semibold text-[#0B1F33]">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Delay Panel */}
                  {addingStepType === 'delay' && (
                    <div className="ml-14 bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-[#0B1F33]">Set Wait Duration</h4>
                        <button onClick={() => setAddingStepType(null)} className="text-xs text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer font-semibold">Cancel</button>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {delayOptions.map(delay => (
                          <button
                            key={delay.value}
                            onClick={() => addStepToWorkflow('delay', { duration: delay.value })}
                            className="p-2.5 bg-white border border-gray-100 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer text-center"
                          >
                            <p className="text-xs font-semibold text-[#0B1F33]">{delay.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Condition Panel */}
                  {addingStepType === 'condition' && (
                    <ConditionPanel
                      onAdd={(config) => addStepToWorkflow('condition', config)}
                      onCancel={() => setAddingStepType(null)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Builder Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center gap-3 bg-[#F9F9FB] flex-shrink-0">
              {builderStep > 0 && (
                <button
                  onClick={() => setBuilderStep(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line"></i> Back
                </button>
              )}
              <div className="flex-1" />
              {builderStep === 1 && (
                <button
                  onClick={() => { if (builderName.trim()) setBuilderStep(2); }}
                  disabled={!builderName.trim()}
                  className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                    builderName.trim() ? 'bg-[#0B1F33] text-white hover:bg-[#1a3a52]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next: Build Workflow <i className="ri-arrow-right-line"></i>
                </button>
              )}
              {builderStep === 2 && (
                <>
                  <span className="text-xs text-[#6B7C8F]">{builderSteps.length} steps</span>
                  <button
                    onClick={saveAutomation}
                    disabled={builderSteps.length < 2 || !builderName.trim()}
                    className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                      builderSteps.length >= 2 && builderName.trim() ? 'bg-[#0B1F33] text-white hover:bg-[#1a3a52]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <i className="ri-check-line"></i> Save &amp; Activate
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

function ConditionPanel({ onAdd, onCancel }: { onAdd: (config: Record<string, string>) => void; onCancel: () => void }) {
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const condition = conditionOptions.find(c => c.id === selectedCondition);

  return (
    <div className="ml-14 bg-orange-50/50 border border-orange-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-[#0B1F33]">Set Condition</h4>
        <button onClick={onCancel} className="text-xs text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer font-semibold">Cancel</button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-[#6B7C8F] mb-1.5 block">Condition Type</label>
          <select
            value={selectedCondition}
            onChange={e => { setSelectedCondition(e.target.value); setSelectedValue(''); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
          >
            <option value="">Select a condition...</option>
            {conditionOptions.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        {condition && (
          <div>
            <label className="text-xs font-semibold text-[#6B7C8F] mb-1.5 block">Value</label>
            <select
              value={selectedValue}
              onChange={e => setSelectedValue(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              <option value="">Select a value...</option>
              {condition.options.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        )}
        {selectedCondition && selectedValue && (
          <button
            onClick={() => onAdd({ conditionId: selectedCondition, value: selectedValue })}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-add-line"></i> Add Condition
          </button>
        )}
      </div>
    </div>
  );
}
