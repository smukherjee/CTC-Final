export type UserRole = 'ADMIN' | 'OPERATIONS' | 'ACCOUNTS' | 'TRACKING';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    branch_id: string;
}

export type ClientType = 'CONSIGNOR' | 'CONSIGNEE' | 'BOTH';

export interface Client {
    id: string;
    name: string;
    address: string;
    gstin?: string;
    mobile?: string;
    type: ClientType;
    tds_rate?: number;
}

export interface Vendor {
    id: string;
    name: string;
    gstin?: string;
    mobile: string;
    pan?: string;
}

export type VehicleStatus = 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE';

export interface Vehicle {
    id: string;
    number: string;
    type: string; // e.g., '32 FT MXL'
    capacity: string; // e.g., '18 Tons'
    owner_id?: string; // Link to Vendor if 3rd client
    status: VehicleStatus;
}

export interface Contract {
    id: string;
    name: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
    expiry_alert_days?: number;
}

export interface Template {
    id: string;
    name: string;
    description?: string;
    file_url?: string;
}

export type LRStatus = 'DRAFT' | 'DISPATCHED' | 'DELIVERED' | 'POD_UPLOADED' | 'POD_VERIFIED' | 'BILLED';

export interface EWayBill {
    id: string | number;
    lr_id?: string | number;
    number: string;
    valid_from?: string;
    valid_upto?: string;
    expires_at?: string;
    status: 'ACTIVE' | 'EXPIRED';
    is_expired?: boolean;
    alert_sent?: boolean;
    file_url?: string;
    extension_count?: number;
    last_extended_at?: string;
    meta?: Record<string, unknown>;
}

export interface GoodsLineItem {
    id: string;
    articles_count: number;
    description: string;
    weight_qtl: number;
    weight_kg: number;
    rate_per_qtl: number;
    freight_rs: number;
    freight_p: number;
    remarks?: string;
}

export interface LoadingPointTimes {
    in_date?: string;
    in_time?: string;
    out_date?: string;
    out_time?: string;
}

export interface LRDeduction {
    id?: number;
    deduction_label: string;
    deduction_amount: number;
    sort_order?: number;
}

export interface LR {
    id: string;
    lr_number: string; // e.g., 49301
    date: string; // ISO Date

    consignor_id: string;
    consignor_name: string; // Denormalized for Grid Performance
    consignee_id: string;
    consignee_name: string; // Denormalized

    // Locations
    delivery_at?: string; // Specific delivery point

    // eway_bill JSONB deprecated — use eway_bills (from eway_bills table)
    eway_bills?: EWayBill[];

    // Goods - Multi-line items
    goods_items: GoodsLineItem[];

    // Single article fields (for backward compatibility with grid)
    articles_count: number;
    articles_description: string;
    weight: number;
    freight_amount: number;

    // Logistics
    vehicle_type?: string;
    vehicle_id?: string | number;
    vehicle_number?: string;
    seal_number?: string;
    driver_name?: string;
    driver_mobile?: string;

    // Loading Point Times
    loading_point_times?: LoadingPointTimes;

    // Financials
    value_rs?: number; // Declared value (sum of goods)
    surcharge?: number;
    hamali_charges?: number;
    st_charges?: number;
    total?: number; // Auto-calculated
    lr_deductions?: LRDeduction[];

    // Origin/Destination (for dispatch register)
    origin: string;
    destination: string;
    bill_number?: string;
    remarks?: string;

    // New fields from Requirements
    fob?: string;
    fob_client_id?: number;
    through?: string; // Broker/Vendor Ref
    through_id?: number; // Vendor id (foreign key)

    status: LRStatus;

    // Risk
    booked_on_owners_risk?: boolean;

    pod_url?: string;
    pod_received?: boolean;
    pod_file_id?: number;
    pod_verified_at?: string;
    financial_year?: string;
    eway_bill_no?: string;
    eway_bill_expiry?: string;
}

// Stats for Dashboard
export interface DashboardStats {
    pending_verification: number;
    active_trips: number;
    unbilled_amount: number;
    cash_balance: number;
}
