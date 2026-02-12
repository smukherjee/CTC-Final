import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Printer, Save, Lock, X } from 'lucide-react';
import { format } from 'date-fns';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import type { LR, GoodsLineItem } from '@/types';
import { Button } from '@/components/ui/button';
import { printLR } from '@/utils/printLR';

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Mock data for dropdowns
const CONSIGNORS = [
    { id: 'C001', name: 'HAVELLS INDIA LTD SRICITY' },
    { id: 'C003', name: 'SURYA ELECTRICALS CHENNAI' },
    { id: 'C005', name: 'FLYJAC LOGISTICS P LTD' },
    { id: 'C007', name: 'VOLTAS LTD' },
    { id: 'C009', name: 'BLUE STAR LIMITED' },
    { id: 'C003', name: 'VIJAY SALES P LTD' },
];

const CONSIGNEES = [
    { id: 'C002', name: 'USHA ELECTROTRADE' },
    { id: 'C004', name: 'METRO DISTRIBUTORS' },
    { id: 'C006', name: 'PRIME AGENCIES PUNE' },
    { id: 'C008', name: 'COOL ZONE HYDERABAD' },
    { id: 'C010', name: 'SHARMA TRADERS DELHI' },
    { id: 'C006', name: 'NATIONAL ELECTRONICS' },
];

const CITIES = ['SRICITY', 'CHENNAI', 'BANGALORE', 'HYDERABAD', 'MUMBAI', 'DELHI', 'PUNE', 'BHIWANDI', 'KANNUR'];

// Zod Schema for Validation
const lrSchema = z.object({
    lr_number: z.string(),
    date: z.string().refine((date) => new Date(date) <= new Date(), {
        message: "Date cannot be in the future",
    }),
    consignor_id: z.string().min(1, "Consignor is required"),
    consignee_id: z.string().min(1, "Consignee is required"),
    from: z.string().min(1, "Origin is required"),
    to: z.string().min(1, "Destination is required"),
    vehicle_number: z.string()
        .regex(/^[A-Z]{2}\s\d{2}\s[A-Z]{1,2}\s\d{4}$/, "Invalid Vehicle Number (e.g. MH 12 AB 1234)")
        .optional()
        .or(z.literal('')),
    seal_number: z.string().optional(),
    delivery_at: z.string().optional(),
    booked_on_owners_risk: z.boolean().optional(),
    loading_point_times: z.object({
        in_date: z.string().optional(),
        in_time: z.string().optional(),
        out_date: z.string().optional(),
        out_time: z.string().optional(),
    }).optional(),
    surcharge: z.coerce.number().min(0).optional(),
    hamali_charges: z.coerce.number().min(0).optional(),
    st_charges: z.coerce.number().min(0).optional(),
});

// TypeScript type inferred from Zod schema
type LRFormValues = z.infer<typeof lrSchema>;

// AG Grid Theme
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
    cellHorizontalPaddingScale: 0.7,
    headerHeight: 32,
    rowHeight: 32,
});

interface CreateLRProps {
    lrId?: string;
    initialData?: LR;
    isModal?: boolean;
    onClose?: () => void;
    onSave?: (lr: LR) => void;
}

export default function CreateLR({ lrId: propLrId, initialData, isModal, onClose, onSave }: CreateLRProps) {
    const { lrId: paramLrId } = useParams();
    const lrId = propLrId || paramLrId;

    // Goods Items State (Managed separately from RHF due to AG Grid complexity)
    const [goodsItems, setGoodsItems] = useState<GoodsLineItem[]>([{
        id: '1',
        articles_count: 0,
        description: '',
        weight_qtl: 0,
        weight_kg: 0,
        rate_per_qtl: 0,
        freight_rs: 0,
        freight_p: 0,
    }]);

    const [status, setStatus] = useState<string>('DRAFT');
    const gridRef = useRef<AgGridReact>(null);

    // Initial Defaults
    const defaultValues: Partial<LRFormValues> = {
        lr_number: (Math.floor(40000 + Math.random() * 10000)).toString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        booked_on_owners_risk: false,
        surcharge: 0,
        hamali_charges: 0,
        st_charges: 0,
        loading_point_times: {},
    };

    // React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<LRFormValues>({
        resolver: zodResolver(lrSchema) as any, // Cast to avoid strict type mismatch with Zod 4.x/3.x
        defaultValues,
    });

    // Helper to find names
    const getConsignorName = (id: string) => CONSIGNORS.find(c => c.id === id)?.name || '';
    const getConsigneeName = (id: string) => CONSIGNEES.find(c => c.id === id)?.name || '';

    // Load Data
    useEffect(() => {
        const lrToLoad = initialData;
        if (lrToLoad) {
            // Map existing LR to form values
            reset({
                lr_number: lrToLoad.lr_number,
                date: lrToLoad.date,
                consignor_id: lrToLoad.consignor_id,
                consignee_id: lrToLoad.consignee_id,
                from: lrToLoad.from,
                to: lrToLoad.to,
                delivery_at: lrToLoad.delivery_at,
                vehicle_number: lrToLoad.vehicle_number || '',
                seal_number: lrToLoad.seal_number || '',
                booked_on_owners_risk: lrToLoad.booked_on_owners_risk || false,
                surcharge: lrToLoad.surcharge || 0,
                hamali_charges: lrToLoad.hamali_charges || 0,
                st_charges: lrToLoad.st_charges || 0,
                loading_point_times: lrToLoad.loading_point_times || {},
            });
            setGoodsItems(lrToLoad.goods_items || []);
            setStatus(lrToLoad.status);
        }
    }, [initialData, reset]);

    const isReadOnly = !!(lrId && status !== 'DRAFT');

    // --- AG Grid Handlers ---

    const addGoodsLine = () => {
        if (isReadOnly) return;
        const newItem: GoodsLineItem = {
            id: Date.now().toString(),
            articles_count: 0,
            description: '',
            weight_qtl: 0,
            weight_kg: 0,
            rate_per_qtl: 0,
            freight_rs: 0,
            freight_p: 0,
        };
        setGoodsItems(prev => [...prev, newItem]);
    };

    const handleDeleteLine = useCallback((id: string) => {
        if (goodsItems.length > 1) {
            setGoodsItems(prev => prev.filter(item => item.id !== id));
        }
    }, [goodsItems.length]);

    const onCellValueChanged = useCallback((event: any) => {
        const item = event.data as GoodsLineItem;
        // Recalculate freight
        const totalQtl = item.weight_qtl + (item.weight_kg / 100);
        const freightTotal = totalQtl * item.rate_per_qtl;
        item.freight_rs = Math.floor(freightTotal);
        item.freight_p = Math.round((freightTotal - item.freight_rs) * 100);

        setGoodsItems(prev => prev.map(g => g.id === item.id ? { ...item } : g));
    }, []);

    // --- Calculations ---

    const { goodsValue, total, articlesCount, totalWeight, totalFreight } = useMemo(() => {
        const goodsVal = goodsItems.reduce((sum, item) => sum + item.freight_rs + (item.freight_p / 100), 0);
        const sur = watch('surcharge') || 0;
        const ham = watch('hamali_charges') || 0;
        const st = watch('st_charges') || 0;

        return {
            goodsValue: goodsVal,
            total: goodsVal + sur + ham + st,
            articlesCount: goodsItems.reduce((sum, item) => sum + item.articles_count, 0),
            totalWeight: goodsItems.reduce((sum, item) => sum + item.weight_kg + (item.weight_qtl * 100), 0),
            totalFreight: goodsVal
        };
    }, [goodsItems, watch('surcharge'), watch('hamali_charges'), watch('st_charges')]);

    // --- Submit Handler ---

    const onSubmit = (data: LRFormValues) => {
        if (goodsItems.length === 0) {
            alert("Please add at least one line item.");
            return;
        }

        const fullLR: LR = {
            id: lrId || Date.now().toString(), // Generate simplified ID for new LRs
            ...data,
            // Explicitly cast or map optional fields
            loading_point_times: data.loading_point_times,
            booked_on_owners_risk: data.booked_on_owners_risk,
            consignor_name: getConsignorName(data.consignor_id),
            consignee_name: getConsigneeName(data.consignee_id),
            goods_items: goodsItems,
            // Computed fields for Dispatch Register
            articles_count: articlesCount,
            weight: totalWeight, // In KG for consistency? grid says weight_kg and weight_qtl. This field is for DR summary.
            freight_amount: totalFreight,
            value_rs: goodsValue,
            total: total,
            status: (status as any) || 'DRAFT',
            // Default fields if new
            articles_description: goodsItems[0]?.description || '',
        };

        if (onSave) {
            onSave(fullLR);
        } else {
            console.warn("No onSave handler provided", fullLR);
        }
    };

    const handlePrint = () => {
        const data = watch();
        const fullLR: any = {
            ...data,
            consignor_name: getConsignorName(data.consignor_id),
            consignee_name: getConsigneeName(data.consignee_id),
            goods_items: goodsItems,
            value_rs: goodsValue,
            total: total,
        };
        printLR(fullLR);
    };

    // --- Column Definitions ---
    const colDefs = useMemo<any[]>(() => [
        {
            field: 'articles_count',
            headerName: 'No. of Articles',
            width: 130,
            editable: !isReadOnly,
            cellEditor: 'agNumberCellEditor',
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 1,
            minWidth: 200,
            editable: !isReadOnly,
        },
        {
            field: 'weight_qtl',
            headerName: 'Weight (QTL)',
            width: 120,
            editable: !isReadOnly,
            cellEditor: 'agNumberCellEditor',
            valueParser: (params: any) => Number(params.newValue),
        },
        {
            field: 'weight_kg',
            headerName: 'Weight (KG)',
            width: 120,
            editable: !isReadOnly,
            cellEditor: 'agNumberCellEditor',
            valueParser: (params: any) => Number(params.newValue),
        },
        {
            field: 'rate_per_qtl',
            headerName: 'Rate per QTL',
            width: 130,
            editable: !isReadOnly,
            cellEditor: 'agNumberCellEditor',
            valueParser: (params: any) => Number(params.newValue),
            valueFormatter: (params: { value: number }) => params.value ? `₹${params.value}` : '',
        },
        {
            headerName: 'Freight (₹)',
            width: 130,
            valueGetter: (params: any) => {
                const item = params.data as GoodsLineItem;
                return item.freight_rs + (item.freight_p / 100);
            },
            valueFormatter: (params: { value: number }) => params.value ? `₹${params.value.toFixed(2)}` : '₹0.00',
            cellStyle: { backgroundColor: '#f8fafc', fontWeight: '600' },
        },
        {
            field: 'remarks',
            headerName: 'Remarks',
            width: 150,
            editable: !isReadOnly,
        },
        {
            headerName: 'Act',
            width: 60,
            pinned: 'right',
            cellRenderer: (params: { data: GoodsLineItem }) => (
                <div className="flex items-center justify-center h-full">
                    <button
                        type="button"
                        onClick={() => handleDeleteLine(params.data.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={goodsItems.length === 1 || isReadOnly}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ], [handleDeleteLine, goodsItems.length, isReadOnly]);

    return (
        <div className="h-full overflow-hidden flex flex-col bg-slate-50/50">
            {/* Modal Header (if modal) */}
            {isModal && (
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {lrId ? (isReadOnly ? 'View Lorry Receipt' : 'Edit Lorry Receipt') : 'Create Lorry Receipt'}
                        </h2>
                        {isReadOnly && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 mt-1">
                                <Lock size={12} />
                                Read-only Mode
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-auto p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto space-y-6">

                    {/* Page Header (if not modal) - keep for standalone consistency */}
                    {!isModal && (
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    {lrId ? 'Edit Lorry Receipt' : 'Create Lorry Receipt'}
                                </h1>
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex justify-end gap-2 sticky top-0 z-10 bg-slate-50/50 py-2 backdrop-blur-sm">
                        <Button type="button" onClick={handlePrint} variant="outline" className="gap-2 bg-white">
                            <Printer size={16} />
                            Print
                        </Button>
                        {!isReadOnly && (
                            <Button type="submit" className="gap-2">
                                <Save size={16} />
                                Save LR
                            </Button>
                        )}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-8">

                        {/* 1. Header Details */}
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">LR Number</label>
                                <input
                                    {...register('lr_number')}
                                    disabled
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                                <input
                                    type="date"
                                    {...register('date')}
                                    disabled={isReadOnly}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                />
                                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* 2. Parties */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Consignor <span className="text-red-500">*</span></label>
                                    <select
                                        {...register('consignor_id')}
                                        disabled={isReadOnly}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="">Select Consignor</option>
                                        {CONSIGNORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.consignor_id && <p className="text-red-500 text-xs mt-1">{errors.consignor_id.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">From City <span className="text-red-500">*</span></label>
                                    <select
                                        {...register('from')}
                                        disabled={isReadOnly}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="">Select Origin</option>
                                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Consignee <span className="text-red-500">*</span></label>
                                    <select
                                        {...register('consignee_id')}
                                        disabled={isReadOnly}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="">Select Consignee</option>
                                        {CONSIGNEES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.consignee_id && <p className="text-red-500 text-xs mt-1">{errors.consignee_id.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">To City <span className="text-red-500">*</span></label>
                                    <select
                                        {...register('to')}
                                        disabled={isReadOnly}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="">Select Destination</option>
                                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery At</label>
                                    <input
                                        {...register('delivery_at')}
                                        disabled={isReadOnly}
                                        placeholder="Specific location..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* 3. Goods Grid */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Goods Details</h3>
                                {!isReadOnly && (
                                    <Button type="button" onClick={addGoodsLine} size="sm" variant="outline" className="gap-2 h-8 text-xs">
                                        <Plus size={14} />
                                        Add Item
                                    </Button>
                                )}
                            </div>

                            <div className="h-64 rounded-md overflow-hidden border border-slate-200">
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={goodsItems}
                                    columnDefs={colDefs}
                                    defaultColDef={{ sortable: false, resizable: true }}
                                    theme={ctcTheme}
                                    editType="fullRow"
                                    stopEditingWhenCellsLoseFocus={true}
                                    onCellValueChanged={onCellValueChanged}
                                    suppressRowClickSelection={true}
                                />
                            </div>
                        </div>

                        {/* 4. Transport & Loading */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-900">Vehicle Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Vehicle No.</label>
                                        <input
                                            {...register('vehicle_number')}
                                            disabled={isReadOnly}
                                            placeholder="MH 04 AB 1234"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-md uppercase"
                                        />
                                        {errors.vehicle_number && <p className="text-red-500 text-xs mt-1">{errors.vehicle_number.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Seal No.</label>
                                        <input
                                            {...register('seal_number')}
                                            disabled={isReadOnly}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="owners_risk"
                                            {...register('booked_on_owners_risk')}
                                            disabled={isReadOnly}
                                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                        />
                                        <label htmlFor="owners_risk" className="text-sm text-slate-700">Booked on Owner's Risk</label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-900">Loading Point Time</h4>
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-md border border-slate-100">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">In Date</label>
                                        <input type="date" {...register('loading_point_times.in_date')} disabled={isReadOnly} className="w-full text-xs px-2 py-1 border rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">In Time</label>
                                        <input type="time" {...register('loading_point_times.in_time')} disabled={isReadOnly} className="w-full text-xs px-2 py-1 border rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Out Date</label>
                                        <input type="date" {...register('loading_point_times.out_date')} disabled={isReadOnly} className="w-full text-xs px-2 py-1 border rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Out Time</label>
                                        <input type="time" {...register('loading_point_times.out_time')} disabled={isReadOnly} className="w-full text-xs px-2 py-1 border rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Financials */}
                        <div className="border-t border-slate-200 pt-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Value (Rs.)</label>
                                    <div className="text-2xl font-bold text-slate-900">₹{goodsValue.toFixed(2)}</div>
                                    <p className="text-xs text-slate-400 mt-1">Calculated from goods items</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm text-slate-600">Surcharge</label>
                                        <input
                                            type="number"
                                            {...register('surcharge')}
                                            disabled={isReadOnly}
                                            className="w-32 px-2 py-1 text-right border border-slate-200 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm text-slate-600">Hamali Charges</label>
                                        <input
                                            type="number"
                                            {...register('hamali_charges')}
                                            disabled={isReadOnly}
                                            className="w-32 px-2 py-1 text-right border border-slate-200 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-sm text-slate-600">St. Charges</label>
                                        <input
                                            type="number"
                                            {...register('st_charges')}
                                            disabled={isReadOnly}
                                            className="w-32 px-2 py-1 text-right border border-slate-200 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                                        <label className="font-bold text-slate-900">Grand Total</label>
                                        <div className="text-xl font-bold text-slate-900">₹{total.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
