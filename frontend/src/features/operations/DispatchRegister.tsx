/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import type { LR } from '@/types';
import { format, isBefore, addHours, parseISO } from 'date-fns';
import { Trash2, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CreateLR from './CreateLR';
import TrackingLog from '@/features/tracking/TrackingLog';
import { fetchFormOptions } from '@/config/formOptions';
import { DEFAULT_LR_STATUS_COLOR, LR_STATUS_COLORS } from '@/config/lrStatus';
import { mapApiLrsToUi, mapVendorOptions, mapVehicleOptions } from './lrMappings';
import AppAgGrid from '@/components/grid/AppAgGrid';
import { confirmDestructiveAction } from '@/utils/destructiveAction';
import { generateFyDropdownOptions, getCurrentFy } from '@/utils/financialYear';

// ============ COMPONENTS ============
function StatusBadge({ value }: { value: string }) {
    const colors = LR_STATUS_COLORS[value] || DEFAULT_LR_STATUS_COLOR;
    return (
        <span
            style={{
                backgroundColor: colors.bg,
                color: colors.text,
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}
        >
            {value.replace('_', ' ')}
        </span>
    );
}

// ============ MAIN COMPONENT ============
export default function DispatchRegister() {
    const currentFy = getCurrentFy();
    const fyOptions = generateFyDropdownOptions(currentFy);

    const [rowData, setRowData] = useState<LR[]>([]);
    const [selectedLR, setSelectedLR] = useState<LR | null>(null);
    const [isLrModalOpen, setIsLrModalOpen] = useState(false);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingLrId, setTrackingLrId] = useState<number | null>(null);

    const handleOpenLrModal = (lr: LR) => {
        setSelectedLR(lr);
        setIsLrModalOpen(true);
    };

    const handleCreateLr = () => {
        setSelectedLR(null);
        setIsLrModalOpen(true);
    };

    const handleOpenTrackingModal = useCallback((lr: LR) => {
        const lrId = Number(lr.id);
        if (!Number.isFinite(lrId) || lrId <= 0) {
            alert('Please save the LR before opening tracking.');
            return;
        }
        setTrackingLrId(lrId);
        setIsTrackingModalOpen(true);
    }, []);

    const handleSaveLR = (updatedLR: LR) => {
        setRowData(prev => {
            const index = prev.findIndex(row => String(row.id) === String(updatedLR.id));
            if (index >= 0) {
                const newData = [...prev];
                newData[index] = updatedLR;
                return newData;
            } else {
                return [updatedLR, ...prev];
            }
        });
        setIsLrModalOpen(false);
        setSelectedLR(null);
    };

    // Cities master list (for Origin/Destination/FOB dropdowns)
    const [citiesList, setCitiesList] = useState<string[]>([]);
    // Vendors master list (for Through dropdown)
    const [vendorIds, setVendorIds] = useState<number[]>([]);
    const [vendorNameById, setVendorNameById] = useState<Record<string, string>>({});
    // Consignors and Consignees from client master
    const [consignorsList, setConsignorsList] = useState<{ id: number; name: string }[]>([]);
    const [consigneesList, setConsigneesList] = useState<{ id: number; name: string }[]>([]);
    const [clientList, setClientList] = useState<{ id: number; name: string }[]>([]);
    // Vehicle master: number -> type map for auto-population
    const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({});
    const [vehicleIdByNumber, setVehicleIdByNumber] = useState<Record<string, number>>({});
    // Vehicle numbers list for dropdown
    const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([]);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [defaultStatus, setDefaultStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [fyFilter, setFyFilter] = useState<string>(currentFy);
    const [podFilter] = useState<'ALL' | 'UPLOADED' | 'VERIFIED' | 'MISSING'>('ALL');

    // Re-fetch the LR from the backend when the modal closes so any side-effects
    // (e.g. eway bills added without clicking Save) are reflected in the grid.
    const handleLrModalOpenChange = useCallback((open: boolean) => {
        setIsLrModalOpen(open);
        if (!open && selectedLR) {
            const lrId = Number(selectedLR.id);
            if (Number.isFinite(lrId) && lrId > 0) {
                apiClient.get(`/api/lr/${lrId}`)
                    .then(res => {
                        const fresh = mapApiLrsToUi([res.data], defaultStatus)[0];
                        setRowData(prev => prev.map(row =>
                            String(row.id) === String(lrId) ? fresh : row
                        ));
                    })
                    .catch(() => {/* ignore */});
            }
            setSelectedLR(null);
        }
    }, [selectedLR, defaultStatus]);

    useEffect(() => {
        let mounted = true;
        apiClient.get('/api/city/')
            .then(res => {
                const data = res.data;
                if (!mounted) return;
                if (Array.isArray(data)) {
                    const names = data.map((c: any) => c.name || c.code).filter(Boolean);
                    if (names.length) setCitiesList(names);
                }
            })
            .catch(err => {
                console.debug('Failed to load cities master', err);
            });

        apiClient.get('/api/vendor/')
            .then(res => {
                const data = res.data;
                if (!mounted) return;
                if (Array.isArray(data)) {
                    const mapped = mapVendorOptions(data);
                    setVendorIds(mapped.vendorIds);
                    setVendorNameById(mapped.vendorNameById);
                }
            })
            .catch(err => {
                console.debug('Failed to load vendors master', err);
            });

        apiClient.get('/api/vehicle/')
            .then(res => {
                const data = res.data;
                if (!mounted) return;
                if (Array.isArray(data)) {
                    const mapped = mapVehicleOptions(data);
                    setVehicleMap(mapped.vehicleTypeByNumber);
                    setVehicleIdByNumber(mapped.vehicleIdByNumber);
                    setVehicleNumbers(mapped.vehicleNumbers);
                }
            })
            .catch(err => {
                console.debug('Failed to load vehicle master', err);
            });

        apiClient.get('/api/clients/')
            .then(res => {
                const data = res.data;
                if (!mounted) return;
                if (Array.isArray(data)) {
                    setClientList(data.map((c: any) => ({ id: Number(c.id), name: String(c.name || '') })));
                    setConsignorsList(
                        data
                            .filter((p: any) => {
                                const clientType = String(p.type || '').toUpperCase();
                                return clientType === 'CONSIGNOR' || clientType === 'BOTH';
                            })
                            .map((p: any) => ({ id: p.id, name: p.name }))
                    );
                    setConsigneesList(
                        data
                            .filter((p: any) => {
                                const clientType = String(p.type || '').toUpperCase();
                                return clientType === 'CONSIGNEE' || clientType === 'BOTH';
                            })
                            .map((p: any) => ({ id: p.id, name: p.name }))
                    );
                }
            })
            .catch(err => {
                console.debug('Failed to load client master', err);
            });

        return () => { mounted = false; };
    }, []);

    // Load persisted LRs from backend on mount
    useEffect(() => {
        let mounted = true;
        apiClient.get('/api/lr/', { params: { fy: fyFilter } })
            .then(res => {
                if (!mounted) return;
                const data = res.data;
                if (Array.isArray(data) && data.length > 0) {
                    setRowData(mapApiLrsToUi(data, defaultStatus));
                    return;
                }
                // No LRs in DB yet — start empty
                setRowData([]);
            })
            .catch(err => {
                console.debug('Failed to load persisted LRs', err);
                setRowData([]);
            });

        return () => { mounted = false; };
    }, [defaultStatus, fyFilter]);

    useEffect(() => {
        let mounted = true;
        fetchFormOptions()
            .then((options) => {
                if (!mounted) return;
                setStatusOptions(options.lr_statuses || []);
                setDefaultStatus(options.defaults?.lr_status || '');
            })
            .catch(() => {
                if (!mounted) return;
                setStatusOptions([]);
                setDefaultStatus('');
            });
        return () => { mounted = false; };
    }, []);

    // Check if E-Way is expiring soon (within 8 hours) - Kept for potential future use or if other parts of the app use it
    const isEwayExpiringSoon = useCallback((expiryAt: string | undefined): boolean => {
        if (!expiryAt) return false;
        const expiryDate = parseISO(expiryAt);
        if (Number.isNaN(expiryDate.getTime())) return false;
        const warningThreshold = addHours(new Date(), 8);
        return isBefore(expiryDate, warningThreshold);
    }, []);

    // Row styling for alerts
    const getRowClass = useCallback((params: { data?: LR }): string | undefined => {
        const activeEway =
            (Array.isArray(params.data?.eway_bills) ? params.data?.eway_bills[0] : undefined);
        const expiry = activeEway?.expires_at || activeEway?.valid_upto;
        if (activeEway && isEwayExpiringSoon(expiry)) {
            return 'eway-expiry-warning';
        }
        return undefined;
    }, [isEwayExpiringSoon]);

    // Delete handler
    const handleDelete = useCallback(async (lr: LR) => {
        if (!confirmDestructiveAction({ action: 'Delete LR', subject: lr.lr_number })) return;
        const numericId = Number(lr.id);
        if (!Number.isFinite(numericId) || numericId <= 0) {
            alert('Invalid LR id. Please refresh and try again.');
            return;
        }
        try {
            await apiClient.delete(`/api/lr/${numericId}`);
            setRowData((prev) => prev.filter((row) => String(row.id) !== String(lr.id)));
        } catch (err: any) {
            const detail = err?.response?.data?.detail || err?.message || 'Delete failed';
            alert(`Failed to delete LR: ${detail}`);
        }
    }, []);

    const isRowReadOnly = useCallback((row?: LR): boolean => {
        if (!row) return false;
        if (!defaultStatus) return false;
        return row.status !== defaultStatus;
    }, [defaultStatus]);

    const editableWhenWritable = useCallback((params: { data?: LR }) => {
        return !isRowReadOnly(params.data);
    }, [isRowReadOnly]);

    // Cell value changed handler
    const onCellValueChanged = useCallback((event: any) => {
        if (isRowReadOnly(event?.data)) {
            return;
        }
        const updatedData = { ...event.data };

        // If consignor changed, update consignor_id too
        if (event.colDef.field === 'consignor_name') {
            const consignor = consignorsList.find(c => c.name === event.newValue);
            if (consignor) updatedData.consignor_id = String(consignor.id);
        }

        // If consignee changed, update consignee_id too
        if (event.colDef.field === 'consignee_name') {
            const consignee = consigneesList.find(c => c.name === event.newValue);
            if (consignee) updatedData.consignee_id = String(consignee.id);
        }

        if (event.colDef.field === 'through_id') {
            const throughId = event.newValue === '' || event.newValue === null || event.newValue === undefined
                ? undefined
                : Number(event.newValue);
            updatedData.through_id = throughId;
            updatedData.through = throughId ? (vendorNameById[String(throughId)] || '') : '';
        }

        if (event.colDef.field === 'vehicle_number') {
            const vehicleNo = event.newValue ? String(event.newValue) : '';
            updatedData.vehicle_number = vehicleNo;
            updatedData.vehicle_type = vehicleNo ? (vehicleMap[vehicleNo] || '') : '';
            updatedData.vehicle_id = vehicleNo ? vehicleIdByNumber[vehicleNo] : undefined;
        }

        // Update local state immediately for responsiveness
        setRowData(prev => prev.map(row => row.id === updatedData.id ? updatedData : row));

        // Persist to backend - use lightweight PATCH for inline E-way updates
        const lrId = updatedData.id;
        if (event.colDef.field === 'eway_bill_no' || event.colDef.field === 'eway_bill_expiry') {
            apiClient.patch(`/api/lr/${lrId}`, {
                eway_bill_no: updatedData.eway_bill_no || null,
                eway_bill_expiry: updatedData.eway_bill_expiry || null,
            })
                .then(() => console.log('LR E-way patched:', lrId))
                .catch(err => console.error('Failed to patch LR E-way:', err));
            return;
        }

        const payload = { ...updatedData };
        apiClient.put(`/api/lr/${lrId}`, payload)
            .then(() => console.log('LR saved:', lrId))
            .catch(err => console.error('Failed to save LR:', err));
    }, [consignorsList, consigneesList, vendorNameById, vehicleMap, vehicleIdByNumber, isRowReadOnly]);

    const filteredRowData = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return rowData.filter((row) => {
            const matchesPod =
                podFilter === 'ALL'
                    ? true
                    : podFilter === 'UPLOADED'
                        ? Boolean(row.pod_url)
                        : podFilter === 'VERIFIED'
                            ? Boolean(row.pod_verified_at)
                            : !row.pod_url;

            if (!matchesPod) return false;
            if (!normalizedQuery) return true;

            const searchText = [
                row.lr_number,
                row.consignor_name,
                row.consignee_name,
                row.origin,
                row.destination,
                row.vehicle_number,
                row.bill_number,
                row.pod_url ? 'pod uploaded' : 'pod pending',
                row.pod_verified_at ? 'pod verified' : '',
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchText.includes(normalizedQuery);
        });
    }, [rowData, searchQuery, podFilter]);

    // Column Definitions with editable cells
    // Using any[] to bypass strict v32 typing which is fighting with "as const" assertions
    const colDefs = useMemo<any[]>(() => [
        // 1. LR.NO (Clickable Link)
        {
            field: 'lr_number',
            headerName: 'LR.NO',
            filter: 'agTextColumnFilter',
            width: 80,
            cellStyle: { fontWeight: '600', color: '#1e40af', cursor: 'pointer' },
            editable: false,
            pinned: 'left',
            cellRenderer: (params: { value: string; data: LR }) => (
                <button
                    onClick={() => handleOpenLrModal(params.data)}
                    className="text-blue-700 hover:text-blue-900 hover:underline font-semibold"
                >
                    {params.value}
                </button>
            ),
        },

        // 2. DATE
        {
            field: 'date',
            headerName: 'DATE',
            filter: 'agDateColumnFilter',
            width: 100,
            editable: editableWhenWritable,
            cellEditor: 'agDateCellEditor',
            // Date format: dd/MM/yyyy
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                const date = params.value instanceof Date ? params.value : parseISO(params.value);
                return format(date, 'dd/MM/yyyy');
            },
            valueGetter: (params: any) => params.data.date ? parseISO(params.data.date) : null,
            valueSetter: (params: any) => {
                if (params.newValue) {
                    const date = params.newValue instanceof Date ? params.newValue : new Date(params.newValue);
                    if (!isNaN(date.getTime())) {
                        params.data.date = format(date, 'yyyy-MM-dd');
                        return true;
                    }
                }
                return false;
            }
        },
        // 3. MONTH (Computed)
        {
            headerName: 'MONTH',
            width: 80,
            valueGetter: (params: any) => {
                if (!params.data.date) return '';
                // Format: Apr-25
                const date = parseISO(params.data.date);
                return format(date, 'MMM-yy');
            },
        },
        // 4. CONSIGNOR
        {
            field: 'consignor_name',
            headerName: 'CONSIGNOR',
            filter: 'agTextColumnFilter',
            width: 180,
            editable: editableWhenWritable,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: consignorsList.map(c => c.name) },
        },
        // 5. CONSIGNEE
        {
            field: 'consignee_name',
            headerName: 'CONSIGNEE',
            filter: 'agTextColumnFilter',
            width: 180,
            editable: editableWhenWritable,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: consigneesList.map(c => c.name) },
        },
        // 9. ARTICLES COUNT (Auto-calculated)
        {
            field: 'articles_count',
            headerName: 'PKGS',
            filter: 'agNumberColumnFilter',
            width: 90,
            editable: false,
            cellStyle: { backgroundColor: '#f1f5f9', color: '#64748b' },
        },
        // 10. ARTICLES DESCRIPTION
        { field: 'articles_description', headerName: 'DESCRIPTION', filter: 'agTextColumnFilter', width: 200, editable: editableWhenWritable },

        // 8. TYPE OF VEHICLE (auto-populated from vehicle master, readonly)
        {
            field: 'vehicle_type',
            headerName: 'TYPE OF VEHICLE',
            width: 120,
            editable: false,
            cellStyle: { backgroundColor: '#f1f5f9', color: '#64748b', fontStyle: 'italic' },
            tooltipValueGetter: () => 'Auto-populated from Vehicle Master',
        },
        // 9. VEHICLE NO.
        {
            field: 'vehicle_number',
            headerName: 'VEHICLE NO.',
            width: 120,
            editable: editableWhenWritable,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: vehicleNumbers },
            valueSetter: (params: any) => {
                const vNum = params.newValue;
                params.data.vehicle_number = vNum;
                if (vNum && vehicleMap[vNum]) {
                    params.data.vehicle_type = vehicleMap[vNum];
                }
                params.data.vehicle_id = vNum ? vehicleIdByNumber[vNum] : undefined;
                return true;
            },
        },
        {
            field: 'driver_mobile',
            headerName: 'DRIVER MOBILE',
            width: 140,
            editable: editableWhenWritable,
            filter: 'agTextColumnFilter',
        },
        // 10. ORIGIN
        {
            field: 'origin',
            headerName: 'ORIGIN',
            width: 100,
            editable: editableWhenWritable,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: citiesList },
        },
        // 11. DESTINATION
        {
            field: 'destination',
            headerName: 'DESTINATION',
            width: 110,
            editable: editableWhenWritable,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: citiesList },
        },
        // 12. FOB
        {
            field: 'fob_client_id',
            headerName: 'FOB CLIENT',
            width: 180,
            editable: editableWhenWritable,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: clientList.map((c) => c.id) },
            valueFormatter: (params: { value: number }) => {
                const client = clientList.find((c) => c.id === Number(params.value));
                return client ? client.name : '';
            },
            valueSetter: (params: any) => {
                const newId = params.newValue === '' || params.newValue === null || params.newValue === undefined
                    ? undefined
                    : Number(params.newValue);
                params.data.fob_client_id = newId;
                const client = clientList.find((c) => c.id === Number(newId));
                params.data.fob = client ? client.name : '';
                return true;
            },
        },
        // 13. THROUGH
        {
            field: 'through_id',
            headerName: 'THROUGH',
            width: 140,
            editable: editableWhenWritable,
            cellDataType: 'number',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: vendorIds },
            valueParser: (params: any) => {
                if (params.newValue === '' || params.newValue === null || params.newValue === undefined) return undefined;
                const n = Number(params.newValue);
                return Number.isNaN(n) ? undefined : n;
            },
            valueFormatter: (params: { value: string | number | undefined }) => {
                if (params.value === undefined || params.value === null || params.value === '') return '';
                return vendorNameById[String(params.value)] || String(params.value);
            },
            valueSetter: (params: any) => {
                const throughId = params.newValue === '' || params.newValue === null || params.newValue === undefined
                    ? undefined
                    : Number(params.newValue);
                params.data.through_id = throughId;
                params.data.through = throughId ? (vendorNameById[String(throughId)] || '') : '';
                return true;
            },
        },
        // 14. BILL NO
        {
            field: 'bill_number',
            headerName: 'BILL NO',
            width: 80,
            editable: editableWhenWritable,
        },
        {
            field: 'eway_bill_no',
            headerName: 'EWAY NO',
            width: 140,
            editable: false,
            cellStyle: { backgroundColor: '#f1f5f9', color: '#64748b' },
            tooltipValueGetter: () => 'Managed from LR E-Way Bills section',
        },
        {
            field: 'eway_bill_expiry',
            headerName: 'EWAY EXPIRY',
            width: 170,
            editable: false,
            cellStyle: { backgroundColor: '#f1f5f9', color: '#64748b' },
            tooltipValueGetter: () => 'Auto-calculated from E-Way Bill validity',
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                const date = parseISO(String(params.value));
                if (Number.isNaN(date.getTime())) return '';
                return format(date, 'dd/MM/yyyy HH:mm');
            },
        },
        // 15. REMARKS
        {
            field: 'remarks',
            headerName: 'REMARKS',
            width: 120,
            editable: editableWhenWritable,
        },
        {
            field: 'pod_url',
            headerName: 'POD',
            width: 120,
            editable: false,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: { value?: string }) => {
                if (!params.value) {
                    return <span className="text-amber-700 font-medium">Pending</span>;
                }
                return (
                    <a href={params.value} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                        Uploaded
                    </a>
                );
            },
        },
        {
            field: 'pod_verified_at',
            headerName: 'POD VERIFIED',
            width: 150,
            editable: false,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                const date = parseISO(String(params.value));
                if (Number.isNaN(date.getTime())) return '';
                return format(date, 'dd/MM/yyyy HH:mm');
            },
        },
        // Status
        {
            field: 'status',
            headerName: 'STATUS',
            filter: 'agTextColumnFilter',
            width: 120,
            editable: editableWhenWritable,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: statusOptions },
            cellRenderer: (params: { value: string }) => <StatusBadge value={params.value} />,
        },
        // Actions
        {
            headerName: 'ACTIONS',
            width: 152,
            pinned: 'right',
            filter: false,
            sortable: false,
            cellRenderer: (params: { data: LR }) => (
                <div className="flex items-center justify-center h-full gap-2">
                    {/* <button
                        type="button"
                        onClick={() => handleOpenTrackingModal(params.data)}
                        className="h-11 w-11 inline-flex items-center justify-center rounded-md hover:bg-green-100 text-green-700 transition-colors"
                        title="Track Vehicle"
                        aria-label="Track vehicle"
                    >
                        <MapPin size={16} />
                    </button> */}
                    <button
                        type="button"
                        onClick={() => {
                            const lrId = Number(params.data.id);
                            if (!Number.isFinite(lrId) || lrId <= 0) {
                                alert('Please save the LR before creating a Hire Memo.');
                                return;
                            }
                            window.location.href = `/operations/hirememo?lr_id=${lrId}`;
                        }}
                        className="h-11 w-11 inline-flex items-center justify-center rounded-md hover:bg-blue-100 text-blue-700 transition-colors"
                        title="Create Hire Memo"
                        aria-label="Create hire memo"
                    >
                        <Truck size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(params.data)}
                        className="h-11 w-11 inline-flex items-center justify-center rounded-md hover:bg-red-100 text-red-700 transition-colors"
                        title="Delete"
                        aria-label="Delete LR"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ], [handleDelete, handleOpenLrModal, handleOpenTrackingModal, editableWhenWritable, citiesList, vendorIds, vendorNameById, vehicleMap, vehicleIdByNumber, vehicleNumbers, consignorsList, consigneesList, statusOptions, clientList]);

    // Default column settings
    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: false,
        unSortIcon: true,
        sortingOrder: ['asc', 'desc', null] as const,
    }), []);

    // Get unique row ID
    const getRowId = useCallback((params: { data: LR }) => params.data.id, []);

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dispatch Register</h2>
                </div>
                <div className="flex gap-2">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search LR / Client / POD..."
                        className="w-64 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <select
                        value={fyFilter}
                        onChange={(e) => setFyFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        aria-label="Filter by financial year"
                    >
                        {fyOptions.map((fy) => <option key={fy} value={fy}>{fy}</option>)}
                    </select>
                    {/* <select
                        value={podFilter}
                        onChange={(e) => setPodFilter(e.target.value as 'ALL' | 'UPLOADED' | 'VERIFIED' | 'MISSING')}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        aria-label="Filter by POD status"
                    >
                        <option value="ALL">All POD</option>
                        <option value="UPLOADED">POD Uploaded</option>
                        <option value="VERIFIED">POD Verified</option>
                        <option value="MISSING">POD Missing</option>
                    </select> */}
                    <button
                        onClick={() => handleCreateLr()}
                        className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + LR
                    </button>
                </div>
            </div>

            <AppAgGrid<LR>
                rowData={filteredRowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                getRowId={getRowId}
                getRowClass={getRowClass}
                onCellValueChanged={onCellValueChanged}
                className="dispatch-grid"
                editType="fullRow"
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                rowSelection={{ mode: 'singleRow', enableClickSelection: false }}
                animateRows={true}
                groupDisplayType="groupRows"
                multiSortKey="ctrl"
                enableCellTextSelection={true}
                ensureDomOrder={true}
                stopEditingWhenCellsLoseFocus={true}
                fitColumns={false}
                alwaysShowHorizontalScroll={true}
            />
            {/* LR Modal */}
            <Dialog open={isLrModalOpen} onOpenChange={handleLrModalOpenChange}>
                <DialogContent className="max-w-[95vw] h-[90vh] overflow-hidden p-0">
                    <DialogTitle className="sr-only">Edit Lorry Receipt</DialogTitle>
                    <DialogDescription className="sr-only">Form to create or edit a Lorry Receipt</DialogDescription>
                    <CreateLR
                        key={selectedLR?.id || 'new'}
                        lrId={selectedLR?.id}
                        initialData={selectedLR ?? undefined}
                        isModal={true}
                        onSave={handleSaveLR}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
                <DialogContent className="max-w-5xl h-[85vh] overflow-auto">
                    <DialogTitle>Tracking Log</DialogTitle>
                    <DialogDescription>
                        Quick location update for LR {trackingLrId || '-'}.
                    </DialogDescription>
                    <TrackingLog
                        initialLrId={trackingLrId || undefined}
                        lockLrId={true}
                        embedded={true}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
