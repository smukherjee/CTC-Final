import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, isValid, parseISO } from 'date-fns';
import { MapPin, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppAgGrid from '@/components/grid/AppAgGrid';
import { formatDisplayDate, formatDisplayDateTime } from '@/utils/dateFormat';

const DEFAULT_TRACKING_STATUS = 'IN_TRANSIT';
const TRACKING_STATUS_OPTIONS = [
    'IN_TRANSIT',
    'LOADING',
    'UNLOADING',
    'ARRIVED_ORIGIN',
    'ARRIVED_DESTINATION',
    'DETAINED',
    'BREAKDOWN',
    'AT_TOLL_PLAZA',
    'AT_RTO_CHECK',
    'AT_BORDER',
    'DRIVER_BREAK',
    'FUEL_STOP',
];

const isStatusValue = (value?: string | null): boolean =>
    TRACKING_STATUS_OPTIONS.includes(normalizeStatus(value));

interface VehicleLocationItem {
    lr_id?: number;
    lr_number?: string;
    vehicle_number: string;
    origin?: string;
    destination?: string;
    location?: string | null;
    status?: string | null;
    reported_at?: string | null;
    date?: string;
}

interface LocationHistoryItem {
    id: number;
    location: string;
    status?: string | null;
    reported_at: string;
    reported_by?: string;
    notes?: string;
}

const normalizeStatus = (value?: string | null): string => {
    if (!value) return DEFAULT_TRACKING_STATUS;
    return String(value).trim().replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase();
};

const statusLabel = (value?: string | null): string =>
    normalizeStatus(value)
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

export default function VehicleTracking() {
    const [rowData, setRowData] = useState<VehicleLocationItem[]>([]);
    const [cityMaster, setCityMaster] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const [historyData, setHistoryData] = useState<LocationHistoryItem[]>([]);

    const loadLatestLocations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/vehicle-locations/latest');
            const data = Array.isArray(res.data) ? res.data : [];
            const normalizedRows: VehicleLocationItem[] = data.map((row: any) => {
                const rawLocation = row?.location ? String(row.location).trim() : '';
                const locationLooksLikeStatus = isStatusValue(rawLocation);
                const normalizedLocation = locationLooksLikeStatus
                    ? 'Pending'
                    : (rawLocation || 'Pending');
                const normalizedStatus = normalizeStatus(
                    row?.status || (locationLooksLikeStatus ? rawLocation : DEFAULT_TRACKING_STATUS),
                );

                return {
                    ...row,
                    location: normalizedLocation,
                    status: normalizedStatus,
                };
            });
            setRowData(normalizedRows);
        } catch (err) {
            console.error('Failed to load vehicle locations', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        axios
            .get('/api/city/')
            .then((res) => {
                if (!mounted) return;
                if (!Array.isArray(res.data)) {
                    setCityMaster([]);
                    return;
                }

                const names = res.data
                    .map((city: any) => {
                        if (typeof city === 'string') return city;
                        return city?.name || city?.code || city?.city || '';
                    })
                    .map((name: string) => name.trim())
                    .filter(Boolean);
                setCityMaster(Array.from(new Set(names)));
            })
            .catch((err) => {
                console.debug('Failed to load cities for vehicle tracking', err);
                setCityMaster([]);
            });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        loadLatestLocations();
    }, [loadLatestLocations]);

    const cityOptions = useMemo(() => {
        const fromRows = rowData
            .flatMap((row) => [row.origin, row.destination, row.location])
            .map((value) => (value ? String(value).trim() : ''))
            .filter((value) => value && value.toLowerCase() !== 'pending' && !isStatusValue(value));
        return Array.from(new Set([...cityMaster, ...fromRows]));
    }, [cityMaster, rowData]);

    const loadHistory = useCallback(async (lrId: number | undefined, entryLabel: string) => {
        if (!lrId) {
            alert('LR not found for this row.');
            return;
        }
        try {
            const res = await axios.get(`/api/vehicle-locations/history/lr/${lrId}`);
            setHistoryData(res.data || []);
            setSelectedEntry(entryLabel);
            setHistoryOpen(true);
        } catch (err) {
            console.error('Failed to load history', err);
            alert('No history found for this LR');
        }
    }, []);

    const createLocationUpdate = useCallback(async (row: VehicleLocationItem) => {
        if (!row.lr_id) {
            alert('Cannot update this row because LR is missing.');
            return;
        }

        const currentCity = String(row.location || '').trim();
        if (!currentCity || currentCity.toLowerCase() === 'pending') {
            alert('Please select Current City before saving.');
            return;
        }

        try {
            await axios.post('/api/vehicle-locations/', {
                lr_id: row.lr_id,
                vehicle_number: row.vehicle_number,
                location: currentCity,
                status: normalizeStatus(row.status),
                reported_by: 'User', // TODO: Get from auth context
            });
            await loadLatestLocations();
        } catch (err) {
            console.error('Failed to update vehicle tracking', err);
            alert('Failed to update vehicle tracking');
        }
    }, [loadLatestLocations]);

    const onCellValueChanged = useCallback((event: any) => {
        if (!event?.colDef?.field || !['location', 'status'].includes(event.colDef.field)) {
            return;
        }

        const updatedRow: VehicleLocationItem = {
            ...event.data,
            location: event.data?.location ? String(event.data.location).trim() : event.data?.location,
            status: normalizeStatus(event.data?.status),
        };
        void createLocationUpdate(updatedRow);
    }, [createLocationUpdate]);

    // Color coding based on reported time
    const getRowClass = useCallback((params: { data?: VehicleLocationItem }): string | undefined => {
        if (!params.data?.reported_at) return undefined;

        const reportedAt = parseISO(params.data.reported_at);
        if (!isValid(reportedAt)) return undefined;
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60);
        const normalized = normalizeStatus(params.data.status);

        if (normalized === 'ARRIVED_DESTINATION' || normalized === 'DELIVERED') {
            return 'status-delivered';
        } else if (hoursSinceUpdate > 24) {
            return 'status-stale';
        } else {
            return 'status-active';
        }
    }, []);

    const colDefs = useMemo<any[]>(() => [
        {
            field: 'lr_number',
            headerName: 'LR No',
            width: 100,
            pinned: 'left',
            filter: 'agTextColumnFilter',
        },
        {
            field: 'date',
            headerName: 'Date',
            width: 110,
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                return formatDisplayDate(params.value, '');
            },
        },
        {
            field: 'vehicle_number',
            headerName: 'Vehicle No',
            width: 130,
            filter: 'agTextColumnFilter',
        },
        {
            field: 'origin',
            headerName: 'Origin',
            width: 120,
        },
        {
            field: 'destination',
            headerName: 'Destination',
            width: 120,
        },
        {
            field: 'location',
            headerName: 'Current City',
            minWidth: 160,
            flex: 1,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: cityOptions,
            },
            valueFormatter: (params: any) => {
                return params.value || 'Set City...';
            },
            cellStyle: (params: any) => {
                if (!params.value || params.value === 'Pending') {
                    return { fontStyle: 'italic', color: '#94a3b8' };
                }
                return { fontWeight: '600', color: '#1e40af' };
            },
        },
        {
            field: 'status',
            headerName: 'Status',
            minWidth: 170,
            flex: 1,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: TRACKING_STATUS_OPTIONS,
            },
            valueFormatter: (params: any) => statusLabel(params.value),
            cellStyle: { fontWeight: 600, color: '#0f172a' },
        },
        {
            field: 'reported_at',
            headerName: 'Last Updated',
            width: 150,
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                return formatDisplayDateTime(params.value, '');
            },
        },
        {
            headerName: 'Actions',
            width: 96,
            pinned: 'right',
            cellRenderer: (params: { data: VehicleLocationItem }) => (
                <div className="flex items-center justify-center h-full">
                    <button
                        type="button"
                        onClick={() =>
                            loadHistory(
                                params.data.lr_id,
                                `${params.data.lr_number || 'LR'} • ${params.data.vehicle_number}`,
                            )
                        }
                        className="h-11 w-11 inline-flex items-center justify-center rounded-md hover:bg-blue-100 text-blue-700 transition-colors"
                        title="View History"
                        aria-label="View location history"
                    >
                        <History size={16} />
                    </button>
                </div>
            ),
        },
    ], [cityOptions, loadHistory]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: false,
    }), []);

    return (
        <div className="h-full flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <MapPin className="text-blue-600" />
                        Vehicle Tracking
                    </h2>
                </div>
                <Button
                    onClick={loadLatestLocations}
                    variant="outline"
                    className="gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* Grid */}
            <style>{`
                .status-delivered {
                    background-color: #dcfce7 !important;
                }
                .status-stale {
                    background-color: #fef2f2 !important;
                }
                .status-active {
                    background-color: #fef3c7 !important;
                }
                .status-delivered:hover {
                    background-color: #bbf7d0 !important;
                }
                .status-stale:hover {
                    background-color: #fee2e2 !important;
                }
                .status-active:hover {
                    background-color: #fde68a !important;
                }
            `}</style>
            <AppAgGrid<VehicleLocationItem>
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                getRowClass={getRowClass}
                onCellValueChanged={onCellValueChanged}
                editType="fullRow"
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                rowSelection={{ mode: 'singleRow', enableClickSelection: false, checkboxes: false }}
                loading={loading}
            />

            {/* History Modal */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Location History - {selectedEntry}</DialogTitle>
                        <DialogDescription className="sr-only">
                            Timeline of location and status updates for this LR.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        {historyData.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No history available</p>
                        ) : (
                            <div className="space-y-3">
                                {historyData.map((item) => (
                                    <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-slate-900">{item.location}</p>
                                                <p className="text-xs text-slate-500 mt-1">{statusLabel(item.status)}</p>
                                                {item.notes && <p className="text-sm text-slate-600 mt-1">{item.notes}</p>}
                                            </div>
                                            <div className="text-right text-xs text-slate-500">
                                                <p>{formatDisplayDate(item.reported_at, '')}</p>
                                                <p>{format(parseISO(item.reported_at), 'HH:mm')}</p>
                                                {item.reported_by && <p className="mt-1">by {item.reported_by}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hints */}
            <div className="text-xs text-slate-500 text-center space-x-4">
                <span>💡 Double-click Current City or Status to edit</span>
                <span>•</span>
                <span>Green = Arrived Destination</span>
                <span>Yellow = Active</span>
                <span>Red = No update &gt;24h</span>
            </div>
        </div>
    );
}
