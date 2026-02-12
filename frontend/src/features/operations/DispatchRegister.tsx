import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { LR, LRStatus } from '@/types';
import { format, isBefore, addHours, parseISO } from 'date-fns';
import { Trash2, FileEdit } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateLR from './CreateLR';

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

// ============ MOCK MASTER DATA ============
const CONSIGNORS = [
    { id: 'C001', name: 'HAVELLS INDIA LTD SRICITY' },
    { id: 'C003', name: 'SURYA ELECTRICALS CHENNAI' },
    { id: 'C005', name: 'FLYJAC LOGISTICS P LTD' },
    { id: 'C007', name: 'VOLTAS LTD' },
    { id: 'C009', name: 'BLUE STAR LIMITED' },
    { id: 'C003', name: 'VIJAY SALES P LTD' }, // Added from new mock data
];

const CONSIGNEES = [
    { id: 'C002', name: 'USHA ELECTROTRADE' },
    { id: 'C004', name: 'METRO DISTRIBUTORS' },
    { id: 'C006', name: 'PRIME AGENCIES PUNE' },
    { id: 'C008', name: 'COOL ZONE HYDERABAD' },
    { id: 'C010', name: 'SHARMA TRADERS DELHI' },
    { id: 'C006', name: 'NATIONAL ELECTRONICS' }, // Added from new mock data
];

const STATUS_OPTIONS: LRStatus[] = ['DRAFT', 'DISPATCHED', 'DELIVERED', 'POD_UPLOADED', 'POD_VERIFIED', 'BILLED'];

const FOB_OPTIONS = ['SRICITY', 'CHENNAI', 'BANGALORE', 'HYDERABAD', 'MUMBAI', 'DELHI'];

const THROUGH_OPTIONS = ['SBR', 'DIRECT', 'RKT', 'VRL', 'TCI', 'RADHEKRISHNA', 'MEENAKSHI']; // Added from new mock data

// ============ THEME ============
const ctcTheme = themeQuartz.withParams({
    accentColor: '#1e293b',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    browserColorScheme: 'light',
    chromeBackgroundColor: '#f8fafc',
    foregroundColor: '#0f172a',
    headerFontSize: 11,
    headerFontWeight: 600,
    fontSize: 11,
    rowBorder: true,
    wrapperBorderRadius: 8,
    cellHorizontalPaddingScale: 0.7, // Reduce horizontal padding
    headerHeight: 32, // Compact header
    rowHeight: 32, // Compact rows
});

// ============ MOCK DATA ============
const INITIAL_DATA: LR[] = [
    {
        id: '1',
        lr_number: '45610',
        date: '2025-04-01',
        dispatch_id: 'TRIP-25-001',
        consignor_id: 'C001',
        consignor_name: 'HAVELLS INDIA LTD SRICITY',
        consignee_id: 'C002',
        consignee_name: 'USHA ELECTROTRADE',
        from: 'SRICITY',
        to: 'CHENNAI',
        goods_items: [{
            id: '1-1',
            articles_count: 150,
            description: 'AS PER SYM, INVOICES EWAY BILL ATTACHED',
            weight_qtl: 12,
            weight_kg: 50,
            rate_per_qtl: 850,
            freight_rs: 10650,
            freight_p: 0,
            remarks: 'To Dec/Grand'
        }],
        articles_count: 150,
        articles_description: 'AS PER SYM, INVOICES EWAY BILL ATTACHED',
        weight: 1262.5,
        freight_amount: 10650,
        fob: 'SRICITY',
        through: 'DIRECT',
        status: 'DRAFT',
        origin: 'SRICITY',
        destination: 'CHENNAI',
        vehicle_type: 'TAURUS ACE',
        vehicle_number: 'MH 43 BX 3816',
        bill_number: 'INV-2025-001',
        remarks: 'To Dec/Grand',
        eway_bill: {
            id: 'ew-001',
            number: 'EW123456789',
            valid_from: '2025-04-01',
            valid_upto: '2025-04-08',
            status: 'ACTIVE',
            alert_sent: false,
        },
    },
    {
        id: '2',
        lr_number: '45611',
        date: '2025-04-01',
        dispatch_id: 'TRIP-25-001',
        consignor_id: 'C003',
        consignor_name: 'SURYA ELECTRICALS CHENNAI',
        consignee_id: 'C004',
        consignee_name: 'METRO DISTRIBUTORS',
        from: 'CHENNAI',
        to: 'BANGALORE',
        goods_items: [{
            id: '2-1',
            articles_count: 75,
            description: 'ELECTRICAL GOODS - INSURED',
            weight_qtl: 8,
            weight_kg: 0,
            rate_per_qtl: 920,
            freight_rs: 7360,
            freight_p: 0,
        }],
        articles_count: 75,
        articles_description: 'ELECTRICAL GOODS - INSURED',
        weight: 800,
        freight_amount: 7360,
        fob: 'CHENNAI',
        through: 'SBR',
        status: 'DISPATCHED',
        origin: 'CHENNAI',
        destination: 'BANGALORE',
        vehicle_type: 'TATA ACE',
        vehicle_number: 'TN 01 AB 1234',
        bill_number: 'INV-2025-002',
        eway_bill: {
            id: 'ew-002',
            number: 'EW987654321',
            valid_from: '2025-04-01',
            valid_upto: '2025-04-08',
            status: 'ACTIVE',
            alert_sent: false,
        },
    },
    {
        id: '3',
        lr_number: '45612',
        date: '2025-04-02',
        dispatch_id: 'TRIP-25-002',
        consignor_id: 'C005',
        consignor_name: 'FLYJAC LOGISTICS P LTD',
        consignee_id: 'C006',
        consignee_name: 'PRIME AGENCIES PUNE',
        from: 'MUMBAI',
        to: 'PUNE',
        goods_items: [{
            id: '3-1',
            articles_count: 200,
            description: 'GENERAL CARGO - FRAGILE',
            weight_qtl: 15,
            weight_kg: 0,
            rate_per_qtl: 780,
            freight_rs: 11700,
            freight_p: 0,
            remarks: 'Handle with care'
        }],
        articles_count: 200,
        articles_description: 'GENERAL CARGO - FRAGILE',
        weight: 1500,
        freight_amount: 11700,
        fob: 'MUMBAI',
        through: 'VRL',
        status: 'DELIVERED',
        origin: 'MUMBAI',
        destination: 'PUNE',
        vehicle_type: 'EICHER 14FT',
        vehicle_number: 'MH 02 CD 5678',
        bill_number: 'INV-2025-003',
        remarks: 'Handle with care',
        eway_bill: {
            id: 'ew-003',
            number: 'EW111222333',
            valid_from: '2025-04-02',
            valid_upto: '2025-04-09',
            status: 'ACTIVE',
            alert_sent: false,
        },
    },
];

// Export for use in CreateLR
export const MOCK_LRS = INITIAL_DATA;

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
    const [rowData, setRowData] = useState<LR[]>(INITIAL_DATA);
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
            const index = prev.findIndex(row => row.id === updatedLR.id);
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
        console.log('Cell value changed:', event.colDef.field, event.newValue);

        // If consignor changed, update consignor_id too
        if (event.colDef.field === 'consignor_name') {
            const consignor = CONSIGNORS.find(c => c.name === event.newValue);
            if (consignor) {
                event.data.consignor_id = consignor.id;
            }
        }

        // If consignee changed, update consignee_id too
        if (event.colDef.field === 'consignee_name') {
            const consignee = CONSIGNEES.find(c => c.name === event.newValue);
            if (consignee) {
                event.data.consignee_id = consignee.id;
            }
        }

        // Update state
        setRowData(prev => prev.map(row => row.id === event.data.id ? { ...event.data } : row));
    }, []);

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
        // Action Column - Enter Details
        {
            headerName: '',
            width: 50,
            pinned: 'left',
            filter: false,
            sortable: false,
            cellRenderer: (params: { data: LR }) => {
                if (params.data.status === 'DRAFT') {
                    return (
                        <div className="flex items-center justify-center h-full">
                            <button
                                onClick={() => handleOpenLrModal(params.data)}
                                className="text-slate-500 hover:text-slate-800"
                                title="Enter Details"
                            >
                                <FileEdit size={16} />
                            </button>
                        </div>
                    );
                }
                return null;
            },
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
            cellEditorParams: { values: CONSIGNORS.map(c => c.name) },
        },
        // 5. CONSIGNEE
        {
            field: 'consignee_name',
            headerName: 'CONSIGNEE',
            filter: 'agTextColumnFilter',
            width: 180,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: CONSIGNEES.map(c => c.name) },
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
        // 11. WEIGHT (Auto-calculated)
        {
            field: 'weight',
            headerName: 'WGT (KG)',
            filter: 'agNumberColumnFilter',
            width: 100,
            editable: false,
            cellStyle: { backgroundColor: '#f1f5f9', color: '#64748b' },
            valueFormatter: (params: { value: number }) => params.value ? `${params.value} KG` : '',
        },
        // 12. FREIGHT AMOUNT (Auto-calculated)
        {
            field: 'freight_amount',
            headerName: 'FREIGHT',
            filter: 'agNumberColumnFilter',
            width: 110,
            editable: false,
            cellStyle: { backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600 },
            valueFormatter: (params: { value: number }) => params.value ? `₹${params.value.toLocaleString()}` : '',
        },
        // 8. TYPE OF VEHICLE
        {
            field: 'vehicle_type',
            headerName: 'TYPE OF VEHICLE',
            width: 120,
            editable: true,
        },
        // 9. VEHICLE NO.
        {
            field: 'vehicle_number',
            headerName: 'VEHICLE NO.',
            width: 110,
            editable: true,
        },
        // 10. ORIGIN
        {
            field: 'origin',
            headerName: 'ORIGIN',
            width: 100,
            editable: true,
        },
        // 11. DESTINATION
        {
            field: 'destination',
            headerName: 'DESTINATION',
            width: 110,
            editable: true,
        },
        // 12. FOB
        {
            field: 'fob',
            headerName: 'FOB',
            width: 90,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: FOB_OPTIONS },
        },
        // 13. THROUGH
        {
            field: 'through',
            headerName: 'THROUGH',
            width: 100,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: THROUGH_OPTIONS },
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
            filter: 'agSetColumnFilter',
            width: 120,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: STATUS_OPTIONS },
            cellRenderer: (params: { value: LRStatus }) => <StatusBadge value={params.value} />,
            enableRowGroup: true,
        },
        // Actions
        {
            headerName: 'Act',
            width: 50,
            pinned: 'right',
            filter: false,
            sortable: false,
            cellRenderer: (params: { data: LR }) => (
                <div className="flex items-center justify-center h-full gap-1">
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
    ], [handleDelete]);

    // Default column settings
    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: true,
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
            <div ref={containerRef} className="flex-1 min-h-[500px] rounded-lg overflow-hidden border border-slate-200">
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
                    theme={ctcTheme}
                    // Editing
                    editType="fullRow"
                    stopEditingWhenCellsLoseFocus={true}
                    onCellValueChanged={onCellValueChanged}
                    // Excel-like features
                    animateRows={true}
                    rowSelection="multiple"
                    suppressRowClickSelection={true}
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
