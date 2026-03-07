import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import MasterCrudGrid from '@/components/grid/MasterCrudGrid';
import { formatDisplayDate } from '@/utils/dateFormat';

interface Contract {
  id?: number;
  name: string;
  client_id?: number | null;
  client_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  expiry_alert_days?: number | null;
  notes?: string | null;
}

interface ClientOption {
  id: number;
  name: string;
}

export default function ContractMaster() {
  const [clients, setClients] = useState<ClientOption[]>([]);

  useEffect(() => {
    let mounted = true;
    axios.get('/api/clients/')
      .then((res) => {
        if (!mounted) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setClients(
          rows
            .map((row: any) => ({
              id: Number(row?.id),
              name: String(row?.name || '').trim(),
            }))
            .filter((row: ClientOption) => Number.isFinite(row.id) && row.id > 0 && row.name),
        );
      })
      .catch((err) => {
        console.error('Failed to load clients for Contract Master', err);
        if (mounted) setClients([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const clientNameById = useMemo(() => {
    const map: Record<number, string> = {};
    clients.forEach((client) => {
      map[client.id] = client.name;
    });
    return map;
  }, [clients]);

  const clientIdByName = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((client) => {
      map[client.name] = client.id;
    });
    return map;
  }, [clients]);

  const clientEditorValues = useMemo(
    () => ['', ...clients.map((client) => client.name)],
    [clients],
  );

  return (
    <MasterCrudGrid<Contract>
      title="Contract Master"
      endpoint="/api/contract/"
      createDraft={() => ({
        name: 'New Contract',
        client_id: null,
        start_date: null,
        end_date: null,
        expiry_alert_days: null,
        notes: '',
      })}
      toCreatePayload={(row) => ({
        name: row.name,
        client_id: row.client_id ? Number(row.client_id) : null,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        expiry_alert_days: row.expiry_alert_days ? Number(row.expiry_alert_days) : null,
        notes: row.notes || null,
      })}
      toUpdatePayload={(row) => ({
        name: row.name,
        client_id: row.client_id ? Number(row.client_id) : null,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        expiry_alert_days: row.expiry_alert_days ? Number(row.expiry_alert_days) : null,
        notes: row.notes || null,
      })}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, editable: false, pinned: 'left' },
        { field: 'name', headerName: 'NAME', width: 220, editable: true },
        {
          field: 'client_name',
          headerName: 'CLIENT',
          width: 220,
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: { values: clientEditorValues },
          valueGetter: (params: any) => {
            const clientId = Number(params.data?.client_id);
            if (!Number.isFinite(clientId) || clientId <= 0) return '';
            return clientNameById[clientId] || '';
          },
          valueSetter: (params: any) => {
            const clientName = String(params.newValue || '').trim();
            const clientId = clientName ? clientIdByName[clientName] ?? null : null;
            params.data.client_id = clientId;
            params.data.client_name = clientName || '';
            return true;
          },
        },
        {
          field: 'start_date',
          headerName: 'START DATE',
          width: 130,
          editable: true,
          cellEditor: 'agDateStringCellEditor',
          valueFormatter: (params: any) => formatDisplayDate(params.value, ''),
        },
        {
          field: 'end_date',
          headerName: 'END DATE',
          width: 130,
          editable: true,
          cellEditor: 'agDateStringCellEditor',
          valueFormatter: (params: any) => formatDisplayDate(params.value, ''),
        },
        {
          field: 'expiry_alert_days',
          headerName: 'EXPIRY ALERT (DAYS)',
          width: 180,
          editable: true,
          cellDataType: 'number',
          valueParser: (params: any) => (params.newValue ? Number(params.newValue) : null),
        },
        { field: 'notes', headerName: 'NOTES', width: 260, editable: true },
      ]}
    />
  );
}
