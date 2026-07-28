
export interface InvoiceHistoryItem {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  jobTitle: string;
  total: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export const invoiceHistory: InvoiceHistoryItem[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'EMP-INV-2025-0041',
    date: 'Jan 15, 2025',
    dueDate: 'Jan 30, 2025',
    clientName: 'Jennifer Martinez',
    jobTitle: 'Crawlspace Moisture Remediation',
    total: 2475,
    balanceDue: 0,
    status: 'paid',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'EMP-INV-2025-0042',
    date: 'Jan 20, 2025',
    dueDate: 'Feb 3, 2025',
    clientName: 'Jennifer Martinez',
    jobTitle: 'Crawlspace Moisture Remediation',
    total: 2475,
    balanceDue: 2475,
    status: 'sent',
  },
  {
    id: 'inv-003',
    invoiceNumber: 'EMP-INV-2025-0038',
    date: 'Dec 28, 2024',
    dueDate: 'Jan 12, 2025',
    clientName: 'David Park',
    jobTitle: 'Water Heater Replacement',
    total: 1850,
    balanceDue: 1850,
    status: 'overdue',
  },
  {
    id: 'inv-004',
    invoiceNumber: 'EMP-INV-2025-0045',
    date: 'Jan 22, 2025',
    dueDate: 'Feb 5, 2025',
    clientName: 'Sarah Thompson',
    jobTitle: 'Kitchen Renovation - Plumbing',
    total: 3200,
    balanceDue: 3200,
    status: 'draft',
  },
];
