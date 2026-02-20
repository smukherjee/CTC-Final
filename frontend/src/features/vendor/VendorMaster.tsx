import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface Vendor {
  id?: number;
  name: string;
  type: string;
  gstin?: string;
  mobile?: string;
  pan?: string;
  address?: string;
  tds_certificate_url?: string;
}

export default function VendorMaster() {
  return (
    <MasterCrudGrid<Vendor>
      title="Vendor Master"
      endpoint="/api/vendor/"
      createDraft={() => ({
        name: 'New Vendor',
        type: 'VENDOR',
        gstin: '',
        mobile: '',
        pan: '',
        address: '',
        tds_certificate_url: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        type: row.type,
        gstin: row.gstin || null,
        mobile: row.mobile || null,
        pan: row.pan || null,
        address: row.address || null,
        tds_certificate_url: row.tds_certificate_url || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        type: row.type,
        gstin: row.gstin || null,
        mobile: row.mobile || null,
        pan: row.pan || null,
        address: row.address || null,
        tds_certificate_url: row.tds_certificate_url || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        { field: 'type', headerName: 'TYPE', width: 140, editable: true },
        { field: 'gstin', headerName: 'GSTIN', width: 180, editable: true },
        { field: 'mobile', headerName: 'MOBILE', width: 140, editable: true },
        { field: 'pan', headerName: 'PAN', width: 140, editable: true },
        { field: 'address', headerName: 'ADDRESS', width: 260, editable: true },
        { field: 'tds_certificate_url', headerName: 'TDS CERT URL', width: 220, editable: true },
      ]}
    />
  );
}
