import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

type DocumentType = 'LR' | 'INVOICE' | 'EWAY_BILL' | 'POD';

interface FileDocument {
  id: number;
  document_type: DocumentType;
  lr_id?: number;
  hirememo_id?: number;
  original_filename: string;
  file_url: string;
  content_type?: string;
  file_size: number;
  created_at: string;
  is_archived: boolean;
}

interface FileUploadProps {
  title?: string;
  lrId?: number;
  hirememoId?: number;
  allowedDocumentTypes?: DocumentType[];
  defaultDocumentType?: DocumentType;
  fixedDocumentType?: DocumentType;
  allowArchive?: boolean;
  onUploaded?: (doc: FileDocument) => void;
}

const DEFAULT_TYPES: DocumentType[] = ['LR', 'INVOICE', 'EWAY_BILL', 'POD'];

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  title = 'Attachments',
  lrId,
  hirememoId,
  allowedDocumentTypes = DEFAULT_TYPES,
  defaultDocumentType = 'POD',
  fixedDocumentType,
  allowArchive = true,
  onUploaded,
}: FileUploadProps) {
  const effectiveTypes = useMemo(
    () => (fixedDocumentType ? [fixedDocumentType] : allowedDocumentTypes),
    [allowedDocumentTypes, fixedDocumentType],
  );
  const [documentType, setDocumentType] = useState<DocumentType>(
    fixedDocumentType || defaultDocumentType,
  );
  const [docs, setDocs] = useState<FileDocument[]>([]);
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const canUpload = Boolean((lrId && lrId > 0) || (hirememoId && hirememoId > 0));

  const loadDocuments = useCallback(async () => {
    if (!canUpload) {
      setDocs([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('/api/files/', {
        params: {
          lr_id: lrId,
          hirememo_id: hirememoId,
          document_type: fixedDocumentType || documentType,
          q: query || undefined,
        },
      });
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load documents', err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [canUpload, lrId, hirememoId, fixedDocumentType, documentType, query]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async () => {
    if (!selectedFile || !canUpload) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', fixedDocumentType || documentType);
      formData.append('file', selectedFile);
      if (lrId) formData.append('lr_id', String(lrId));
      if (hirememoId) formData.append('hirememo_id', String(hirememoId));

      const res = await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSelectedFile(null);
      await loadDocuments();
      onUploaded?.(res.data as FileDocument);
    } catch (err: any) {
      alert(`Upload failed: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleArchive = async (docId: number) => {
    if (!allowArchive) return;
    try {
      await axios.post(`/api/files/${docId}/archive`);
      await loadDocuments();
    } catch (err: any) {
      alert(`Archive failed: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{title}</h4>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files..."
          className="w-48 border border-slate-200 rounded-md px-2 py-1 text-xs"
        />
      </div>

      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40 space-y-2">
        {!canUpload && (
          <p className="text-xs text-amber-700">
            Save the record first to enable uploads.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Document Type</label>
            <select
              value={fixedDocumentType || documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              disabled={Boolean(fixedDocumentType)}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
            >
              {effectiveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Choose File</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm bg-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!canUpload || !selectedFile || uploading}
              className="w-full px-3 py-2 rounded bg-slate-900 text-white text-sm disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">File</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Size</th>
              <th className="text-left px-3 py-2">Uploaded</th>
              <th className="text-left px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>Loading files...</td>
              </tr>
            )}
            {!loading && docs.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>No files found.</td>
              </tr>
            )}
            {!loading && docs.map((doc) => (
              <tr key={doc.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <a
                    className="text-blue-700 hover:underline"
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {doc.original_filename}
                  </a>
                </td>
                <td className="px-3 py-2">{doc.document_type}</td>
                <td className="px-3 py-2">{formatBytes(doc.file_size)}</td>
                <td className="px-3 py-2">{new Date(doc.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  {allowArchive && !doc.is_archived && (
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700 text-xs"
                      onClick={() => handleArchive(doc.id)}
                    >
                      Archive
                    </button>
                  )}
                  {doc.is_archived && <span className="text-xs text-slate-500">Archived</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
