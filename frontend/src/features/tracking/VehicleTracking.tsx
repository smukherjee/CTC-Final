import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { format, parseISO } from 'date-fns';
import { MapPin, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

ModuleRegistry.registerModules([AllCommunityModule]);

// Predefined location options
const LOCATION_OPTIONS = [
    'In Transit',
    'Loading',
    'Unloading',
    'Arrived - Origin',
    'Arrived - Destination',
    'Detained',
    'Breakdown',
    'At Toll Plaza',
    'At RTO Check',
    'At Border',
    'Driver Break',
    'Fuel Stop',
];

interface VehicleLocationItem {
    lr_id?: number;
    lr_number?: string;
    vehicle_number: string;
    origin?: string;
    destination?: string;
    location?: string | null;
    reported_at?: string | null;
    date?: string;
}

interface LocationHistoryItem {
    id: number;
    location: string;
    reported_at: string;
    reported_by?: string;
    notes?: string;
}

export default function VehicleTracking() {
    const [rowData, setRowData] = useState<VehicleLocationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [historyData, setHistoryData] = useState<LocationHistoryItem[]>([]);
    const gridRef = useRef<AgGridReact>(null);

    const loadLatestLocations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/vehicle-location/latest');
            setRowData(res.data || []);
        } catch (err) {
            console.error('Failed to load vehicle locations', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLatestLocations();
    }, [loadLatestLocations]);

    const loadHistory = async (vehicleNumber: string) => {
        try {
            const res = await axios.get(`/api/vehicle-location/history/${vehicleNumber}`);
            setHistoryData(res.data || []);
            setSelectedVehicle(vehicleNumber);
            setHistoryOpen(true);
        } catch (err) {
            console.error('Failed to load history', err);
            alert('No history found for this vehicle');
        }
    };

    const updateLocation = async (vehicleNumber: string, lrId: number | undefined, newLocation: string) => {
        try {
            await axios.post('/api/vehicle-location/', {
                lr_id: lrId || null,
                vehicle_number: vehicleNumber,
                location: newLocation,
                reported_by: 'User', // TODO: Get from auth context
            });
            loadLatestLocations(); // Refresh grid
        } catch (err) {
            console.error('Failed to update location', err);
            alert('Failed to update location');
        }
    };

    const onCellValueChanged = useCallback((event: any) => {
        if (event.colDef.field === 'location') {
            const { vehicle_number, lr_id } = event.data;
            const newLocation = event.newValue;
            if (newLocation) {
                updateLocation(vehicle_number, lr_id, newLocation);
            }
        }
    }, []);

    // Color coding based on reported time
    const getRowClass = useCallback((params: { data?: VehicleLocationItem }): string | undefined => {
        if (!params.data?.reported_at) return undefined;

        const reportedAt = parseISO(params.data.reported_at);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60);

        if (params.data.location?.toLowerCase().includes('delivered')) {
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
                return format(parseISO(params.value), 'dd/MM/yyyy');
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
            headerName: 'Current Location',
            width: 200,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: LOCATION_OPTIONS,
            },
            valueFormatter: (params: any) => {
                return params.value || 'Set Location...';
            },
            cellStyle: (params: any) => {
                if (!params.value || params.value === 'Pending') {
                    return { fontStyle: 'italic', color: '#94a3b8' };
                }
                return { fontWeight: '600', color: '#1e40af' };
            },
        },
        {
            field: 'reported_at',
            headerName: 'Last Updated',
            width: 150,
            valueFormatter: (params: any) => {
                if (!params.value) return '';
                return format(parseISO(params.value), 'dd/MM HH:mm');
            },
        },
        {
            headerName: 'Actions',
            width: 80,
            pinned: 'right',
            cellRenderer: (params: { data: VehicleLocationItem }) => (
                <div className="flex items-center justify-center h-full">
                    <button
                        onClick={() => loadHistory(params.data.vehicle_number)}
                        className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                        title="View History"
                    >
                        <History size={14} />
                    </button>
                </div>
            ),
        },
    ], []);

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
                    <p className="text-sm text-slate-500 mt-1">
                        Track vehicle locations • {rowData.length} active vehicles
                    </p>
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
            <div className="flex-1 min-h-[500px] rounded-lg overflow-hidden border border-slate-200 ag-theme-alpine">
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
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    getRowClass={getRowClass}
                    editType="fullRow"
                    stopEditingWhenCellsLoseFocus={true}
                    onCellValueChanged={onCellValueChanged}
                    animateRows={true}
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                />
            </div>

            {/* History Modal */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Location History - {selectedVehicle}</DialogTitle>
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
                                                {item.notes && <p className="text-sm text-slate-600 mt-1">{item.notes}</p>}
                                            </div>
                                            <div className="text-right text-xs text-slate-500">
                                                <p>{format(parseISO(item.reported_at), 'dd MMM yyyy')}</p>
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
            <div className="text-xs text-slate-400 text-center space-x-4">
                <span>💡 Double-click Location to edit</span>
                <span>•</span>
                <span>🟢 Green = Delivered</span>
                <span>🟡 Yellow = Active</span>
                <span>🔴 Red = No update &gt;24h</span>
            </div>
        </div>
    );
}
