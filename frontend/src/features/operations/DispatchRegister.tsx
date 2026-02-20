import { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { LR } from '@/types';
import { format, isBefore, addHours, parseISO } from 'date-fns';
import { Trash2, Truck, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CreateLR from './CreateLR';
import { fetchFormOptions } from '@/config/formOptions';
import { DEFAULT_LR_STATUS_COLOR, LR_STATUS_COLORS } from '@/config/lrStatus';
import { mapApiLrsToUi, mapVendorOptions, mapVehicleOptions } from './lrMappings';
import AppAgGrid from '@/components/grid/AppAgGrid';

// Export for use in CreateLR — LRs now come from DB, this is empty
export const MOCK_LRS: LR[] = [];

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
    const [rowData, setRowData] = useState<LR[]>([]);
    const [selectedLR, setSelectedLR] = useState<LR | null>(null);
    const [isLrModalOpen, setIsLrModalOpen] = useState(false);

    const handleOpenLrModal = (lr: LR) => {
        setSelectedLR(lr);
        setIsLrModalOpen(true);
    };

    const handleCreateLr = () => {
        setSelectedLR(null);
        setIsLrModalOpen(true);
    };

    const handleSaveLR = (updatedLR: LR) => {
        setRowData(prev => {
            // Robustly find index by casting both to string
            const index = prev.findIndex(row => String(row.id) === String(updatedLR.id));
            if (index >= 0) {
                const newData = [...prev];
                newData[index] = updatedLR;
                return newData;
            } else {
                // Should we add it? Only if it's truly new.
                // If it was supposed to be an update but not found, adding it creates a duplicate visually if the ID logic was wrong.
                // But here we assume if ID not found, it's new.
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
    // Consignors and Consignees from party master
    const [consignorsList, setConsignorsList] = useState<{ id: number; name: string }[]>([]);
    const [consigneesList, setConsigneesList] = useState<{ id: number; name: string }[]>([]);
    // Vehicle master: number -> type map for auto-population
    const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({});
    const [vehicleIdByNumber, setVehicleIdByNumber] = useState<Record<string, number>>({});
    // Vehicle numbers list for dropdown
    const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([]);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [defaultStatus, setDefaultStatus] = useState<string>('');



    useEffect(() => {
        let mounted = true;
        axios.get('/api/city/')
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

        axios.get('/api/vendor/')
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

        axios.get('/api/vehicle/')
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

        axios.get('/api/party/')
            .then(res => {
                const data = res.data;
                if (!mounted) return;
                if (Array.isArray(data)) {
                    setConsignorsList(
                        data
                            .filter((p: any) => {
                                const partyType = String(p.type || '').toUpperCase();
                                return partyType === 'CONSIGNOR' || partyType === 'BOTH';
                            })
                            .map((p: any) => ({ id: p.id, name: p.name }))
                    );
                    setConsigneesList(
                        data
                            .filter((p: any) => {
                                const partyType = String(p.type || '').toUpperCase();
                                return partyType === 'CONSIGNEE' || partyType === 'BOTH';
                            })
                            .map((p: any) => ({ id: p.id, name: p.name }))
                    );
                }
            })
            .catch(err => {
                console.debug('Failed to load party master', err);
            });

        return () => { mounted = false; };
    }, []);

    // Load persisted LRs from backend on mount
    useEffect(() => {
        let mounted = true;
        axios.get('/api/lr/')
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
    }, [defaultStatus]);

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
    const isEwayExpiringSoon = useCallback((ewayExpiry: string | undefined): boolean => {
        if (!ewayExpiry) return false;
        const expiryDate = parseISO(ewayExpiry); // Use parseISO for consistent parsing
        const warningThreshold = addHours(new Date(), 8);
        return isBefore(expiryDate, warningThreshold);
    }, []);

    // Row styling for alerts
    const getRowClass = useCallback((params: { data?: LR }): string | undefined => {
        if (params.data?.eway_bill && isEwayExpiringSoon(params.data.eway_bill.valid_upto)) {
            return 'eway-expiry-warning';
        }
        return undefined;
    }, [isEwayExpiringSoon]);

    // Delete handler
    const handleDelete = useCallback((id: string) => {
        if (confirm('Are you sure you want to delete this LR?')) {
            setRowData(prev => prev.filter(row => row.id !== id));
        }
    }, []);

    // Cell value changed handler
    const onCellValueChanged = useCallback((event: any) => {
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

        // Persist to backend - Send FULL payload to avoid losing data
        const lrId = updatedData.id;
        // Exclude UI-only fields or circular refs if any (none in LR type currently)
        const payload = { ...updatedData };

        axios.put(`/api/lr/${lrId}`, payload)
            .then(() => console.log('LR saved:', lrId))
            .catch(err => console.error('Failed to save LR:', err));
    }, [consignorsList, consigneesList, vendorNameById, vehicleMap, vehicleIdByNumber]);

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
            editable: true,
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
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: consignorsList.map(c => c.name) },
        },
        // 5. CONSIGNEE
        {
            field: 'consignee_name',
            headerName: 'CONSIGNEE',
            filter: 'agTextColumnFilter',
            width: 180,
            editable: true,
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
        { field: 'articles_description', headerName: 'DESCRIPTION', filter: 'agTextColumnFilter', width: 200, editable: true },

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
            editable: true,
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
        // 10. ORIGIN
        {
            field: 'origin',
            headerName: 'ORIGIN',
            width: 100,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: citiesList },
        },
        // 11. DESTINATION
        {
            field: 'destination',
            headerName: 'DESTINATION',
            width: 110,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: citiesList },
        },
        // 12. FOB
        {
            field: 'fob',
            headerName: 'FOB',
            width: 90,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: citiesList },
        },
        // 13. THROUGH
        {
            field: 'through_id',
            headerName: 'THROUGH',
            width: 140,
            editable: true,
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
            editable: true,
        },
        // 15. REMARKS
        {
            field: 'remarks',
            headerName: 'REMARKS',
            width: 120,
            editable: true,
        },
        // Status
        {
            field: 'status',
            headerName: 'STATUS',
            filter: 'agTextColumnFilter',
            width: 120,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: statusOptions },
            cellRenderer: (params: { value: string }) => <StatusBadge value={params.value} />,
        },
        // Actions
        {
            headerName: 'Act',
            width: 80,
            pinned: 'right',
            filter: false,
            sortable: false,
            cellRenderer: (params: { data: LR }) => (
                <div className="flex items-center justify-center h-full gap-1">
                    <button
                        onClick={() => {
                            window.location.href = `/operations/tracking?vehicle=${encodeURIComponent(params.data.vehicle_number || '')}`;
                        }}
                        className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                        title="Track Vehicle"
                    >
                        <MapPin size={14} />
                    </button>
                    <button
                        onClick={() => {
                            const lrId = Number(params.data.id);
                            if (!Number.isFinite(lrId) || lrId <= 0) {
                                alert('Please save the LR before creating a Hire Memo.');
                                return;
                            }
                            window.location.href = `/operations/hirememo?lr_id=${lrId}`;
                        }}
                        className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Create Hire Memo"
                    >
                        <Truck size={14} />
                    </button>
                    <button
                        onClick={() => handleDelete(params.data.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ], [handleDelete, citiesList, vendorIds, vendorNameById, vehicleMap, vehicleIdByNumber, vehicleNumbers, consignorsList, consigneesList, statusOptions]);

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
                    <p className="text-sm text-slate-500 mt-1">Track all LRs and dispatches • {rowData.length} records</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleCreateLr()}
                        className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + New LR
                    </button>
                </div>
            </div>

            <AppAgGrid<LR>
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                getRowId={getRowId}
                getRowClass={getRowClass}
                onCellValueChanged={onCellValueChanged}
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
            />

            {/* Hints */}
            <div className="text-xs text-slate-400 text-center space-x-4">
                <span>💡 Layout aligned with Excel requirements</span>
                <span>•</span>
                <span>Double-click to edit</span>
            </div>
            {/* LR Modal */}
            <Dialog open={isLrModalOpen} onOpenChange={setIsLrModalOpen}>
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
        </div>
    );
}
