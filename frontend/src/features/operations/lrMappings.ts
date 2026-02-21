import type { LR } from '@/types';

export function mapApiLrToUi(it: any, defaultStatus = ''): LR {
  return {
    id: String(it.id),
    lr_number: it.lr_number,
    date: it.date || it.created_at || '',
    dispatch_id: it.dispatch_id,
    consignor_id: it.consignor_id || '',
    consignor_name: it.consignor_name || '',
    consignee_id: it.consignee_id || '',
    consignee_name: it.consignee_name || '',
    origin: it.origin || '',
    destination: it.destination || '',
    goods_items: it.goods_items || [],
    articles_count: it.articles_count || 0,
    articles_description: it.articles_description || '',
    weight: it.weight || 0,
    freight_amount: it.freight_amount || 0,
    fob: it.fob || '',
    through: it.through || '',
    through_id: it.through_id ? Number(it.through_id) : undefined,
    vehicle_type: it.vehicle_type || '',
    vehicle_number: it.vehicle_number || '',
    vehicle_id: it.vehicle_id,
    seal_number: it.seal_number || '',
    driver_name: it.driver_name || '',
    driver_mobile: it.driver_mobile || '',
    bill_number: it.bill_number || '',
    remarks: it.remarks || '',
    status: it.status || defaultStatus,
    value_rs: it.value_rs || 0,
    surcharge: it.surcharge || 0,
    hamali_charges: it.hamali_charges || 0,
    st_charges: it.st_charges || 0,
    total: it.total || 0,
    delivery_at: it.delivery_at || '',
    booked_on_owners_risk: it.booked_on_owners_risk || false,
    loading_point_times: it.loading_point_times || {},
    pod_url: it.pod_url || '',
    pod_verified_at: it.pod_verified_at || '',
  };
}

export function mapApiLrsToUi(rows: any[], defaultStatus = ''): LR[] {
  return rows.map((it) => mapApiLrToUi(it, defaultStatus));
}

export function mapVendorOptions(vendors: any[]) {
  const vendorIds: number[] = [];
  const vendorNameById: Record<string, string> = {};

  vendors.forEach((v: any) => {
    if (v.id === undefined || v.id === null) return;
    const id = Number(v.id);
    vendorIds.push(id);
    vendorNameById[String(id)] = v.name || '';
  });

  return { vendorIds, vendorNameById };
}

export function mapVehicleOptions(vehicles: any[]) {
  const vehicleTypeByNumber: Record<string, string> = {};
  const vehicleIdByNumber: Record<string, number> = {};
  const vehicleNumbers: string[] = [];

  vehicles.forEach((v: any) => {
    if (!v.number) return;
    const number = String(v.number);
    vehicleTypeByNumber[number] = v.type || '';
    if (v.id !== undefined && v.id !== null) {
      vehicleIdByNumber[number] = Number(v.id);
    }
    vehicleNumbers.push(number);
  });

  return { vehicleNumbers, vehicleTypeByNumber, vehicleIdByNumber };
}
