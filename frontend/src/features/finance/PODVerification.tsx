import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { confirmDestructiveAction } from '@/utils/destructiveAction';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface PodFileRow {
  id: number;
  lr_id?: number;
  lr_number?: string;
  consignor_name?: string;
  consignee_name?: string;
  original_filename: string;
  file_url: string;
  created_at: string;
  is_archived: boolean;
  pod_verified_at?: string;
  lr_status?: string;
}

export default function PODVerification() {
  const currentFy = getCurrentFy();
  const fyOptions = generateFyDropdownOptions(currentFy);
  const [fy, setFy] = useState(currentFy);
  const [rows, setRows] = useState<PodFileRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [lrNumber, setLrNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifyPreview, setVerifyPreview] = useState<PodFileRow | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/files/', {
        params: {
          document_type: 'POD',
          q: query || undefined,
          fy,
          include_archived: includeArchived,
        },
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load POD files', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [query, includeArchived, fy]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const handleUpload = async () => {
    if (!lrNumber.trim() || !selectedFile) return;
    setUploading(true);
    try {
      const lrRes = await axios.get(`/api/lr/by-number/${encodeURIComponent(lrNumber.trim())}`);
      const lrId = Number(lrRes.data?.id);
      if (!Number.isFinite(lrId) || lrId <= 0) {
        throw new Error('Invalid LR id');
      }

      const formData = new FormData();
      formData.append('document_type', 'POD');
      formData.append('lr_id', String(lrId));
      formData.append('file', selectedFile);

      await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLrNumber('');
      setSelectedFile(null);
      await loadRows();
    } catch (err: any) {
      alert(`POD upload failed: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (lrId?: number) => {
    if (!lrId) return;
    try {
      await axios.post(`/api/lr/${lrId}/pod/verify`);
      await loadRows();
      setVerifyPreview(null);
    } catch (err: any) {
      alert(`POD verification failed: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirmDestructiveAction({ action: 'Archive POD file' })) return;
    try {
      await axios.post(`/api/files/${id}/archive`);
      await loadRows();
    } catch (err: any) {
      alert(`Archive failed: ${err?.response?.data?.detail || err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">POD Management</h2>
          <p className="text-sm text-slate-500 mt-1">Upload, search, verify, and archive POD documents</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={lrNumber}
          onChange={(e) => setLrNumber(e.target.value)}
          placeholder="LR Number (for POD upload)"
          className="border rounded px-3 py-2"
        />
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="border rounded px-3 py-2"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!lrNumber.trim() || !selectedFile || uploading}
          className="px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Upload POD'}
        </button>
        <div className="flex items-center gap-2">
          <input
            id="pod_include_archived"
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          <label htmlFor="pod_include_archived" className="text-sm text-slate-700">Include archived</label>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="mb-3 flex items-center gap-2">
          <label htmlFor="pod_fy" className="text-sm font-medium text-slate-700">FY</label>
          <select
            id="pod_fy"
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            {fyOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search LR No / Party / File name"
          className="w-full md:w-96 border rounded px-3 py-2"
        />
      </div>

      <div className="bg-white border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">LR No</th>
              <th className="text-left px-3 py-2">Consignor</th>
              <th className="text-left px-3 py-2">Consignee</th>
              <th className="text-left px-3 py-2">File</th>
              <th className="text-left px-3 py-2">Uploaded</th>
              <th className="text-left px-3 py-2">POD Status</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-slate-500">Loading POD files...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-slate-500">No POD files found.</td>
              </tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">
                  {row.lr_id ? (
                    <a
                      href={`/operations/lr/${row.lr_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      {row.lr_number || `LR-${row.lr_id}`}
                    </a>
                  ) : (
                    row.lr_number || '-'
                  )}
                </td>
                <td className="px-3 py-2">{row.consignor_name || '-'}</td>
                <td className="px-3 py-2">{row.consignee_name || '-'}</td>
                <td className="px-3 py-2">
                  <a href={row.file_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                    {row.original_filename}
                  </a>
                </td>
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  {row.is_archived && <span className="text-slate-500">Archived</span>}
                  {!row.is_archived && row.pod_verified_at && <span className="text-emerald-700 font-medium">Verified</span>}
                  {!row.is_archived && !row.pod_verified_at && <span className="text-amber-700 font-medium">Pending</span>}
                </td>
                <td className="px-3 py-2 space-x-3">
                  {!row.is_archived && !row.pod_verified_at && (
                    <button
                      type="button"
                      className="inline-flex h-11 items-center rounded-md px-3 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                      onClick={() => setVerifyPreview(row)}
                    >
                      Review & Verify
                    </button>
                  )}
                  {!row.is_archived && (
                    <button
                      type="button"
                      className="inline-flex h-11 items-center rounded-md px-3 text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => handleArchive(row.id)}
                    >
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(verifyPreview)} onOpenChange={(open) => !open && setVerifyPreview(null)}>
        <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0">
          <div className="p-4 border-b bg-white">
            <DialogTitle>Review POD Proof</DialogTitle>
            <DialogDescription>
              Review uploaded POD for LR {verifyPreview?.lr_number || verifyPreview?.lr_id || '-'} before verifying.
            </DialogDescription>
          </div>
          <div className="flex-1 h-[calc(90vh-140px)] bg-slate-50">
            {verifyPreview?.file_url ? (
              <iframe
                src={verifyPreview.file_url}
                title="POD Preview"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No POD file available to preview.</div>
            )}
          </div>
          <div className="p-4 border-t bg-white flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setVerifyPreview(null)}
              className="px-4 py-2 rounded border border-slate-300 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!verifyPreview?.lr_id}
              onClick={() => handleVerify(verifyPreview?.lr_id)}
              className="px-4 py-2 rounded bg-emerald-700 text-white disabled:opacity-60"
            >
              Verify POD
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
