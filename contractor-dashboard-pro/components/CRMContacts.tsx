
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import CSVImportModal, { ImportedContact } from '../../../components/feature/CSVImportModal';

interface Contact {
  id: number;
  dbId: string;
  name: string;
  type: 'homeowner' | 'property_manager';
  email: string;
  phone: string;
  properties: number;
  jobs: number;
  lastContact: string;
  tags: string[];
  status: 'active' | 'inactive' | 'lead';
  address?: string;
  notes?: string;
}

const tagOptions = [
  'hvac', 'plumbing', 'roofing', 'electrical', 'painting',
  'remodeling', 'landscaping', 'flooring', 'commercial',
  'residential', 'high-value', 'repeat-customer', 'new-customer',
  'referral', 'urgent'
];

const emailTemplates = [
  {
    id: 'quote',
    label: 'Quote Follow-Up',
    subject: 'Your Project Quote from Emporva',
    body: 'Hi {name},\n\nThank you for your interest in our services. I wanted to follow up on the quote we discussed. Please let me know if you have any questions or would like to move forward.\n\nBest regards'
  },
  {
    id: 'schedule',
    label: 'Schedule Appointment',
    subject: "Let's Schedule Your Project",
    body: "Hi {name},\n\nI'd love to schedule a time to discuss your project in more detail. What days and times work best for you this week?\n\nLooking forward to hearing from you."
  },
  {
    id: 'complete',
    label: 'Job Completion',
    subject: 'Your Project is Complete!',
    body: "Hi {name},\n\nGreat news! Your project has been completed. Please take a moment to review the work and let us know if everything meets your expectations.\n\nWe'd also appreciate a review if you're happy with the results.\n\nThank you for choosing us!"
  },
  {
    id: 'checkin',
    label: 'Check-In',
    subject: 'Checking In - How Can We Help?',
    body: "Hi {name},\n\nIt's been a while since we last connected. I wanted to check in and see if there are any home improvement projects we can help you with.\n\nFeel free to reach out anytime."
  }
];

const smsTemplates = [
  {
    id: 'confirm',
    label: 'Appointment Confirmation',
    body: 'Hi {name}, this is a reminder about your upcoming appointment. Please reply to confirm or let us know if you need to reschedule.'
  },
  {
    id: 'onway',
    label: 'On My Way',
    body: "Hi {name}, just letting you know I'm on my way and should arrive in about 15 minutes."
  },
  {
    id: 'update',
    label: 'Project Update',
    body: "Hi {name}, quick update on your project: everything is on track and progressing well. I'll send a detailed update soon."
  },
  {
    id: 'followup',
    label: 'Follow-Up',
    body: 'Hi {name}, just following up on our recent conversation. Let me know if you have any questions or are ready to move forward!'
  }
];

interface AddContactForm {
  firstName: string;
  lastName: string;
  type: 'homeowner' | 'property_manager';
  status: 'active' | 'inactive' | 'lead';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  tags: string[];
  notes: string;
}

const emptyForm: AddContactForm = {
  firstName: '',
  lastName: '',
  type: 'homeowner',
  status: 'lead',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  tags: [],
  notes: ''
};

export default function CRMContacts() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'homeowner' | 'property_manager'>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<AddContactForm>({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('contractor_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      setContacts(data.map((c, idx) => {
        const lastContactDate = c.last_contacted ? new Date(c.last_contacted) : null;
        let lastContactStr = 'Never';
        if (lastContactDate) {
          const diffDays = Math.floor((Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
          lastContactStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? `${diffDays} days ago` : diffDays < 30 ? `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago` : `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
        }
        return {
          id: idx + 1,
          dbId: c.id,
          name: c.name,
          type: 'homeowner' as const,
          email: c.email || '',
          phone: c.phone || '',
          properties: 0,
          jobs: 0,
          lastContact: lastContactStr,
          tags: (c.tags as string[]) || [],
          status: (c.tags as string[])?.includes('lead') ? 'lead' as const : 'active' as const,
          address: c.address || '',
          notes: c.notes || '',
        };
      }));
    }
  }, [user]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // SMS modal state
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsBody, setSmsBody] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<AddContactForm>({ ...emptyForm });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contact.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const validateForm = (f: AddContactForm): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!f.firstName.trim()) errors.firstName = 'First name is required';
    if (!f.lastName.trim()) errors.lastName = 'Last name is required';
    if (!f.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!f.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (f.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Enter a complete phone number';
    }
    return errors;
  };

  const handleAddContact = async () => {
    if (!user) return;
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);

    const fullAddress = form.address.trim()
      ? `${form.address.trim()}, ${form.city.trim()}, ${form.state.trim()} ${form.zip.trim()}`
      : null;

    const { data, error } = await supabase.from('contractor_contacts').insert({
      user_id: user.id,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone || null,
      address: fullAddress,
      tags: form.tags,
      notes: form.notes.trim() || null,
      source: 'manual',
      last_contacted: new Date().toISOString(),
    }).select('id').single();

    if (error) { setSaving(false); return; }

    const newContact: Contact = {
      id: Date.now(),
      dbId: data.id,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      type: form.type,
      email: form.email.trim(),
      phone: form.phone,
      properties: form.address.trim() ? 1 : 0,
      jobs: 0,
      lastContact: 'Just now',
      tags: form.tags,
      status: form.status,
      address: fullAddress || undefined,
      notes: form.notes.trim() || undefined
    };
    setContacts(prev => [newContact, ...prev]);
    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setShowAddModal(false);
      setForm({ ...emptyForm });
      setFormErrors({});
      setSelectedContact(newContact);
    }, 1500);
  };

  const toggleTag = (tag: string, isEdit?: boolean) => {
    if (isEdit) {
      setEditForm(prev => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      }));
    } else {
      setForm(prev => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      }));
    }
  };

  const openAddModal = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setSaving(false);
    setShowSuccess(false);
    setShowAddModal(true);
  };

  // --- Email ---
  const openEmailModal = () => {
    if (!selectedContact) return;
    setEmailSubject('');
    setEmailBody('');
    setEmailSending(false);
    setEmailSent(false);
    setShowEmailModal(true);
  };

  const applyEmailTemplate = (tpl: typeof emailTemplates[0]) => {
    if (!selectedContact) return;
    const firstName = selectedContact.name.split(' ')[0];
    setEmailSubject(tpl.subject);
    setEmailBody(tpl.body.replace(/\{name\}/g, firstName));
  };

  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      setEmailSent(true);
      if (selectedContact) {
        setContacts(prev =>
          prev.map(c => (c.id === selectedContact.id ? { ...c, lastContact: 'Just now' } : c))
        );
        setSelectedContact(prev => (prev ? { ...prev, lastContact: 'Just now' } : prev));
      }
      setTimeout(() => {
        setShowEmailModal(false);
        setToast({ message: `Email sent to ${selectedContact?.name}`, type: 'success' });
      }, 1500);
    }, 1500);
  };

  // --- SMS ---
  const openSmsModal = () => {
    if (!selectedContact) return;
    setSmsBody('');
    setSmsSending(false);
    setSmsSent(false);
    setShowSmsModal(true);
  };

  const applySmsTemplate = (tpl: typeof smsTemplates[0]) => {
    if (!selectedContact) return;
    const firstName = selectedContact.name.split(' ')[0];
    setSmsBody(tpl.body.replace(/\{name\}/g, firstName));
  };

  const handleSendSms = () => {
    if (!smsBody.trim()) return;
    setSmsSending(true);
    setTimeout(() => {
      setSmsSending(false);
      setSmsSent(true);
      if (selectedContact) {
        setContacts(prev =>
          prev.map(c => (c.id === selectedContact.id ? { ...c, lastContact: 'Just now' } : c))
        );
        setSelectedContact(prev => (prev ? { ...prev, lastContact: 'Just now' } : prev));
      }
      setTimeout(() => {
        setShowSmsModal(false);
        setToast({ message: `SMS sent to ${selectedContact?.name}`, type: 'success' });
      }, 1500);
    }, 1500);
  };

  // --- Edit ---
  const openEditModal = () => {
    if (!selectedContact) return;
    const nameParts = selectedContact.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    let address = '',
      city = '',
      state = '',
      zip = '';
    if (selectedContact.address) {
      const parts = selectedContact.address.split(',').map(s => s.trim());
      address = parts[0] || '';
      city = parts[1] || '';
      const stateZip = (parts[2] || '').split(' ').filter(Boolean);
      state = stateZip[0] || '';
      zip = stateZip[1] || '';
    }
    setEditForm({
      firstName,
      lastName,
      type: selectedContact.type,
      status: selectedContact.status,
      email: selectedContact.email,
      phone: selectedContact.phone,
      address,
      city,
      state,
      zip,
      tags: [...selectedContact.tags],
      notes: selectedContact.notes || ''
    });
    setEditErrors({});
    setEditSaving(false);
    setEditSuccess(false);
    setShowEditModal(true);
  };

  const handleEditContact = () => {
    const errors = validateForm(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setEditSaving(true);
    setTimeout(() => {
      const updated: Contact = {
        ...selectedContact!,
        name: `${editForm.firstName.trim()} ${editForm.lastName.trim()}`,
        type: editForm.type,
        status: editForm.status,
        email: editForm.email.trim(),
        phone: editForm.phone,
        tags: editForm.tags,
        address: editForm.address.trim()
          ? `${editForm.address.trim()}, ${editForm.city.trim()}, ${editForm.state.trim()} ${editForm.zip.trim()}`
          : undefined,
        notes: editForm.notes.trim() || undefined,
        properties: editForm.address.trim()
          ? Math.max(selectedContact!.properties, 1)
          : selectedContact!.properties
      };
      setContacts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setSelectedContact(updated);
      setEditSaving(false);
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setToast({ message: `${updated.name} updated successfully`, type: 'success' });
      }, 1500);
    }, 1200);
  };

  // --- Delete ---
  const openDeleteConfirm = () => {
    if (!selectedContact) return;
    setDeleting(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    setDeleting(true);

    if (selectedContact.dbId) {
      await supabase.from('contractor_contacts').delete().eq('id', selectedContact.dbId);
    }

    const name = selectedContact.name;
    setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
    setSelectedContact(null);
    setShowDeleteConfirm(false);
    setDeleting(false);
    setToast({ message: `${name} removed from CRM`, type: 'info' });
  };

  // --- Shared form fields renderer ---
  const renderContactFormFields = (
    f: AddContactForm,
    setF: (fn: (prev: AddContactForm) => AddContactForm) => void,
    errors: Record<string, string>,
    setErrors: (fn: (prev: Record<string, string>) => Record<string, string>) => void,
    isEdit?: boolean
  ) => (
    <div className="space-y-6">
      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={f.firstName}
            onChange={e => {
              setF(p => ({ ...p, firstName: e.target.value }));
              setErrors(p => ({ ...p, firstName: '' }));
            }}
            placeholder="e.g. John"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm ${
              errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={f.lastName}
            onChange={e => {
              setF(p => ({ ...p, lastName: e.target.value }));
              setErrors(p => ({ ...p, lastName: '' }));
            }}
            placeholder="e.g. Smith"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm ${
              errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Type & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Contact Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setF(p => ({ ...p, type: 'homeowner' }))}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${
                f.type === 'homeowner'
                  ? 'border-[#0B1F33] bg-[#0B1F33] text-white'
                  : 'border-gray-200 text-[#6B7C8F] hover:border-gray-300'
              }`}
            >
              <i className="ri-home-4-line mr-1.5"></i>Homeowner
            </button>
            <button
              type="button"
              onClick={() => setF(p => ({ ...p, type: 'property_manager' }))}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${
                f.type === 'property_manager'
                  ? 'border-[#0B1F33] bg-[#0B1F33] text-white'
                  : 'border-gray-200 text-[#6B7C8F] hover:border-gray-300'
              }`}
            >
              <i className="ri-building-2-line mr-1.5"></i>Prop. Manager
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Status</label>
          <select
            value={f.status}
            onChange={e => setF(p => ({ ...p, status: e.target.value as any }))}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
          >
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F] text-sm"></i>
            <input
              type="email"
              value={f.email}
              onChange={e => {
                setF(p => ({ ...p, email: e.target.value }));
                setErrors(p => ({ ...p, email: '' }));
              }}
              placeholder="email@example.com"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F] text-sm"></i>
            <input
              type="tel"
              value={f.phone}
              onChange={e => {
                setF(p => ({ ...p, phone: formatPhone(e.target.value) }));
                setErrors(p => ({ ...p, phone: '' }));
              }}
              placeholder="(555) 000-0000"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm ${
                errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
          <i className="ri-map-pin-line mr-1.5 text-[#6B7C8F]"></i>Property Address
          <span className="text-xs text-[#6B7C8F] font-normal ml-2">(optional)</span>
        </label>
        <input
          type="text"
          value={f.address}
          onChange={e => setF(p => ({ ...p, address: e.target.value }))}
          placeholder="Street address"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm mb-3"
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={f.city}
            onChange={e => setF(p => ({ ...p, city: e.target.value }))}
            placeholder="City"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
          />
          <input
            type="text"
            value={f.state}
            onChange={e => setF(p => ({ ...p, state: e.target.value.toUpperCase().slice(0, 2) }))}
            placeholder="State"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
          />
          <input
            type="text"
            value={f.zip}
            onChange={e => setF(p => ({ ...p, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
            placeholder="ZIP"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
          Tags <span className="text-xs text-[#6B7C8F] font-normal ml-2">Select all that apply</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag, isEdit)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                f.tags.includes(tag)
                  ? 'bg-[#0B1F33] text-white border-[#0B1F33]'
                  : 'bg-white text-[#6B7C8F] border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.tags.includes(tag) && <i className="ri-check-line mr-1"></i>}
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
          Internal Notes <span className="text-xs text-[#6B7C8F] font-normal ml-2">(optional)</span>
        </label>
        <textarea
          value={f.notes}
          onChange={e => setF(p => ({ ...p, notes: e.target.value }))}
          placeholder="Add any internal notes about this contact..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm resize-none"
          rows={3}
          maxLength={500}
        ></textarea>
        <p className="text-xs text-[#6B7C8F] text-right mt-1">{f.notes.length}/500</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border animate-[slideIn_0.3s_ease] ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-[#0B1F33] border-[#0B1F33] text-white'
          }`}
        >
          <i
            className={`text-lg ${
              toast.type === 'success'
                ? 'ri-check-double-line'
                : toast.type === 'error'
                ? 'ri-error-warning-line'
                : 'ri-information-line'
            }`}
          ></i>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33]">CRM: Contacts &amp; Properties</h2>
            <p className="text-sm text-[#6B7C8F] mt-1">Manage your customer relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCSVImport(true)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-[#6B7C8F] hover:bg-[#F9F9FB] transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-upload-cloud-line mr-2"></i>
              Bulk Import
            </button>
            <button
              onClick={openAddModal}
              className="bg-[#0B1F33] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-add-line mr-2"></i>
              Add Contact
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F]"></i>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="homeowner">Homeowners</option>
            <option value="property_manager">Property Managers</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* Contact List */}
        <div className="space-y-3">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedContact?.id === contact.id
                  ? 'border-[#0B1F33] bg-[#F9F9FB]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold">
                    {contact.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B1F33]">{contact.name}</h3>
                    <p className="text-xs text-[#6B7C8F] capitalize">{contact.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    contact.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : contact.status === 'lead'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {contact.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#6B7C8F] mb-2">
                <span>
                  <i className="ri-building-line mr-1"></i>
                  {contact.properties} {contact.properties === 1 ? 'property' : 'properties'}
                </span>
                <span>
                  <i className="ri-briefcase-line mr-1"></i>
                  {contact.jobs} jobs
                </span>
                <span>
                  <i className="ri-time-line mr-1"></i>
                  {contact.lastContact}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {contact.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-[#F9F9FB] text-[#6B7C8F] rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-[#6B7C8F]">
              <i className="ri-user-search-line text-4xl mb-3 block"></i>
              <p className="text-sm">No contacts found</p>
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div>
          {selectedContact ? (
            <div className="bg-[#F9F9FB] rounded-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold text-xl">
                    {selectedContact.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]">{selectedContact.name}</h3>
                    <p className="text-sm text-[#6B7C8F] capitalize">{selectedContact.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={openEditModal}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7C8F] hover:text-[#0B1F33] hover:bg-white transition-all cursor-pointer"
                    title="Edit contact"
                  >
                    <i className="ri-edit-line text-lg"></i>
                  </button>
                  <button
                    onClick={openDeleteConfirm}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7C8F] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    title="Delete contact"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-[#6B7C8F] mb-1">Email</p>
                  <p className="text-sm font-semibold text-[#0B1F33]">{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7C8F] mb-1">Phone</p>
                  <p className="text-sm font-semibold text-[#0B1F33]">{selectedContact.phone}</p>
                </div>
                {selectedContact.address && (
                  <div>
                    <p className="text-xs text-[#6B7C8F] mb-1">Address</p>
                    <p className="text-sm font-semibold text-[#0B1F33]">{selectedContact.address}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#6B7C8F] mb-1">Last Contact</p>
                  <p className="text-sm font-semibold text-[#0B1F33]">{selectedContact.lastContact}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={openEmailModal}
                  className="bg-[#0B1F33] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3a52] transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-mail-send-line"></i>
                  Send Email
                </button>
                <button
                  onClick={openSmsModal}
                  className="bg-white text-[#0B1F33] px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-chat-1-line"></i>
                  Send SMS
                </button>
              </div>

              {/* Properties */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Properties</h4>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0B1F33]">123 Main Street</p>
                      <p className="text-xs text-[#6B7C8F]">Springfield, IL 62701</p>
                    </div>
                    <button className="text-[#0B1F33] hover:text-[#D4B483] cursor-pointer">
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Jobs */}
              <div>
                <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Recent Jobs</h4>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-[#0B1F33]">HVAC Maintenance</p>
                      <span className="text-xs text-green-600 font-semibold">Completed</span>
                    </div>
                    <p className="text-xs text-[#6B7C8F]">Completed 2 weeks ago</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-[#0B1F33]">Water Heater Replacement</p>
                      <span className="text-xs text-[#0B1F33] font-semibold">In Progress</span>
                    </div>
                    <p className="text-xs text-[#6B7C8F]">Started 3 days ago</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Internal Notes</h4>
                <textarea
                  placeholder="Add notes about this contact..."
                  defaultValue={selectedContact.notes || ''}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                  rows={3}
                  maxLength={500}
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="bg-[#F9F9FB] rounded-lg p-12 text-center">
              <i className="ri-contacts-line text-6xl text-[#6B7C8F] mb-4"></i>
              <p className="text-[#6B7C8F]">Select a contact to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* ========== ADD CONTACT MODAL ========== */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !saving && setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {showSuccess ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-check-line text-4xl text-green-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Contact Added!</h3>
                <p className="text-[#6B7C8F]">
                  {form.firstName} {form.lastName} has been added to your CRM.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]">Add New Contact</h3>
                    <p className="text-sm text-[#6B7C8F] mt-1">
                      Fill in the details to add a contact to your CRM
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={saving}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all cursor-pointer text-[#6B7C8F]"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div className="p-6">{renderContactFormFields(form, setForm, formErrors, setFormErrors, false)}</div>
                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-[#F9F9FB] rounded-b-2xl">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={saving}
                    className="px-5 py-2.5 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddContact}
                    disabled={saving}
                    className="bg-[#0B1F33] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>Saving...
                      </>
                    ) : (
                      <>
                        <i className="ri-user-add-line"></i>Add Contact
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========== EDIT CONTACT MODAL ========== */}
      {showEditModal && selectedContact && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !editSaving && setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {editSuccess ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-check-line text-4xl text-green-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Contact Updated!</h3>
                <p className="text-[#6B7C8F]">
                  {editForm.firstName} {editForm.lastName} has been updated.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]">Edit Contact</h3>
                    <p className="text-sm text-[#6B7C8F] mt-1">
                      Update {selectedContact.name}'s information
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={editSaving}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all cursor-pointer text-[#6B7C8F]"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div className="p-6">{renderContactFormFields(editForm, setEditForm, editErrors, setEditErrors, true)}</div>
                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-[#F9F9FB] rounded-b-2xl">
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={editSaving}
                    className="px-5 py-2.5 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditContact}
                    disabled={editSaving}
                    className="bg-[#0B1F33] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center gap-2"
                  >
                    {editSaving ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>Saving...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line"></i>Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {showDeleteConfirm && selectedContact && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <i className="ri-delete-bin-line text-3xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Delete Contact?</h3>
              <p className="text-sm text-[#6B7C8F] mb-1">
                Are you sure you want to remove <strong>{selectedContact.name}</strong> from your CRM?
              </p>
              <p className="text-xs text-[#6B7C8F] mb-6">
                This will remove all associated data including notes, tags, and job history. This action
                cannot be undone.
              </p>

              <div className="bg-[#F9F9FB] rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1F33]">{selectedContact.name}</p>
                    <p className="text-xs text-[#6B7C8F]">
                      {selectedContact.email} &middot; {selectedContact.jobs} jobs
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#0B1F33] bg-[#F9F9FB] hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteContact}
                  disabled={deleting}
                  className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>Deleting...
                    </>
                  ) : (
                    <>
                      <i className="ri-delete-bin-line"></i>Delete Contact
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== SEND EMAIL MODAL ========== */}
      {showEmailModal && selectedContact && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !emailSending && setShowEmailModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {emailSent ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-mail-check-line text-4xl text-green-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">Email Sent!</h3>
                <p className="text-[#6B7C8F]">
                  Your email to {selectedContact.name} has been delivered.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]">Send Email</h3>
                    <p className="text-sm text-[#6B7C8F] mt-1">
                      Compose an email to {selectedContact.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    disabled={emailSending}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all cursor-pointer text-[#6B7C8F]"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Recipient */}
                  <div className="flex items-center gap-3 bg-[#F9F9FB] rounded-lg p-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0B1F33]">{selectedContact.name}</p>
                      <p className="text-xs text-[#6B7C8F] truncate">{selectedContact.email}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200">
                      <i className="ri-mail-line text-xs text-[#6B7C8F]"></i>
                      <span className="text-xs text-[#6B7C8F]">Email</span>
                    </div>
                  </div>

                  {/* Templates */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                      Quick Templates
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {emailTemplates.map(tpl => (
                        <button
                          key={tpl.id}
                          onClick={() => applyEmailTemplate(tpl)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-[#6B7C8F] hover:border-[#0B1F33] hover:text-[#0B1F33] hover:bg-[#F9F9FB] transition-all cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-file-text-line mr-1"></i>
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      placeholder="Write your email message..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm resize-none"
                      rows={8}
                      maxLength={500}
                    ></textarea>
                    <p className="text-xs text-[#6B7C8F] text-right mt-1">{emailBody.length}/500</p>
                  </div>

                  {/* Signature preview */}
                  <div className="bg-[#F9F9FB] rounded-lg p-4 border border-gray-100">
                    <p className="text-xs text-[#6B7C8F] mb-1">Signature</p>
                    <p className="text-sm text-[#0B1F33] font-semibold">Mike Reynolds</p>
                    <p className="text-xs text-[#6B7C8F]">
                      Reynolds Contracting &middot; (555) 100-2000
                    </p>
                    <p className="text-xs text-[#6B7C8F]">mike@reynoldscontracting.com</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-[#F9F9FB] rounded-b-2xl">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    disabled={emailSending}
                    className="px-5 py-2.5 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
                    className="bg-[#0B1F33] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 flex items-center gap-2"
                  >
                    {emailSending ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>Sending...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-line"></i>Send Email
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========== SEND SMS MODAL ========== */}
      {showSmsModal && selectedContact && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !smsSending && setShowSmsModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {smsSent ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-chat-check-line text-4xl text-green-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">SMS Sent!</h3>
                <p className="text-[#6B7C8F]">
                  Your message to {selectedContact.name} has been delivered.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]">Send SMS</h3>
                    <p className="text-sm text-[#6B7C8F] mt-1">
                      Text message to {selectedContact.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSmsModal(false)}
                    disabled={smsSending}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all cursor-pointer text-[#6B7C8F]"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Recipient */}
                  <div className="flex items-center gap-3 bg-[#F9F9FB] rounded-lg p-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0B1F33]">{selectedContact.name}</p>
                      <p className="text-xs text-[#6B7C8F]">{selectedContact.phone}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200">
                      <i className="ri-smartphone-line text-xs text-[#6B7C8F]"></i>
                      <span className="text-xs text-[#6B7C8F]">SMS</span>
                    </div>
                  </div>

                  {/* Templates */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                      Quick Templates
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {smsTemplates.map(tpl => (
                        <button
                          key={tpl.id}
                          onClick={() => applySmsTemplate(tpl)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-[#6B7C8F] hover:border-[#0B1F33] hover:text-[#0B1F33] hover:bg-[#F9F9FB] transition-all cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-chat-1-line mr-1"></i>
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={smsBody}
                      onChange={e => setSmsBody(e.target.value.slice(0, 320))}
                      placeholder="Type your text message..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm resize-none"
                      rows={5}
                    ></textarea>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-[#6B7C8F]">
                        {smsBody.length <= 160 ? '1 segment' : `${Math.ceil(smsBody.length / 160)} segments`}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          smsBody.length > 300 ? 'text-amber-600' : 'text-[#6B7C8F]'
                        }`}
                      >
                        {smsBody.length}/320
                      </p>
                    </div>
                  </div>

                  {/* SMS info */}
                  <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <i className="ri-information-line text-amber-600 mt-0.5"></i>
                    <p className="text-xs text-amber-800">
                      Standard messaging rates may apply. Messages over 160 characters will be sent as
                      multiple segments.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-[#F9F9FB] rounded-b-2xl">
                  <button
                    onClick={() => setShowSmsModal(false)}
                    disabled={smsSending}
                    className="px-5 py-2.5 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendSms}
                    disabled={smsSending || !smsBody.trim()}
                    className="bg-[#0B1F33] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 flex items-center gap-2"
                  >
                    {smsSending ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>Sending...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-line"></i>Send SMS
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCSVImport && (
        <CSVImportModal
          onClose={() => setShowCSVImport(false)}
          onImport={async (contacts: ImportedContact[]) => {
            if (!user) return;
            const rows = contacts.map(c => ({
              user_id: user.id,
              name: c.name,
              email: c.email,
              phone: c.phone || null,
              address: c.address || null,
              notes: c.notes || null,
              source: 'manual',
              tags: [],
              last_contacted: new Date().toISOString(),
            }));
            await supabase.from('contractor_contacts').insert(rows);
            await fetchContacts();
          }}
          title="Import Contacts"
        />
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
