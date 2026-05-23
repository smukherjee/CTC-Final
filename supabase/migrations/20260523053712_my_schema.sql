create sequence "public"."audit_log_id_seq";

create sequence "public"."cities_id_seq";

create sequence "public"."clients_id_seq";

create sequence "public"."contracts_id_seq";

create sequence "public"."eway_bills_id_seq";

create sequence "public"."file_uploads_id_seq";

create sequence "public"."hirememos_id_seq";

create sequence "public"."invoice_lines_id_seq";

create sequence "public"."invoices_id_seq";

create sequence "public"."lr_deductions_id_seq";

create sequence "public"."lrs_id_seq";

create sequence "public"."payment_receipts_id_seq";

create sequence "public"."templates_id_seq";

create sequence "public"."users_id_seq";

create sequence "public"."vehicle_locations_id_seq";

create sequence "public"."vehicles_id_seq";

create sequence "public"."vendors_id_seq";

create sequence "public"."vouchers_id_seq";


  create table "public"."alembic_version" (
    "version_num" character varying(32) not null
      );



  create table "public"."audit_log" (
    "id" bigint not null default nextval('public.audit_log_id_seq'::regclass),
    "entity_type" character varying(64) not null,
    "entity_id" integer,
    "action" character varying(16) not null,
    "user_id" integer,
    "user_name" character varying(128),
    "before_data" jsonb,
    "after_data" jsonb,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."cities" (
    "id" integer not null default nextval('public.cities_id_seq'::regclass),
    "name" character varying(256) not null,
    "state" character varying(128),
    "code" character varying(32),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."clients" (
    "id" integer not null default nextval('public.clients_id_seq'::regclass),
    "name" character varying(256) not null,
    "type" character varying(64) not null,
    "gstin" character varying(64),
    "mobile" character varying(64),
    "address" text,
    "tds_rate" numeric(5,2) not null default '0'::numeric
      );



  create table "public"."contracts" (
    "id" integer not null default nextval('public.contracts_id_seq'::regclass),
    "name" character varying(256) not null,
    "client_id" integer,
    "start_date" date,
    "end_date" date,
    "expiry_alert_days" integer,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."eway_bills" (
    "id" integer not null default nextval('public.eway_bills_id_seq'::regclass),
    "lr_id" integer not null,
    "number" character varying(128) not null,
    "valid_from" date,
    "valid_upto" date,
    "expires_at" timestamp with time zone,
    "status" character varying(32),
    "alert_sent" boolean default false,
    "file_url" character varying(1024),
    "extension_count" integer default 0,
    "last_extended_at" timestamp with time zone,
    "meta" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."file_uploads" (
    "id" integer not null default nextval('public.file_uploads_id_seq'::regclass),
    "document_type" character varying(64) not null,
    "lr_id" integer,
    "hirememo_id" integer,
    "original_filename" character varying(512) not null,
    "stored_filename" character varying(256) not null,
    "storage_path" character varying(1024) not null,
    "file_url" character varying(1024) not null,
    "content_type" character varying(128),
    "file_size" integer not null,
    "checksum" character varying(64),
    "uploaded_by" character varying(128),
    "is_archived" boolean default false,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone
      );



  create table "public"."hirememos" (
    "id" integer not null default nextval('public.hirememos_id_seq'::regclass),
    "lr_id" integer not null,
    "total_amount" numeric(12,2) default '0'::numeric,
    "advance_cash" numeric(12,2) default '0'::numeric,
    "advance_bank" numeric(12,2) default '0'::numeric,
    "advance_payment_date" date,
    "balance" numeric(12,2),
    "balance_payment_date" date,
    "driver_name" character varying(128),
    "driver_mobile" character varying(32),
    "driver_license" character varying(64),
    "hire_memo_no" character varying(64),
    "hire_memo_date" date,
    "branch" character varying(64),
    "vehicle_id" integer,
    "vehicle_number" character varying(32),
    "from_location" character varying(128),
    "to_location" character varying(128),
    "payment_location" character varying(128),
    "rate_type" character varying(32),
    "freight_rate" numeric(12,2),
    "freight_weight" numeric(12,2),
    "guaranteed_weight" numeric(12,2),
    "commission" numeric(12,2) default '0'::numeric,
    "hamali" numeric(12,2) default '0'::numeric,
    "mamul" numeric(12,2) default '0'::numeric,
    "other_deductions" numeric(12,2) default '0'::numeric,
    "ack_status" character varying(32) default 'PENDING'::character varying,
    "notes" text,
    "financial_year" character varying(7) not null default '2025-26'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."invoice_lines" (
    "id" integer not null default nextval('public.invoice_lines_id_seq'::regclass),
    "invoice_id" integer not null,
    "lr_id" integer,
    "s_no" integer,
    "lr_no" character varying(64),
    "lr_date" date,
    "qty" numeric(12,2),
    "particulars" text,
    "v_type" character varying(64),
    "vehicle_no" character varying(32),
    "consignor" character varying(256),
    "consignee" character varying(256),
    "from_city" character varying(100),
    "to_city" character varying(100),
    "freight" numeric(12,2) default '0'::numeric,
    "loading_detention" numeric(12,2) default '0'::numeric,
    "unloading_charges" numeric(12,2) default '0'::numeric,
    "unloading_detention" numeric(12,2) default '0'::numeric,
    "other_charges" numeric(12,2) default '0'::numeric,
    "total" numeric(12,2) default '0'::numeric,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."invoices" (
    "id" integer not null default nextval('public.invoices_id_seq'::regclass),
    "invoice_no" character varying(64) not null,
    "invoice_date" date not null,
    "client_id" integer not null,
    "financial_year" character varying(7) not null default '2025-26'::character varying,
    "po_no" character varying(64),
    "po_date" date,
    "hsn_code" character varying(16) default '996791'::character varying,
    "reverse_charge" boolean default false,
    "gst_paid_by" character varying(64),
    "total_amount" numeric(12,2) default '0'::numeric,
    "tds_amount" numeric(12,2) default '0'::numeric,
    "net_amount" numeric(12,2) default '0'::numeric,
    "status" character varying(32) default 'draft'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."lr_deductions" (
    "id" integer not null default nextval('public.lr_deductions_id_seq'::regclass),
    "lr_id" integer not null,
    "deduction_label" character varying(128) not null,
    "deduction_amount" numeric(12,2) not null default '0'::numeric,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."lrs" (
    "id" integer not null default nextval('public.lrs_id_seq'::regclass),
    "lr_number" character varying(64) not null,
    "date" date,
    "consignor_id" character varying(64),
    "consignor_name" character varying(256),
    "consignee_id" character varying(64),
    "consignee_name" character varying(256),
    "origin" character varying(128),
    "destination" character varying(128),
    "delivery_at" character varying(256),
    "through_id" integer,
    "through" character varying(256),
    "fob" character varying(128),
    "fob_client_id" integer,
    "goods_items" jsonb,
    "articles_count" integer,
    "articles_description" text,
    "weight" numeric(12,2),
    "freight_amount" numeric(12,2),
    "vehicle_id" integer,
    "vehicle_number" character varying(32),
    "vehicle_type" character varying(64),
    "seal_number" character varying(64),
    "driver_name" character varying(128),
    "driver_mobile" character varying(32),
    "booked_on_owners_risk" boolean default false,
    "loading_point_times" jsonb,
    "value_rs" numeric(12,2),
    "surcharge" numeric(12,2),
    "hamali_charges" numeric(12,2),
    "st_charges" numeric(12,2),
    "total" numeric(12,2),
    "bill_number" character varying(64),
    "bill_date" date,
    "amount_passed" numeric(12,2),
    "deductions" character varying(256),
    "cm_no" character varying(64),
    "cm_date" date,
    "remarks" text,
    "pod_url" character varying(1024),
    "pod_verified_at" timestamp with time zone,
    "pod_received" boolean not null default false,
    "pod_file_id" integer,
    "eway_bill_no" character varying(64),
    "eway_bill_expiry" timestamp with time zone,
    "status" character varying(64) not null default 'DRAFT'::character varying,
    "financial_year" character varying(7) not null default '2025-26'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."payment_receipts" (
    "id" integer not null default nextval('public.payment_receipts_id_seq'::regclass),
    "payment_date" date not null,
    "amount" numeric(12,2) default '0'::numeric,
    "invoice_id" integer,
    "received_from_id" integer,
    "received_from" character varying(256) not null,
    "total_billed_amount" numeric(12,2) default '0'::numeric,
    "tds_deducted" numeric(12,2) default '0'::numeric,
    "net_amount" numeric(12,2) default '0'::numeric,
    "other_deduction" numeric(12,2) default '0'::numeric,
    "deduction_remarks" text,
    "payment_mode" character varying(32) default 'BANK'::character varying,
    "financial_year" character varying(7) not null default '2025-26'::character varying,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."templates" (
    "id" integer not null default nextval('public.templates_id_seq'::regclass),
    "name" character varying(256) not null,
    "description" text,
    "file_url" character varying(1024),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."users" (
    "id" integer not null default nextval('public.users_id_seq'::regclass),
    "name" character varying(256) not null,
    "role" character varying(64) not null,
    "branch_id" character varying(64),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."vehicle_locations" (
    "id" integer not null default nextval('public.vehicle_locations_id_seq'::regclass),
    "lr_id" integer,
    "vehicle_number" character varying not null,
    "location" character varying not null,
    "status" character varying,
    "reported_by" character varying,
    "reported_at" timestamp with time zone not null default now(),
    "notes" text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."vehicles" (
    "id" integer not null default nextval('public.vehicles_id_seq'::regclass),
    "number" character varying(64) not null,
    "type" character varying(128),
    "capacity" character varying(64),
    "owner_id" integer,
    "status" character varying(32),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."vendors" (
    "id" integer not null default nextval('public.vendors_id_seq'::regclass),
    "name" character varying(256) not null,
    "type" character varying(64) not null,
    "mobile" character varying(64),
    "address" text,
    "tds_certificate_url" character varying(1024),
    "pan" character varying(64),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."vouchers" (
    "id" integer not null default nextval('public.vouchers_id_seq'::regclass),
    "voucher_type" character varying(64) not null,
    "reference_id" integer,
    "reference_type" character varying(64),
    "amount" numeric(12,2) not null default '0'::numeric,
    "narration" text,
    "date" date not null,
    "financial_year" character varying(7) not null default '2025-26'::character varying,
    "created_at" timestamp with time zone default now()
      );


alter sequence "public"."audit_log_id_seq" owned by "public"."audit_log"."id";

alter sequence "public"."cities_id_seq" owned by "public"."cities"."id";

alter sequence "public"."clients_id_seq" owned by "public"."clients"."id";

alter sequence "public"."contracts_id_seq" owned by "public"."contracts"."id";

alter sequence "public"."eway_bills_id_seq" owned by "public"."eway_bills"."id";

alter sequence "public"."file_uploads_id_seq" owned by "public"."file_uploads"."id";

alter sequence "public"."hirememos_id_seq" owned by "public"."hirememos"."id";

alter sequence "public"."invoice_lines_id_seq" owned by "public"."invoice_lines"."id";

alter sequence "public"."invoices_id_seq" owned by "public"."invoices"."id";

alter sequence "public"."lr_deductions_id_seq" owned by "public"."lr_deductions"."id";

alter sequence "public"."lrs_id_seq" owned by "public"."lrs"."id";

alter sequence "public"."payment_receipts_id_seq" owned by "public"."payment_receipts"."id";

alter sequence "public"."templates_id_seq" owned by "public"."templates"."id";

alter sequence "public"."users_id_seq" owned by "public"."users"."id";

alter sequence "public"."vehicle_locations_id_seq" owned by "public"."vehicle_locations"."id";

alter sequence "public"."vehicles_id_seq" owned by "public"."vehicles"."id";

alter sequence "public"."vendors_id_seq" owned by "public"."vendors"."id";

alter sequence "public"."vouchers_id_seq" owned by "public"."vouchers"."id";

CREATE UNIQUE INDEX alembic_version_pkc ON public.alembic_version USING btree (version_num);

CREATE UNIQUE INDEX audit_log_pkey ON public.audit_log USING btree (id);

CREATE UNIQUE INDEX cities_pkey ON public.cities USING btree (id);

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);

CREATE UNIQUE INDEX contracts_pkey ON public.contracts USING btree (id);

CREATE UNIQUE INDEX eway_bills_pkey ON public.eway_bills USING btree (id);

CREATE UNIQUE INDEX file_uploads_pkey ON public.file_uploads USING btree (id);

CREATE UNIQUE INDEX hirememos_pkey ON public.hirememos USING btree (id);

CREATE UNIQUE INDEX invoice_lines_pkey ON public.invoice_lines USING btree (id);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE INDEX ix_audit_log_created_at ON public.audit_log USING btree (created_at);

CREATE INDEX ix_audit_log_entity ON public.audit_log USING btree (entity_type, entity_id);

CREATE INDEX ix_cities_id ON public.cities USING btree (id);

CREATE INDEX ix_clients_id ON public.clients USING btree (id);

CREATE INDEX ix_contracts_id ON public.contracts USING btree (id);

CREATE INDEX ix_eway_bills_id ON public.eway_bills USING btree (id);

CREATE INDEX ix_eway_bills_lr_id ON public.eway_bills USING btree (lr_id);

CREATE INDEX ix_file_uploads_document_type ON public.file_uploads USING btree (document_type);

CREATE INDEX ix_file_uploads_hirememo_id ON public.file_uploads USING btree (hirememo_id);

CREATE INDEX ix_file_uploads_id ON public.file_uploads USING btree (id);

CREATE INDEX ix_file_uploads_lr_id ON public.file_uploads USING btree (lr_id);

CREATE INDEX ix_hirememos_id ON public.hirememos USING btree (id);

CREATE INDEX ix_invoice_lines_id ON public.invoice_lines USING btree (id);

CREATE INDEX ix_invoices_id ON public.invoices USING btree (id);

CREATE INDEX ix_lr_deductions_id ON public.lr_deductions USING btree (id);

CREATE INDEX ix_lr_deductions_lr_id ON public.lr_deductions USING btree (lr_id);

CREATE INDEX ix_lrs_id ON public.lrs USING btree (id);

CREATE INDEX ix_payment_receipts_id ON public.payment_receipts USING btree (id);

CREATE INDEX ix_payment_receipts_invoice_id ON public.payment_receipts USING btree (invoice_id);

CREATE INDEX ix_payment_receipts_received_from_id ON public.payment_receipts USING btree (received_from_id);

CREATE INDEX ix_templates_id ON public.templates USING btree (id);

CREATE INDEX ix_users_id ON public.users USING btree (id);

CREATE INDEX ix_vehicle_locations_id ON public.vehicle_locations USING btree (id);

CREATE INDEX ix_vehicle_locations_lr_id ON public.vehicle_locations USING btree (lr_id);

CREATE INDEX ix_vehicle_locations_reported_at ON public.vehicle_locations USING btree (reported_at DESC NULLS LAST);

CREATE INDEX ix_vehicle_locations_vehicle_number ON public.vehicle_locations USING btree (vehicle_number);

CREATE INDEX ix_vehicles_id ON public.vehicles USING btree (id);

CREATE INDEX ix_vendors_id ON public.vendors USING btree (id);

CREATE INDEX ix_vouchers_id ON public.vouchers USING btree (id);

CREATE UNIQUE INDEX lr_deductions_pkey ON public.lr_deductions USING btree (id);

CREATE UNIQUE INDEX lrs_pkey ON public.lrs USING btree (id);

CREATE UNIQUE INDEX payment_receipts_pkey ON public.payment_receipts USING btree (id);

CREATE UNIQUE INDEX templates_pkey ON public.templates USING btree (id);

CREATE UNIQUE INDEX uq_cities_code ON public.cities USING btree (code);

CREATE UNIQUE INDEX uq_cities_name_state ON public.cities USING btree (name, state);

CREATE UNIQUE INDEX uq_hirememos_no_fy ON public.hirememos USING btree (hire_memo_no, financial_year);

CREATE UNIQUE INDEX uq_invoices_no_fy ON public.invoices USING btree (invoice_no, financial_year);

CREATE UNIQUE INDEX uq_lrs_lr_number ON public.lrs USING btree (lr_number);

CREATE UNIQUE INDEX uq_vehicles_number ON public.vehicles USING btree (number);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX vehicle_locations_pkey ON public.vehicle_locations USING btree (id);

CREATE UNIQUE INDEX vehicles_pkey ON public.vehicles USING btree (id);

CREATE UNIQUE INDEX vendors_pkey ON public.vendors USING btree (id);

CREATE UNIQUE INDEX vouchers_pkey ON public.vouchers USING btree (id);

alter table "public"."alembic_version" add constraint "alembic_version_pkc" PRIMARY KEY using index "alembic_version_pkc";

alter table "public"."audit_log" add constraint "audit_log_pkey" PRIMARY KEY using index "audit_log_pkey";

alter table "public"."cities" add constraint "cities_pkey" PRIMARY KEY using index "cities_pkey";

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

alter table "public"."contracts" add constraint "contracts_pkey" PRIMARY KEY using index "contracts_pkey";

alter table "public"."eway_bills" add constraint "eway_bills_pkey" PRIMARY KEY using index "eway_bills_pkey";

alter table "public"."file_uploads" add constraint "file_uploads_pkey" PRIMARY KEY using index "file_uploads_pkey";

alter table "public"."hirememos" add constraint "hirememos_pkey" PRIMARY KEY using index "hirememos_pkey";

alter table "public"."invoice_lines" add constraint "invoice_lines_pkey" PRIMARY KEY using index "invoice_lines_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."lr_deductions" add constraint "lr_deductions_pkey" PRIMARY KEY using index "lr_deductions_pkey";

alter table "public"."lrs" add constraint "lrs_pkey" PRIMARY KEY using index "lrs_pkey";

alter table "public"."payment_receipts" add constraint "payment_receipts_pkey" PRIMARY KEY using index "payment_receipts_pkey";

alter table "public"."templates" add constraint "templates_pkey" PRIMARY KEY using index "templates_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."vehicle_locations" add constraint "vehicle_locations_pkey" PRIMARY KEY using index "vehicle_locations_pkey";

alter table "public"."vehicles" add constraint "vehicles_pkey" PRIMARY KEY using index "vehicles_pkey";

alter table "public"."vendors" add constraint "vendors_pkey" PRIMARY KEY using index "vendors_pkey";

alter table "public"."vouchers" add constraint "vouchers_pkey" PRIMARY KEY using index "vouchers_pkey";

alter table "public"."cities" add constraint "uq_cities_code" UNIQUE using index "uq_cities_code";

alter table "public"."cities" add constraint "uq_cities_name_state" UNIQUE using index "uq_cities_name_state";

alter table "public"."contracts" add constraint "contracts_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) not valid;

alter table "public"."contracts" validate constraint "contracts_client_id_fkey";

alter table "public"."eway_bills" add constraint "eway_bills_lr_id_fkey" FOREIGN KEY (lr_id) REFERENCES public.lrs(id) ON DELETE CASCADE not valid;

alter table "public"."eway_bills" validate constraint "eway_bills_lr_id_fkey";

alter table "public"."file_uploads" add constraint "file_uploads_hirememo_id_fkey" FOREIGN KEY (hirememo_id) REFERENCES public.hirememos(id) not valid;

alter table "public"."file_uploads" validate constraint "file_uploads_hirememo_id_fkey";

alter table "public"."file_uploads" add constraint "file_uploads_lr_id_fkey" FOREIGN KEY (lr_id) REFERENCES public.lrs(id) not valid;

alter table "public"."file_uploads" validate constraint "file_uploads_lr_id_fkey";

alter table "public"."hirememos" add constraint "hirememos_lr_id_fkey" FOREIGN KEY (lr_id) REFERENCES public.lrs(id) not valid;

alter table "public"."hirememos" validate constraint "hirememos_lr_id_fkey";

alter table "public"."hirememos" add constraint "hirememos_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) not valid;

alter table "public"."hirememos" validate constraint "hirememos_vehicle_id_fkey";

alter table "public"."hirememos" add constraint "uq_hirememos_no_fy" UNIQUE using index "uq_hirememos_no_fy";

alter table "public"."invoice_lines" add constraint "invoice_lines_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE not valid;

alter table "public"."invoice_lines" validate constraint "invoice_lines_invoice_id_fkey";

alter table "public"."invoice_lines" add constraint "invoice_lines_lr_id_fkey" FOREIGN KEY (lr_id) REFERENCES public.lrs(id) not valid;

alter table "public"."invoice_lines" validate constraint "invoice_lines_lr_id_fkey";

alter table "public"."invoices" add constraint "invoices_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) not valid;

alter table "public"."invoices" validate constraint "invoices_client_id_fkey";

alter table "public"."invoices" add constraint "uq_invoices_no_fy" UNIQUE using index "uq_invoices_no_fy";

alter table "public"."lr_deductions" add constraint "lr_deductions_lr_id_fkey" FOREIGN KEY (lr_id) REFERENCES public.lrs(id) ON DELETE CASCADE not valid;

alter table "public"."lr_deductions" validate constraint "lr_deductions_lr_id_fkey";

alter table "public"."lrs" add constraint "uq_lrs_lr_number" UNIQUE using index "uq_lrs_lr_number";

alter table "public"."payment_receipts" add constraint "payment_receipts_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL not valid;

alter table "public"."payment_receipts" validate constraint "payment_receipts_invoice_id_fkey";

alter table "public"."payment_receipts" add constraint "payment_receipts_received_from_id_fkey" FOREIGN KEY (received_from_id) REFERENCES public.clients(id) not valid;

alter table "public"."payment_receipts" validate constraint "payment_receipts_received_from_id_fkey";

alter table "public"."vehicle_locations" add constraint "vehicle_locations_lr_id_fkey" FOREIGN KEY (lr_id) REFERENCES public.lrs(id) not valid;

alter table "public"."vehicle_locations" validate constraint "vehicle_locations_lr_id_fkey";

alter table "public"."vehicles" add constraint "uq_vehicles_number" UNIQUE using index "uq_vehicles_number";

alter table "public"."vehicles" add constraint "vehicles_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.vendors(id) not valid;

alter table "public"."vehicles" validate constraint "vehicles_owner_id_fkey";

grant delete on table "public"."alembic_version" to "anon";

grant insert on table "public"."alembic_version" to "anon";

grant references on table "public"."alembic_version" to "anon";

grant select on table "public"."alembic_version" to "anon";

grant trigger on table "public"."alembic_version" to "anon";

grant truncate on table "public"."alembic_version" to "anon";

grant update on table "public"."alembic_version" to "anon";

grant delete on table "public"."alembic_version" to "authenticated";

grant insert on table "public"."alembic_version" to "authenticated";

grant references on table "public"."alembic_version" to "authenticated";

grant select on table "public"."alembic_version" to "authenticated";

grant trigger on table "public"."alembic_version" to "authenticated";

grant truncate on table "public"."alembic_version" to "authenticated";

grant update on table "public"."alembic_version" to "authenticated";

grant delete on table "public"."alembic_version" to "service_role";

grant insert on table "public"."alembic_version" to "service_role";

grant references on table "public"."alembic_version" to "service_role";

grant select on table "public"."alembic_version" to "service_role";

grant trigger on table "public"."alembic_version" to "service_role";

grant truncate on table "public"."alembic_version" to "service_role";

grant update on table "public"."alembic_version" to "service_role";

grant delete on table "public"."audit_log" to "anon";

grant insert on table "public"."audit_log" to "anon";

grant references on table "public"."audit_log" to "anon";

grant select on table "public"."audit_log" to "anon";

grant trigger on table "public"."audit_log" to "anon";

grant truncate on table "public"."audit_log" to "anon";

grant update on table "public"."audit_log" to "anon";

grant delete on table "public"."audit_log" to "authenticated";

grant insert on table "public"."audit_log" to "authenticated";

grant references on table "public"."audit_log" to "authenticated";

grant select on table "public"."audit_log" to "authenticated";

grant trigger on table "public"."audit_log" to "authenticated";

grant truncate on table "public"."audit_log" to "authenticated";

grant update on table "public"."audit_log" to "authenticated";

grant delete on table "public"."audit_log" to "service_role";

grant insert on table "public"."audit_log" to "service_role";

grant references on table "public"."audit_log" to "service_role";

grant select on table "public"."audit_log" to "service_role";

grant trigger on table "public"."audit_log" to "service_role";

grant truncate on table "public"."audit_log" to "service_role";

grant update on table "public"."audit_log" to "service_role";

grant delete on table "public"."cities" to "anon";

grant insert on table "public"."cities" to "anon";

grant references on table "public"."cities" to "anon";

grant select on table "public"."cities" to "anon";

grant trigger on table "public"."cities" to "anon";

grant truncate on table "public"."cities" to "anon";

grant update on table "public"."cities" to "anon";

grant delete on table "public"."cities" to "authenticated";

grant insert on table "public"."cities" to "authenticated";

grant references on table "public"."cities" to "authenticated";

grant select on table "public"."cities" to "authenticated";

grant trigger on table "public"."cities" to "authenticated";

grant truncate on table "public"."cities" to "authenticated";

grant update on table "public"."cities" to "authenticated";

grant delete on table "public"."cities" to "service_role";

grant insert on table "public"."cities" to "service_role";

grant references on table "public"."cities" to "service_role";

grant select on table "public"."cities" to "service_role";

grant trigger on table "public"."cities" to "service_role";

grant truncate on table "public"."cities" to "service_role";

grant update on table "public"."cities" to "service_role";

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."contracts" to "anon";

grant insert on table "public"."contracts" to "anon";

grant references on table "public"."contracts" to "anon";

grant select on table "public"."contracts" to "anon";

grant trigger on table "public"."contracts" to "anon";

grant truncate on table "public"."contracts" to "anon";

grant update on table "public"."contracts" to "anon";

grant delete on table "public"."contracts" to "authenticated";

grant insert on table "public"."contracts" to "authenticated";

grant references on table "public"."contracts" to "authenticated";

grant select on table "public"."contracts" to "authenticated";

grant trigger on table "public"."contracts" to "authenticated";

grant truncate on table "public"."contracts" to "authenticated";

grant update on table "public"."contracts" to "authenticated";

grant delete on table "public"."contracts" to "service_role";

grant insert on table "public"."contracts" to "service_role";

grant references on table "public"."contracts" to "service_role";

grant select on table "public"."contracts" to "service_role";

grant trigger on table "public"."contracts" to "service_role";

grant truncate on table "public"."contracts" to "service_role";

grant update on table "public"."contracts" to "service_role";

grant delete on table "public"."eway_bills" to "anon";

grant insert on table "public"."eway_bills" to "anon";

grant references on table "public"."eway_bills" to "anon";

grant select on table "public"."eway_bills" to "anon";

grant trigger on table "public"."eway_bills" to "anon";

grant truncate on table "public"."eway_bills" to "anon";

grant update on table "public"."eway_bills" to "anon";

grant delete on table "public"."eway_bills" to "authenticated";

grant insert on table "public"."eway_bills" to "authenticated";

grant references on table "public"."eway_bills" to "authenticated";

grant select on table "public"."eway_bills" to "authenticated";

grant trigger on table "public"."eway_bills" to "authenticated";

grant truncate on table "public"."eway_bills" to "authenticated";

grant update on table "public"."eway_bills" to "authenticated";

grant delete on table "public"."eway_bills" to "service_role";

grant insert on table "public"."eway_bills" to "service_role";

grant references on table "public"."eway_bills" to "service_role";

grant select on table "public"."eway_bills" to "service_role";

grant trigger on table "public"."eway_bills" to "service_role";

grant truncate on table "public"."eway_bills" to "service_role";

grant update on table "public"."eway_bills" to "service_role";

grant delete on table "public"."file_uploads" to "anon";

grant insert on table "public"."file_uploads" to "anon";

grant references on table "public"."file_uploads" to "anon";

grant select on table "public"."file_uploads" to "anon";

grant trigger on table "public"."file_uploads" to "anon";

grant truncate on table "public"."file_uploads" to "anon";

grant update on table "public"."file_uploads" to "anon";

grant delete on table "public"."file_uploads" to "authenticated";

grant insert on table "public"."file_uploads" to "authenticated";

grant references on table "public"."file_uploads" to "authenticated";

grant select on table "public"."file_uploads" to "authenticated";

grant trigger on table "public"."file_uploads" to "authenticated";

grant truncate on table "public"."file_uploads" to "authenticated";

grant update on table "public"."file_uploads" to "authenticated";

grant delete on table "public"."file_uploads" to "service_role";

grant insert on table "public"."file_uploads" to "service_role";

grant references on table "public"."file_uploads" to "service_role";

grant select on table "public"."file_uploads" to "service_role";

grant trigger on table "public"."file_uploads" to "service_role";

grant truncate on table "public"."file_uploads" to "service_role";

grant update on table "public"."file_uploads" to "service_role";

grant delete on table "public"."hirememos" to "anon";

grant insert on table "public"."hirememos" to "anon";

grant references on table "public"."hirememos" to "anon";

grant select on table "public"."hirememos" to "anon";

grant trigger on table "public"."hirememos" to "anon";

grant truncate on table "public"."hirememos" to "anon";

grant update on table "public"."hirememos" to "anon";

grant delete on table "public"."hirememos" to "authenticated";

grant insert on table "public"."hirememos" to "authenticated";

grant references on table "public"."hirememos" to "authenticated";

grant select on table "public"."hirememos" to "authenticated";

grant trigger on table "public"."hirememos" to "authenticated";

grant truncate on table "public"."hirememos" to "authenticated";

grant update on table "public"."hirememos" to "authenticated";

grant delete on table "public"."hirememos" to "service_role";

grant insert on table "public"."hirememos" to "service_role";

grant references on table "public"."hirememos" to "service_role";

grant select on table "public"."hirememos" to "service_role";

grant trigger on table "public"."hirememos" to "service_role";

grant truncate on table "public"."hirememos" to "service_role";

grant update on table "public"."hirememos" to "service_role";

grant delete on table "public"."invoice_lines" to "anon";

grant insert on table "public"."invoice_lines" to "anon";

grant references on table "public"."invoice_lines" to "anon";

grant select on table "public"."invoice_lines" to "anon";

grant trigger on table "public"."invoice_lines" to "anon";

grant truncate on table "public"."invoice_lines" to "anon";

grant update on table "public"."invoice_lines" to "anon";

grant delete on table "public"."invoice_lines" to "authenticated";

grant insert on table "public"."invoice_lines" to "authenticated";

grant references on table "public"."invoice_lines" to "authenticated";

grant select on table "public"."invoice_lines" to "authenticated";

grant trigger on table "public"."invoice_lines" to "authenticated";

grant truncate on table "public"."invoice_lines" to "authenticated";

grant update on table "public"."invoice_lines" to "authenticated";

grant delete on table "public"."invoice_lines" to "service_role";

grant insert on table "public"."invoice_lines" to "service_role";

grant references on table "public"."invoice_lines" to "service_role";

grant select on table "public"."invoice_lines" to "service_role";

grant trigger on table "public"."invoice_lines" to "service_role";

grant truncate on table "public"."invoice_lines" to "service_role";

grant update on table "public"."invoice_lines" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."lr_deductions" to "anon";

grant insert on table "public"."lr_deductions" to "anon";

grant references on table "public"."lr_deductions" to "anon";

grant select on table "public"."lr_deductions" to "anon";

grant trigger on table "public"."lr_deductions" to "anon";

grant truncate on table "public"."lr_deductions" to "anon";

grant update on table "public"."lr_deductions" to "anon";

grant delete on table "public"."lr_deductions" to "authenticated";

grant insert on table "public"."lr_deductions" to "authenticated";

grant references on table "public"."lr_deductions" to "authenticated";

grant select on table "public"."lr_deductions" to "authenticated";

grant trigger on table "public"."lr_deductions" to "authenticated";

grant truncate on table "public"."lr_deductions" to "authenticated";

grant update on table "public"."lr_deductions" to "authenticated";

grant delete on table "public"."lr_deductions" to "service_role";

grant insert on table "public"."lr_deductions" to "service_role";

grant references on table "public"."lr_deductions" to "service_role";

grant select on table "public"."lr_deductions" to "service_role";

grant trigger on table "public"."lr_deductions" to "service_role";

grant truncate on table "public"."lr_deductions" to "service_role";

grant update on table "public"."lr_deductions" to "service_role";

grant delete on table "public"."lrs" to "anon";

grant insert on table "public"."lrs" to "anon";

grant references on table "public"."lrs" to "anon";

grant select on table "public"."lrs" to "anon";

grant trigger on table "public"."lrs" to "anon";

grant truncate on table "public"."lrs" to "anon";

grant update on table "public"."lrs" to "anon";

grant delete on table "public"."lrs" to "authenticated";

grant insert on table "public"."lrs" to "authenticated";

grant references on table "public"."lrs" to "authenticated";

grant select on table "public"."lrs" to "authenticated";

grant trigger on table "public"."lrs" to "authenticated";

grant truncate on table "public"."lrs" to "authenticated";

grant update on table "public"."lrs" to "authenticated";

grant delete on table "public"."lrs" to "service_role";

grant insert on table "public"."lrs" to "service_role";

grant references on table "public"."lrs" to "service_role";

grant select on table "public"."lrs" to "service_role";

grant trigger on table "public"."lrs" to "service_role";

grant truncate on table "public"."lrs" to "service_role";

grant update on table "public"."lrs" to "service_role";

grant delete on table "public"."payment_receipts" to "anon";

grant insert on table "public"."payment_receipts" to "anon";

grant references on table "public"."payment_receipts" to "anon";

grant select on table "public"."payment_receipts" to "anon";

grant trigger on table "public"."payment_receipts" to "anon";

grant truncate on table "public"."payment_receipts" to "anon";

grant update on table "public"."payment_receipts" to "anon";

grant delete on table "public"."payment_receipts" to "authenticated";

grant insert on table "public"."payment_receipts" to "authenticated";

grant references on table "public"."payment_receipts" to "authenticated";

grant select on table "public"."payment_receipts" to "authenticated";

grant trigger on table "public"."payment_receipts" to "authenticated";

grant truncate on table "public"."payment_receipts" to "authenticated";

grant update on table "public"."payment_receipts" to "authenticated";

grant delete on table "public"."payment_receipts" to "service_role";

grant insert on table "public"."payment_receipts" to "service_role";

grant references on table "public"."payment_receipts" to "service_role";

grant select on table "public"."payment_receipts" to "service_role";

grant trigger on table "public"."payment_receipts" to "service_role";

grant truncate on table "public"."payment_receipts" to "service_role";

grant update on table "public"."payment_receipts" to "service_role";

grant delete on table "public"."templates" to "anon";

grant insert on table "public"."templates" to "anon";

grant references on table "public"."templates" to "anon";

grant select on table "public"."templates" to "anon";

grant trigger on table "public"."templates" to "anon";

grant truncate on table "public"."templates" to "anon";

grant update on table "public"."templates" to "anon";

grant delete on table "public"."templates" to "authenticated";

grant insert on table "public"."templates" to "authenticated";

grant references on table "public"."templates" to "authenticated";

grant select on table "public"."templates" to "authenticated";

grant trigger on table "public"."templates" to "authenticated";

grant truncate on table "public"."templates" to "authenticated";

grant update on table "public"."templates" to "authenticated";

grant delete on table "public"."templates" to "service_role";

grant insert on table "public"."templates" to "service_role";

grant references on table "public"."templates" to "service_role";

grant select on table "public"."templates" to "service_role";

grant trigger on table "public"."templates" to "service_role";

grant truncate on table "public"."templates" to "service_role";

grant update on table "public"."templates" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."vehicle_locations" to "anon";

grant insert on table "public"."vehicle_locations" to "anon";

grant references on table "public"."vehicle_locations" to "anon";

grant select on table "public"."vehicle_locations" to "anon";

grant trigger on table "public"."vehicle_locations" to "anon";

grant truncate on table "public"."vehicle_locations" to "anon";

grant update on table "public"."vehicle_locations" to "anon";

grant delete on table "public"."vehicle_locations" to "authenticated";

grant insert on table "public"."vehicle_locations" to "authenticated";

grant references on table "public"."vehicle_locations" to "authenticated";

grant select on table "public"."vehicle_locations" to "authenticated";

grant trigger on table "public"."vehicle_locations" to "authenticated";

grant truncate on table "public"."vehicle_locations" to "authenticated";

grant update on table "public"."vehicle_locations" to "authenticated";

grant delete on table "public"."vehicle_locations" to "service_role";

grant insert on table "public"."vehicle_locations" to "service_role";

grant references on table "public"."vehicle_locations" to "service_role";

grant select on table "public"."vehicle_locations" to "service_role";

grant trigger on table "public"."vehicle_locations" to "service_role";

grant truncate on table "public"."vehicle_locations" to "service_role";

grant update on table "public"."vehicle_locations" to "service_role";

grant delete on table "public"."vehicles" to "anon";

grant insert on table "public"."vehicles" to "anon";

grant references on table "public"."vehicles" to "anon";

grant select on table "public"."vehicles" to "anon";

grant trigger on table "public"."vehicles" to "anon";

grant truncate on table "public"."vehicles" to "anon";

grant update on table "public"."vehicles" to "anon";

grant delete on table "public"."vehicles" to "authenticated";

grant insert on table "public"."vehicles" to "authenticated";

grant references on table "public"."vehicles" to "authenticated";

grant select on table "public"."vehicles" to "authenticated";

grant trigger on table "public"."vehicles" to "authenticated";

grant truncate on table "public"."vehicles" to "authenticated";

grant update on table "public"."vehicles" to "authenticated";

grant delete on table "public"."vehicles" to "service_role";

grant insert on table "public"."vehicles" to "service_role";

grant references on table "public"."vehicles" to "service_role";

grant select on table "public"."vehicles" to "service_role";

grant trigger on table "public"."vehicles" to "service_role";

grant truncate on table "public"."vehicles" to "service_role";

grant update on table "public"."vehicles" to "service_role";

grant delete on table "public"."vendors" to "anon";

grant insert on table "public"."vendors" to "anon";

grant references on table "public"."vendors" to "anon";

grant select on table "public"."vendors" to "anon";

grant trigger on table "public"."vendors" to "anon";

grant truncate on table "public"."vendors" to "anon";

grant update on table "public"."vendors" to "anon";

grant delete on table "public"."vendors" to "authenticated";

grant insert on table "public"."vendors" to "authenticated";

grant references on table "public"."vendors" to "authenticated";

grant select on table "public"."vendors" to "authenticated";

grant trigger on table "public"."vendors" to "authenticated";

grant truncate on table "public"."vendors" to "authenticated";

grant update on table "public"."vendors" to "authenticated";

grant delete on table "public"."vendors" to "service_role";

grant insert on table "public"."vendors" to "service_role";

grant references on table "public"."vendors" to "service_role";

grant select on table "public"."vendors" to "service_role";

grant trigger on table "public"."vendors" to "service_role";

grant truncate on table "public"."vendors" to "service_role";

grant update on table "public"."vendors" to "service_role";

grant delete on table "public"."vouchers" to "anon";

grant insert on table "public"."vouchers" to "anon";

grant references on table "public"."vouchers" to "anon";

grant select on table "public"."vouchers" to "anon";

grant trigger on table "public"."vouchers" to "anon";

grant truncate on table "public"."vouchers" to "anon";

grant update on table "public"."vouchers" to "anon";

grant delete on table "public"."vouchers" to "authenticated";

grant insert on table "public"."vouchers" to "authenticated";

grant references on table "public"."vouchers" to "authenticated";

grant select on table "public"."vouchers" to "authenticated";

grant trigger on table "public"."vouchers" to "authenticated";

grant truncate on table "public"."vouchers" to "authenticated";

grant update on table "public"."vouchers" to "authenticated";

grant delete on table "public"."vouchers" to "service_role";

grant insert on table "public"."vouchers" to "service_role";

grant references on table "public"."vouchers" to "service_role";

grant select on table "public"."vouchers" to "service_role";

grant trigger on table "public"."vouchers" to "service_role";

grant truncate on table "public"."vouchers" to "service_role";

grant update on table "public"."vouchers" to "service_role";


