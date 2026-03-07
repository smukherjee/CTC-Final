import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import MasterCrudGrid from '@/components/grid/MasterCrudGrid';

interface Vehicle {
  id?: number;
  number: string;
  type?: string;
  capacity?: string;
  owner_id?: number | null;
}

interface VendorOption {
  id: number;
  name: string;
}

export default function VehicleMaster() {
  const [vendors, setVendors] = useState<VendorOption[]>([]);

  useEffect(() => {
    let mounted = true;
    axios.get('/api/vendor/')
      .then((res) => {
        if (!mounted) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setVendors(
          rows
            .map((row: any) => ({
              id: Number(row?.id),
              name: String(row?.name || '').trim(),
            }))
            .filter((row: VendorOption) => Number.isFinite(row.id) && row.id > 0 && row.name),
        );
      })
      .catch((err) => {
        console.error('Failed to load vendors for Vehicle Master', err);
        if (mounted) setVendors([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const vendorNameById = useMemo(() => {
    const map: Record<number, string> = {};
    vendors.forEach((vendor) => {
      map[vendor.id] = vendor.name;
    });
    return map;
  }, [vendors]);

  const vendorEditorValues = useMemo(
    () => vendors.map((vendor) => String(vendor.id)),
    [vendors],
  );

  return (
    <MasterCrudGrid<Vehicle>
      title="Vehicle Master"
      subtitle="Owner is linked to Vendor Master."
      endpoint="/api/vehicle/"
      createDraft={() => ({
        number: 'NEW-VEHICLE',
        type: '',
        capacity: '',
        owner_id: null,
      })}
      toCreatePayload={(row) => ({
        number: row.number,
        type: row.type || null,
        capacity: row.capacity || null,
        owner_id: row.owner_id ? Number(row.owner_id) : null,
      })}
      toUpdatePayload={(row) => ({
        number: row.number,
        type: row.type || null,
        capacity: row.capacity || null,
        owner_id: row.owner_id ? Number(row.owner_id) : null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'number', headerName: 'NUMBER', width: 180, editable: true },
        { field: 'type', headerName: 'TYPE', width: 170, editable: true },
        { field: 'capacity', headerName: 'CAPACITY', width: 140, editable: true },
        {
          field: 'owner_id',
          headerName: 'VENDOR',
          width: 220,
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: { values: vendorEditorValues },
          valueFormatter: (params: any) => {
            const ownerId = Number(params.value);
            if (!Number.isFinite(ownerId) || ownerId <= 0) return '';
            return vendorNameById[ownerId] || `Vendor ${ownerId}`;
          },
          valueParser: (params: any) => {
            const value = Number(params.newValue);
            return Number.isFinite(value) && value > 0 ? value : null;
          },
        },
      ]}
    />
  );
}
