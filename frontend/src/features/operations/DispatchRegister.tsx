import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import type { LR, LRStatus } from '@/types';
import { format, isBefore, addHours, parseISO } from 'date-fns';
import { Trash2, Truck, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CreateLR from './CreateLR';

// Register AG Grid Modules (explicitly include useful community modules)
ModuleRegistry.registerModules([AllCommunityModule]);

// STATUS_OPTIONS is an application-level enum, not a DB table
const STATUS_OPTIONS: LRStatus[] = ['DRAFT', 'DISPATCHED', 'DELIVERED', 'POD_UPLOADED', 'POD_VERIFIED', 'BILLED'];

// Export for use in CreateLR — LRs now come from DB, this is empty
export const MOCK_LRS: LR[] = [];

// ============ STATUS COLORS ============
const STATUS_COLORS: Record<LRStatus, { bg: string; text: string }> = {
    DRAFT: { bg: '#f1f5f9', text: '#475569' },
    DISPATCHED: { bg: '#dbeafe', text: '#1e40af' },
    DELIVERED: { bg: '#dcfce7', text: '#166534' },
    POD_UPLOADED: { bg: '#fef3c7', text: '#92400e' },
    POD_VERIFIED: { bg: '#d1fae5', text: '#065f46' },
    BILLED: { bg: '#e0e7ff', text: '#3730a3' },
};

// ============ COMPONENTS ============
function StatusBadge({ value }: { value: LRStatus }) {
    const colors = STATUS_COLORS[value] || { bg: '#f1f5f9', text: '#475569' };
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
    const gridRef = useRef<AgGridReact>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleOpenLrModal = (lr: LR) => {
        setSelectedLR(lr);
        setIsLrModalOpen(true);
    };

    const handleCreateLr = () => {
        setSelectedLR(null);
        setIsLrModalOpen(true);
    };

    const handleCloseLrModal = () => {
        setIsLrModalOpen(false);
        setSelectedLR(null);
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

    // Handle resizing when sidebar toggles
    useEffect(() => {
        if (!containerRef.current || !gridRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (gridRef.current?.api) {
                gridRef.current.api.sizeColumnsToFit();
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Cities master list (for Origin/Destination/FOB dropdowns)
    const [citiesList, setCitiesList] = useState<string[]>([]);
    // Vendors master list (for Through dropdown)
    const [vendorsList, setVendorsList] = useState<string[]>([]);
    // Consignors and Consignees from party master
    const [consignorsList, setConsignorsList] = useState<{ id: number; name: string }[]>([]);
    const [consigneesList, setConsigneesList] = useState<{ id: number; name: string }[]>([]);
    // Vehicle master: number -> type map for auto-population
    const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({});
    // Vehicle numbers list for dropdown
    const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([]);



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
                    const names = data.map((v: any) => v.name).filter(Boolean);
                    if (names.length) setVendorsList(names);
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
                    const map: Record<string, string> = {};
                    const numbers: string[] = [];
                    data.forEach((v: any) => {
                        if (v.number) {
                            map[v.number] = v.type || '';
                            numbers.push(v.number);
                        }
                    });
                    setVehicleMap(map);
                    setVehicleNumbers(numbers);
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
                    setConsignorsList(data.filter((p: any) => p.type?.toUpperCase() === 'CONSIGNOR').map((p: any) => ({ id: p.id, name: p.name })));
                    setConsigneesList(data.filter((p: any) => p.type?.toUpperCase() === 'CONSIGNEE').map((p: any) => ({ id: p.id, name: p.name })));
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
                    const mapped: LR[] = data.map((it: any) => ({
                        id: String(it.id),
                        lr_number: it.lr_number,
                        date: it.date || it.created_at || '',
                        dispatch_id: it.dispatch_id,
                        consignor_id: it.consignor_id || '',
                        consignor_name: it.consignor_name || '',
                        consignee_id: it.consignee_id || '',
                        consignee_name: it.consignee_name || '',
                        from: it.origin || it.from || '',
                        to: it.destination || it.to || '',
                        origin: it.origin || it.from || '',
                        destination: it.destination || it.to || '',
                        goods_items: it.goods_items || [],
                        articles_count: it.articles_count || 0,
                        articles_description: it.articles_description || '',
                        weight: it.weight || 0,
                        freight_amount: it.freight_amount || 0,
                        fob: it.fob || '',
                        through: it.through || '',
                        vehicle_type: it.vehicle_type || '',
                        vehicle_number: it.vehicle_number || '',
                        bill_number: it.bill_number || '',
                        remarks: it.remarks || '',
                        status: it.status || 'DRAFT',
                    }));
                    setRowData(mapped);
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

        // Update local state immediately for responsiveness
        setRowData(prev => prev.map(row => row.id === updatedData.id ? updatedData : row));

        // Persist to backend
        const lrId = updatedData.id;
        const payload: Record<string, any> = {
            consignor_name: updatedData.consignor_name,
            consignee_name: updatedData.consignee_name,
            origin: updatedData.origin,
            destination: updatedData.destination,
            fob: updatedData.fob,
            through: updatedData.through,
            vehicle_type: updatedData.vehicle_type,
            vehicle_number: updatedData.vehicle_number,
            bill_number: updatedData.bill_number,
            remarks: updatedData.remarks,
            status: updatedData.status,
            date: updatedData.date,
            articles_description: updatedData.articles_description,
        };
        axios.put(`/api/lr/${lrId}`, payload)
            .then(() => console.log('LR saved:', lrId))
            .catch(err => console.error('Failed to save LR:', err));
    }, [consignorsList, consigneesList]);

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
            field: 'through',
            headerName: 'THROUGH',
            width: 100,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: vendorsList },
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
            cellEditorParams: { values: STATUS_OPTIONS },
            cellRenderer: (params: { value: LRStatus }) => <StatusBadge value={params.value} />,
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
                            window.location.href = `/operations/hirememo?lr_id=${params.data.id}`;
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
    ], [handleDelete, citiesList, vendorsList, vehicleMap, vehicleNumbers, consignorsList, consigneesList]);

    // Default column settings
    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: false,
        unSortIcon: true,
        sortingOrder: ['asc', 'desc', null] as any,
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
                    <button className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Export Excel
                    </button>
                    <button
                        onClick={() => handleCreateLr()}
                        className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + New LR
                    </button>
                </div>
            </div>

            {/* AG Grid */}
            <div ref={containerRef} className="flex-1 min-h-[500px] rounded-lg overflow-hidden border border-slate-200 ag-theme-alpine">
                <style>{`
                    .eway-expiry-warning {
                        background-color: #fef2f2 !important;
                    }
                    .eway-expiry-warning:hover {
                        background-color: #fee2e2 !important;
                    }
                    .ag-cell-edit-wrapper {
                        padding: 0 !important;
                    }
                    /* Headers uppercase key style if needed, but headerName set manually */
                `}</style>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    getRowClass={getRowClass}

                    // Editing
                    editType="fullRow"
                    stopEditingWhenCellsLoseFocus={true}
                    onCellValueChanged={onCellValueChanged}
                    // Excel-like features
                    animateRows={true}
                    rowSelection={{ mode: 'multiRow', checkboxLocation: 'autoGroupColumn', headerCheckbox: false }}
                    // Keyboard navigation
                    enableCellTextSelection={true}
                    ensureDomOrder={true}
                    // Pagination
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    // Row grouping
                    groupDisplayType="groupRows"
                    // Multi-column sorting
                    multiSortKey="ctrl"
                    // Auto-size columns
                    onFirstDataRendered={(params) => {
                        params.api.sizeColumnsToFit();
                    }}
                />
            </div>

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
                        onClose={handleCloseLrModal}
                        onSave={handleSaveLR}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
