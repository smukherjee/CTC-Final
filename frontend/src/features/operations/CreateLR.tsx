import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Printer, Save, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import type { LR, GoodsLineItem } from '@/types';
import { Button } from '@/components/ui/button';
import { printLR } from '@/utils/printLR';
import { EMPTY_FORM_OPTIONS, fetchFormOptions, type FormOptions } from '@/config/formOptions';
import { mapApiLrToUi } from './lrMappings';

// Register AG Grid Modules (explicitly include useful community modules)
ModuleRegistry.registerModules([AllCommunityModule]);

// Zod Schema for Validation
const lrSchema = z.object({
    lr_number: z.string().min(1),
    date: z.string().optional(),
    consignor_id: z.string().min(1, 'Consignor is required'),
    consignee_id: z.string().min(1, 'Consignee is required'),
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    through: z.string().optional(),
    through_id: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().optional()),
    delivery_at: z.string().optional(),
    vehicle_number: z.string().optional(),
    vehicle_id: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().optional()),
    seal_number: z.string().optional(),
    booked_on_owners_risk: z.boolean().optional(),
    surcharge: z.preprocess((v) => Number(v), z.number().optional()),
    hamali_charges: z.preprocess((v) => Number(v), z.number().optional()),
    st_charges: z.preprocess((v) => Number(v), z.number().optional()),
    loading_point_times: z.object({
        in_date: z.string().optional(),
        in_time: z.string().optional(),
        out_date: z.string().optional(),
        out_time: z.string().optional(),
    }).optional(),
});

// TypeScript type inferred from Zod schema
type LRFormValues = z.infer<typeof lrSchema>;

interface CreateLRProps {
    lrId?: string;
    initialData?: LR;
    isModal?: boolean;
    onSave?: (lr: LR) => void;
}

export default function CreateLR({ lrId: propLrId, initialData, isModal, onSave }: CreateLRProps) {
    const { lrId: paramLrId } = useParams();
    // Prioritize prop (modal mode), fallback to param (route mode)
    const lrId = propLrId || paramLrId;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [citiesList, setCitiesList] = useState<string[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [consignors, setConsignors] = useState<{ id: string; name: string }[]>([]);
    const [consignees, setConsignees] = useState<{ id: string; name: string }[]>([]);
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
    const [status, setStatus] = useState<string>('');
    const [formOptions, setFormOptions] = useState<FormOptions>(EMPTY_FORM_OPTIONS);
    const [resolvedLrId, setResolvedLrId] = useState<number | null>(null);

    const gridRef = useRef<AgGridReact>(null);

    const defaultValues = {
        lr_number: initialData?.lr_number || `LR-${Date.now()}`,
        date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
        consignor_id: initialData?.consignor_id || '',
        consignee_id: initialData?.consignee_id || '',
        origin: initialData?.origin || '',
        destination: initialData?.destination || '',
        through: initialData?.through || '',
        through_id: initialData?.through_id ? Number(initialData.through_id) : undefined,
        delivery_at: '',
        vehicle_number: '',
        vehicle_id: undefined,
        seal_number: '',
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
        formState: { errors },
        setValue
    } = useForm<LRFormValues>({
        resolver: zodResolver(lrSchema) as any,
        defaultValues,
    });

    const [vehiclesList, setVehiclesList] = useState<{id: string; number: string}[]>([]);
    const toNumber = useCallback((value: unknown): number => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }, []);

    const getConsignorName = (id: string) => (consignors.find(c => String(c.id) === String(id)) || { name: '' }).name;
    const getConsigneeName = (id: string) => (consignees.find(c => String(c.id) === String(id)) || { name: '' }).name;

    // Load Data
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                // 1. Load Master Lists in parallel
                const [citiesRes, vendorsRes, partyRes, vehicleRes, optionsRes] = await Promise.all([
                    axios.get('/api/city/').catch(() => ({ data: [] })),
                    axios.get('/api/vendor/').catch(() => ({ data: [] })),
                    axios.get('/api/party/').catch(() => ({ data: [] })),
                    axios.get('/api/vehicle/').catch(() => ({ data: [] })),
                    fetchFormOptions().catch(() => EMPTY_FORM_OPTIONS),
                ]);

                if (!mounted) return;

                setFormOptions(optionsRes);
                const draftStatus = optionsRes.defaults.lr_status || '';

                // Process Cities
                let loadedCities: string[] = [];
                if (Array.isArray(citiesRes.data)) {
                    loadedCities = citiesRes.data.map((c: any) => c.name || c.code).filter(Boolean);
                }
                setCitiesList(loadedCities);

                // Process Vendors
                if (Array.isArray(vendorsRes.data)) {
                    setVendors(vendorsRes.data);
                }

                // Process Vehicles
                let loadedVehicles: any[] = [];
                if (Array.isArray(vehicleRes.data)) {
                    // Map to id/number pairs for stable selection
                    const vList = vehicleRes.data.map((v: any) => ({ id: String(v.id ?? v.vehicle_id ?? v._id ?? ''), number: (v.number || v.vehicle_number || v.vehicleNo || v.vehicle_no || '').toString() })).filter((x: any) => x.number);
                    loadedVehicles = vList;
                    setVehiclesList(vList);
                }

                // Process Parties
                let loadedConsignors: { id: string, name: string }[] = [];
                let loadedConsignees: { id: string, name: string }[] = [];

                if (Array.isArray(partyRes.data)) {
                    loadedConsignors = partyRes.data
                        .filter((p: any) => {
                            const partyType = String(p.type || '').toUpperCase();
                            return partyType === 'CONSIGNOR' || partyType === 'BOTH';
                        })
                        .map((p: any) => ({ id: String(p.id), name: p.name }));
                    loadedConsignees = partyRes.data
                        .filter((p: any) => {
                            const partyType = String(p.type || '').toUpperCase();
                            return partyType === 'CONSIGNEE' || partyType === 'BOTH';
                        })
                        .map((p: any) => ({ id: String(p.id), name: p.name }));

                    setConsignors(loadedConsignors);
                    setConsignees(loadedConsignees);
                }

                // 2. Map Initial Data AFTER lists are loaded
                // Helper to resolve 'through' (vendor) by id or name
                const findThroughVendor = (id: any, name: any) => {
                    const vendorsList = Array.isArray(vendorsRes.data) ? vendorsRes.data : [];
                    const byId = vendorsList.find((v: any) => String(v.id) === String(id));
                    if (byId) return { id: byId.id, name: byId.name };
                    const byName = vendorsList.find((v: any) => String(v.name || '').trim().toUpperCase() === String(name || '').trim().toUpperCase());
                    if (byName) return { id: byName.id, name: byName.name };
                    return { id: undefined, name: name || '' };
                };

                const findConsignorId = (id: string, name: string) => {
                    const byId = loadedConsignors.find(c => String(c.id) === String(id));
                    if (byId) return byId.id;
                    const byName = loadedConsignors.find(c => c.name?.trim().toUpperCase() === name?.trim().toUpperCase());
                    return byName ? byName.id : '';
                };

                const findConsigneeId = (id: string, name: string) => {
                    const byId = loadedConsignees.find(c => String(c.id) === String(id));
                    if (byId) return byId.id;
                    const byName = loadedConsignees.find(c => c.name?.trim().toUpperCase() === name?.trim().toUpperCase());
                    return byName ? byName.id : '';
                };

                const normalizeCity = (city: string) => {
                    if (!city) return '';
                    const match = loadedCities.find(c => c.trim().toUpperCase() === city.trim().toUpperCase());
                    return match || city;
                };

                const applyLrToForm = (lrData: any) => {
                    const throughMatch = findThroughVendor(lrData?.through_id, lrData?.through);
                    reset({
                        lr_number: lrData?.lr_number || `LR-${Date.now()}`,
                        date: lrData?.date || format(new Date(), 'yyyy-MM-dd'),
                        consignor_id: findConsignorId(lrData?.consignor_id, lrData?.consignor_name),
                        consignee_id: findConsigneeId(lrData?.consignee_id, lrData?.consignee_name),
                        origin: normalizeCity(lrData?.origin || ''),
                        destination: normalizeCity(lrData?.destination || ''),
                        through: throughMatch.name || (lrData?.through || ''),
                        through_id: throughMatch.id ? Number(throughMatch.id) : undefined,
                        delivery_at: lrData?.delivery_at || '',
                        vehicle_number: lrData?.vehicle_number || '',
                        vehicle_id: lrData?.vehicle_id
                            ? Number(lrData.vehicle_id)
                            : (lrData?.vehicle_number
                                ? (loadedVehicles?.find((vv: any) => (vv.number || vv.vehicle_number || vv.vehicleNo || vv.vehicle_no) === lrData.vehicle_number) || {}).id
                                : undefined),
                        seal_number: lrData?.seal_number || '',
                        booked_on_owners_risk: !!lrData?.booked_on_owners_risk,
                        surcharge: toNumber(lrData?.surcharge),
                        hamali_charges: toNumber(lrData?.hamali_charges),
                        st_charges: toNumber(lrData?.st_charges),
                        loading_point_times: lrData?.loading_point_times || {},
                    });
                    setGoodsItems(Array.isArray(lrData?.goods_items) && lrData.goods_items.length > 0 ? lrData.goods_items : [{
                        id: '1',
                        articles_count: 0,
                        description: '',
                        weight_qtl: 0,
                        weight_kg: 0,
                        rate_per_qtl: 0,
                        freight_rs: 0,
                        freight_p: 0,
                    }]);
                    setStatus(lrData?.status || draftStatus);
                    const dbId = toNumber(lrData?.id);
                    setResolvedLrId(dbId > 0 ? dbId : null);
                };

                const candidateId = toNumber(lrId || (initialData?.id ? String(initialData.id) : ''));
                const canTryFetchById = candidateId > 0;

                if (canTryFetchById) {
                    try {
                        const freshRes = await axios.get(`/api/lr/${candidateId}`, {
                            params: { _ts: Date.now() },
                            headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
                        });
                        if (!mounted) return;
                        applyLrToForm(freshRes.data);
                    } catch (err) {
                        console.error('Failed to fetch latest LR from DB; using initial data fallback', err);
                        if (initialData) {
                            applyLrToForm(initialData);
                        } else {
                            setStatus(draftStatus);
                        }
                    }
                } else {
                    setStatus(draftStatus);
                }

            } catch (err) {
                console.error('Failed to load CreateLR data', err);
            }
        };

        loadData();

        return () => { mounted = false; };
    }, [initialData, isModal, lrId, reset, toNumber]);

    const draftStatus = formOptions.defaults.lr_status || '';
    const isReadOnly = !!(lrId && draftStatus && status !== draftStatus);

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
        const weightQtl = toNumber(item.weight_qtl);
        const weightKg = toNumber(item.weight_kg);
        const ratePerQtl = toNumber(item.rate_per_qtl);
        // Recalculate freight
        const totalQtl = weightQtl + (weightKg / 100);
        const freightTotal = totalQtl * ratePerQtl;
        item.freight_rs = Math.floor(freightTotal);
        item.freight_p = Math.round((freightTotal - item.freight_rs) * 100);
        item.articles_count = toNumber(item.articles_count);
        item.weight_qtl = weightQtl;
        item.weight_kg = weightKg;
        item.rate_per_qtl = ratePerQtl;

        setGoodsItems(prev => prev.map(g => g.id === item.id ? { ...item } : g));
    }, [toNumber]);

    // --- Calculations ---

    const { goodsValue, total, articlesCount, totalWeight, totalFreight } = useMemo(() => {
        const goodsVal = goodsItems.reduce((sum, item) => {
            return sum + toNumber(item.freight_rs) + (toNumber(item.freight_p) / 100);
        }, 0);
        const sur = toNumber(watch('surcharge'));
        const ham = toNumber(watch('hamali_charges'));
        const st = toNumber(watch('st_charges'));

        return {
            goodsValue: goodsVal,
            total: goodsVal + sur + ham + st,
            articlesCount: goodsItems.reduce((sum, item) => sum + toNumber(item.articles_count), 0),
            totalWeight: goodsItems.reduce((sum, item) => sum + toNumber(item.weight_kg) + (toNumber(item.weight_qtl) * 100), 0),
            totalFreight: goodsVal
        };
    }, [goodsItems, toNumber, watch('surcharge'), watch('hamali_charges'), watch('st_charges')]);

    // --- Submit Handler ---

    const onSubmit = async (data: LRFormValues) => {
        if (goodsItems.length === 0) {
            alert("Please add at least one line item.");
            return;
        }

        const fullLR: LR = {
            id: lrId || initialData?.id || '',
            ...data,
            date: data.date || format(new Date(), 'yyyy-MM-dd'),
            // Explicitly cast or map optional fields
            loading_point_times: data.loading_point_times,
            booked_on_owners_risk: data.booked_on_owners_risk,
            consignor_name: getConsignorName(data.consignor_id),
            consignee_name: getConsigneeName(data.consignee_id),
            goods_items: goodsItems,
            // Computed fields for Dispatch Register
            articles_count: articlesCount,
            weight: totalWeight,
            freight_amount: totalFreight,
            value_rs: goodsValue,
            total: total,
            status: (status as any) || draftStatus || undefined,
            // Default fields if new
            articles_description: goodsItems[0]?.description || '',
            through: (data as any).through,
            through_id: (data as any).through_id, // Keep as is, let validation handle it
        };

        // Helper to parse number strictly or return null
        const toIntOrNull = (val: any) => {
            if (val === null || val === undefined || val === '') return null;
            const n = Number(val);
            return isNaN(n) ? null : n;
        };

        // Sanitize data for backend
        const sanitizedData = {
            lr_number: fullLR.lr_number,
            date: fullLR.date,
            consignor_id: fullLR.consignor_id,
            consignor_name: fullLR.consignor_name,
            consignee_id: fullLR.consignee_id,
            consignee_name: fullLR.consignee_name,
            origin: fullLR.origin,
            destination: fullLR.destination,
            delivery_at: fullLR.delivery_at,
            through: fullLR.through,
            through_id: toIntOrNull(fullLR.through_id),
            surcharge: Number(fullLR.surcharge || 0),
            hamali_charges: Number(fullLR.hamali_charges || 0),
            st_charges: Number(fullLR.st_charges || 0),
            weight: Number(fullLR.weight || 0),
            freight_amount: Number(fullLR.freight_amount || 0),
            value_rs: Number(fullLR.value_rs || 0),
            total: Number(fullLR.total || 0),
            articles_count: Number(fullLR.articles_count || 0),
            articles_description: fullLR.articles_description,
                vehicle_id: toIntOrNull(fullLR.vehicle_id as any),
            vehicle_number: fullLR.vehicle_number,
            seal_number: fullLR.seal_number,
            booked_on_owners_risk: fullLR.booked_on_owners_risk,
            loading_point_times: fullLR.loading_point_times,
            status: fullLR.status,
            // Ensure goods items numbers are numbers
            goods_items: fullLR.goods_items?.map(item => ({
                id: item.id,
                description: item.description,
                articles_count: Number(item.articles_count || 0),
                weight_qtl: Number(item.weight_qtl || 0),
                weight_kg: Number(item.weight_kg || 0),
                rate_per_qtl: Number(item.rate_per_qtl || 0),
                freight_rs: Number(item.freight_rs || 0),
                freight_p: Number(item.freight_p || 0),
                remarks: (item as any).remarks, // Include remarks if present
            }))
        };

        // Standard submission handling
        setIsSubmitting(true);
        try {
            // Always save to backend first
            let savedLR: any = null;

            let updateId = resolvedLrId;
            if (!updateId) {
                const idFromInitial = toNumber(initialData?.id);
                const idFromRoute = toNumber(lrId);
                updateId = idFromInitial || idFromRoute || null;
            }

            if (updateId) {
                const res = await axios.put(`/api/lr/${updateId}`, sanitizedData);
                // Use backend response which includes all fields
                savedLR = res.data;
                setResolvedLrId(updateId);
            } else {
                const res = await axios.post('/api/lr/', sanitizedData);
                // Backend returns full object including new ID
                if (res.data) {
                    savedLR = res.data;
                    const createdId = toNumber(res.data.id);
                    setResolvedLrId(createdId > 0 ? createdId : null);
                }
            }

            // Map backend fields to grid-compatible format
            if (savedLR) {
                savedLR = mapApiLrToUi(savedLR, draftStatus);
            }

            setToastMessage('LR saved successfully');

            // If external onSave is provided, call it with the saved data
            if (onSave && savedLR) {
                onSave(savedLR as LR);
                return;
            }

            setTimeout(() => setToastMessage(''), 3000);
        } catch (err: any) {
            console.error('Failed to save LR', err);
            alert('Failed to save LR: ' + (err?.response?.data?.detail || err.message || err));
        } finally {
            setIsSubmitting(false);
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
                                <span className='text-white'>{isSubmitting ? 'Saving...' : 'Save LR'}</span>
                            </Button>
                        )}
                        {toastMessage && <div className="text-green-600 self-center">{toastMessage}</div>}
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
                                        {consignors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.consignor_id && <p className="text-red-500 text-xs mt-1">{errors.consignor_id.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Origin <span className="text-red-500">*</span></label>
                                    <select
                                        {...register('origin')}
                                        disabled={isReadOnly}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="">Select Origin</option>
                                        {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin.message}</p>}
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
                                        {consignees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.consignee_id && <p className="text-red-500 text-xs mt-1">{errors.consignee_id.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Destination <span className="text-red-500">*</span></label>
                                    <select
                                        {...register('destination')}
                                        disabled={isReadOnly}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="">Select Destination</option>
                                        {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
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

                        {/* Carrier / Through */}
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Through (Carrier/Broker)</label>
                                <select
                                    {...register('through_id')}
                                    disabled={isReadOnly}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setValue('through_id', val ? Number(val) : undefined);
                                        const v = (vendors.length ? vendors : []).find((vv: any) => String(vv.id) === String(val));
                                        if (v) setValue('through', v.name);
                                        else setValue('through', '');
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900"
                                >
                                    <option value="">Select Carrier / Broker</option>
                                    {(vendors.length ? vendors : []).map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                        </div>


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

                            <div className="h-64 rounded-md overflow-hidden border border-slate-200 ag-theme-alpine">
                                <AgGridReact
                                    ref={gridRef}
                                    theme="legacy"
                                    rowData={goodsItems}
                                    columnDefs={colDefs}
                                    defaultColDef={{ sortable: false, resizable: true }}
                                    rowSelection={{ mode: 'singleRow', enableClickSelection: false }}

                                    editType="fullRow"
                                    stopEditingWhenCellsLoseFocus={true}
                                    onCellValueChanged={onCellValueChanged}
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
                                        <select
                                            {...register('vehicle_id')}
                                            disabled={isReadOnly}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setValue('vehicle_id', val ? Number(val) : undefined);
                                                const found = vehiclesList.find(v => String(v.id) === String(val));
                                                setValue('vehicle_number', found ? found.number : '');
                                            }}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-md uppercase focus:ring-2 focus:ring-slate-900"
                                        >
                                            <option value="">Select Vehicle</option>
                                            {vehiclesList.map(v => (
                                                <option key={v.id} value={v.id}>{v.number}</option>
                                            ))}
                                        </select>
                                        {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id.message}</p>}
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
