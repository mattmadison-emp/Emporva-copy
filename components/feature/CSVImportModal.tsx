import { useState, useRef, useCallback } from 'react';
import * as Papa from 'papaparse';

interface ImportedContact {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

interface CSVImportModalProps {
  onClose: () => void;
  onImport: (contacts: ImportedContact[]) => Promise<void>;
  title?: string;
}

type Step = 'upload' | 'map' | 'preview' | 'importing' | 'done';
type ContactField = 'name' | 'email' | 'phone' | 'address' | 'notes' | '__skip__';

const FIELD_OPTIONS: { value: ContactField; label: string }[] = [
  { value: '__skip__', label: 'Skip this column' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Address' },
  { value: 'notes', label: 'Notes' },
];

const HEADER_HINTS: Record<string, ContactField> = {
  name: 'name',
  'full name': 'name',
  'full_name': 'name',
  'first name': 'name',
  'contact name': 'name',
  email: 'email',
  'email address': 'email',
  'e-mail': 'email',
  phone: 'phone',
  'phone number': 'phone',
  telephone: 'phone',
  mobile: 'phone',
  cell: 'phone',
  address: 'address',
  'street address': 'address',
  location: 'address',
  notes: 'notes',
  note: 'notes',
  comments: 'notes',
  comment: 'notes',
  description: 'notes',
};

function autoDetectMapping(headers: string[]): Record<number, ContactField> {
  const mapping: Record<number, ContactField> = {};
  const used = new Set<ContactField>();

  headers.forEach((header, index) => {
    const normalized = header.trim().toLowerCase();
    const match = HEADER_HINTS[normalized];
    if (match && !used.has(match)) {
      mapping[index] = match;
      used.add(match);
    } else {
      mapping[index] = '__skip__';
    }
  });

  return mapping;
}

function buildContacts(
  rows: string[][],
  mapping: Record<number, ContactField>
): { valid: ImportedContact[]; invalid: number } {
  let invalid = 0;
  const valid: ImportedContact[] = [];

  for (const row of rows) {
    const contact: Record<string, string> = {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    };

    for (const [colIndex, field] of Object.entries(mapping)) {
      if (field === '__skip__') continue;
      const value = row[Number(colIndex)]?.trim() ?? '';
      if (field === 'notes' && contact.notes) {
        contact.notes += '; ' + value;
      } else {
        contact[field] = value;
      }
    }

    if (!contact.name || !contact.email) {
      invalid++;
      continue;
    }

    valid.push({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      notes: contact.notes || undefined,
    });
  }

  return { valid, invalid };
}

export default function CSVImportModal({
  onClose,
  onImport,
  title = 'Import Contacts from CSV',
}: CSVImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, ContactField>>({});
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    Papa.parse(file, {
      skipEmptyLines: true,
      complete(results) {
        const data = results.data as string[][];
        if (data.length < 2) {
          setError('File must contain a header row and at least one data row.');
          return;
        }
        const fileHeaders = data[0];
        const fileRows = data.slice(1);
        setHeaders(fileHeaders);
        setRows(fileRows);
        setMapping(autoDetectMapping(fileHeaders));
        setStep('map');
      },
      error() {
        setError('Failed to parse the file. Please check the format and try again.');
      },
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateMapping = (colIndex: number, field: ContactField) => {
    setMapping((prev) => ({ ...prev, [colIndex]: field }));
  };

  const hasMappedField = (field: ContactField) =>
    Object.values(mapping).includes(field);

  const canProceedToPreview = hasMappedField('name') && hasMappedField('email');

  const { valid, invalid } = step === 'preview' || step === 'importing' || step === 'done'
    ? buildContacts(rows, mapping)
    : { valid: [], invalid: 0 };

  const previewRows = rows.slice(0, 5);

  const handleImport = async () => {
    setStep('importing');
    try {
      const { valid: contacts } = buildContacts(rows, mapping);
      await onImport(contacts);
      setImportedCount(contacts.length);
      setStep('done');
    } catch {
      setError('Import failed. Please try again.');
      setStep('preview');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#0B1F33]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-2xl" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 text-xs text-[#6B7C8F]">
            {['Upload', 'Map Columns', 'Preview & Confirm'].map((label, i) => {
              const stepOrder: Step[] = ['upload', 'map', 'preview'];
              const currentIdx = ['upload', 'map', 'preview', 'importing', 'done'].indexOf(step);
              const isActive = currentIdx >= i;
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`w-8 h-px ${isActive ? 'bg-[#0B1F33]' : 'bg-gray-200'}`}
                    />
                  )}
                  <span
                    className={`font-semibold ${
                      isActive ? 'text-[#0B1F33]' : 'text-[#6B7C8F]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* ── Upload Step ── */}
          {step === 'upload' && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-[#0B1F33] bg-[#F9F9FB]'
                    : 'border-gray-200 hover:border-gray-300 bg-[#F9F9FB]'
                }`}
              >
                <i className="ri-upload-cloud-line text-4xl text-[#6B7C8F] mb-3 block" />
                <p className="text-[#0B1F33] font-semibold mb-1">
                  Drag & drop your file here
                </p>
                <p className="text-sm text-[#6B7C8F]">
                  or click to browse. Supports .csv, .xlsx, .xls
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </div>
          )}

          {/* ── Map Columns Step ── */}
          {step === 'map' && (
            <div>
              <p className="text-sm text-[#6B7C8F] mb-4">
                We detected <strong className="text-[#0B1F33]">{rows.length}</strong> rows and{' '}
                <strong className="text-[#0B1F33]">{headers.length}</strong> columns. Map each
                column to a contact field.
              </p>

              <div className="space-y-3">
                {headers.map((header, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex items-center gap-3 bg-[#F9F9FB] rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#0B1F33] truncate block">
                        {header}
                      </span>
                      <span className="text-xs text-[#6B7C8F] truncate block">
                        e.g. {rows[0]?.[colIndex] ?? '—'}
                      </span>
                    </div>
                    <i className="ri-arrow-right-line text-[#6B7C8F]" />
                    <select
                      value={mapping[colIndex] ?? '__skip__'}
                      onChange={(e) =>
                        updateMapping(colIndex, e.target.value as ContactField)
                      }
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0B1F33] w-40 cursor-pointer"
                    >
                      {FIELD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {!canProceedToPreview && (
                <p className="mt-3 text-sm text-amber-600">
                  <i className="ri-information-line mr-1" />
                  You must map at least a <strong>Name</strong> and <strong>Email</strong> column
                  to continue.
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setStep('upload');
                    setHeaders([]);
                    setRows([]);
                    setMapping({});
                  }}
                  className="flex-1 bg-gray-200 text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!canProceedToPreview}
                  className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#142e47] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Preview Data
                </button>
              </div>
            </div>
          )}

          {/* ── Preview Step ── */}
          {step === 'preview' && (
            <div>
              {/* Validation summary */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-lg px-4 py-2 text-sm font-medium">
                  <i className="ri-check-line" />
                  {valid.length} valid row{valid.length !== 1 && 's'}
                </div>
                {invalid > 0 && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm font-medium">
                    <i className="ri-close-line" />
                    {invalid} invalid row{invalid !== 1 && 's'} (missing name or email)
                  </div>
                )}
              </div>

              {/* Preview table */}
              <div className="border border-gray-200 rounded-lg overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F9F9FB]">
                      {Object.entries(mapping)
                        .filter(([, field]) => field !== '__skip__')
                        .map(([, field]) => (
                          <th
                            key={field}
                            className="text-left px-4 py-2 font-semibold text-[#0B1F33] capitalize"
                          >
                            {field}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t border-gray-100">
                        {Object.entries(mapping)
                          .filter(([, field]) => field !== '__skip__')
                          .map(([colIndex, field]) => (
                            <td
                              key={field}
                              className="px-4 py-2 text-[#0B1F33] truncate max-w-[180px]"
                            >
                              {row[Number(colIndex)] ?? '—'}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 5 && (
                <p className="text-xs text-[#6B7C8F] mb-4">
                  Showing first 5 of {rows.length} rows.
                </p>
              )}

              {error && (
                <p className="mb-4 text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('map');
                    setError('');
                  }}
                  className="flex-1 bg-gray-200 text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={valid.length === 0}
                  className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#142e47] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <i className="ri-file-excel-line mr-2" />
                  Import {valid.length} Contact{valid.length !== 1 && 's'}
                </button>
              </div>
            </div>
          )}

          {/* ── Importing Step ── */}
          {step === 'importing' && (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0B1F33] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#0B1F33] font-semibold">Importing contacts...</p>
              <p className="text-sm text-[#6B7C8F] mt-1">This may take a moment.</p>
            </div>
          )}

          {/* ── Done Step ── */}
          {step === 'done' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-3xl text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-[#0B1F33] mb-1">Import Complete</p>
              <p className="text-[#6B7C8F]">
                Successfully imported <strong className="text-[#0B1F33]">{importedCount}</strong>{' '}
                contact{importedCount !== 1 && 's'}.
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-[#0B1F33] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#142e47] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { CSVImportModalProps, ImportedContact };
