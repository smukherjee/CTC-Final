SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 85e91yhSmuCz3uJDFVK6uS8vdfv1bVMkdIx5XrSwz352Zgp0HUfy7eGVaSBNblD

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."alembic_version" ("version_num") VALUES
	('0004_drop_vendor_gstin_if_exists');


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."audit_log" ("id", "entity_type", "entity_id", "action", "user_id", "user_name", "before_data", "after_data", "created_at") VALUES
-- 	(1, 'LR', 16, 'CREATE', NULL, NULL, 'null', '{"id": 16.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 4.01, "origin": "BANGALORE", "status": "DRAFT", "weight": 101.0, "cm_date": null, "pod_url": null, "remarks": null, "through": "Vendor Seed 01", "value_rs": 1.01, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779511707362", "surcharge": 1.0, "deductions": null, "eway_bills": [], "st_charges": 1.0, "through_id": 1.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "CHENNAI", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": 1.0, "freight_p": 1.0, "weight_kg": 1.0, "freight_rs": 1.0, "weight_qtl": 1.0, "description": 1.0, "rate_per_qtl": 1.0, "articles_count": 1.0}], "pod_file_id": null, "seal_number": 1111111.0, "consignee_id": 1.0, "consignor_id": 1.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 1111.0, "fob_client_id": 2.0, "lr_deductions": [], "articles_count": 1.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY", "financial_year": "2026-27", "freight_amount": 1.01, "hamali_charges": 1.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "2026-05-23", "in_time": "10:19", "out_date": "2026-05-23", "out_time": "10:19"}, "articles_description": 1.0, "booked_on_owners_risk": 0.0}', '2026-05-23 04:49:30.740806+00'),
-- 	(2, 'LR', 16, 'UPDATE', NULL, NULL, '{"id": 16.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 4.01, "origin": "BANGALORE", "status": "DRAFT", "weight": 101.0, "cm_date": null, "pod_url": null, "remarks": null, "through": "Vendor Seed 01", "value_rs": 1.01, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779511707362", "surcharge": 1.0, "deductions": null, "eway_bills": [], "st_charges": 1.0, "through_id": 1.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "CHENNAI", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": 1.0, "freight_p": 1.0, "weight_kg": 1.0, "freight_rs": 1.0, "weight_qtl": 1.0, "description": 1.0, "rate_per_qtl": 1.0, "articles_count": 1.0}], "pod_file_id": null, "seal_number": 1111111.0, "consignee_id": 1.0, "consignor_id": 1.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 1111.0, "fob_client_id": 2.0, "lr_deductions": [], "articles_count": 1.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY", "financial_year": "2026-27", "freight_amount": 1.01, "hamali_charges": 1.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "2026-05-23", "in_time": "10:19", "out_date": "2026-05-23", "out_time": "10:19"}, "articles_description": 1.0, "booked_on_owners_risk": 0.0}', '{"id": 16.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 4.01, "origin": "BANGALORE", "status": "DRAFT", "weight": 101.0, "cm_date": null, "pod_url": null, "remarks": null, "through": "Vendor Seed 01", "value_rs": 1.01, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779511707362", "surcharge": 1.0, "deductions": null, "eway_bills": [], "st_charges": 1.0, "through_id": 1.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "CHENNAI", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": 1.0, "freight_p": 1.0, "weight_kg": 1.0, "freight_rs": 1.0, "weight_qtl": 1.0, "description": 1.0, "rate_per_qtl": 1.0, "articles_count": 1.0}], "pod_file_id": null, "seal_number": 1111111.0, "consignee_id": 1.0, "consignor_id": 1.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 1111.0, "fob_client_id": 2.0, "lr_deductions": [], "articles_count": 1.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY", "financial_year": "2026-27", "freight_amount": 1.01, "hamali_charges": 1.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "2026-05-23", "in_time": "10:19", "out_date": "2026-05-23", "out_time": "10:19"}, "articles_description": 1.0, "booked_on_owners_risk": 0.0}', '2026-05-23 04:50:17.741681+00'),
-- 	(3, 'HireMemo', 14, 'CREATE', NULL, NULL, 'null', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 04:50:52.23381+00'),
-- 	(4, 'HireMemo', 14, 'UPDATE', NULL, NULL, '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 04:56:17.340103+00'),
-- 	(5, 'HireMemo', 14, 'UPDATE', NULL, NULL, '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 04:57:27.781201+00'),
-- 	(6, 'LR', 16, 'UPDATE', NULL, NULL, '{"id": 16.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 4.01, "origin": "BANGALORE", "status": "POD_UPLOADED", "weight": 101.0, "cm_date": null, "pod_url": "/api/files/13/content", "remarks": null, "through": "Vendor Seed 01", "value_rs": 1.01, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779511707362", "surcharge": 1.0, "deductions": null, "eway_bills": [], "st_charges": 1.0, "through_id": 1.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "CHENNAI", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": 1.0, "freight_p": 1.0, "weight_kg": 1.0, "freight_rs": 1.0, "weight_qtl": 1.0, "description": 1.0, "rate_per_qtl": 1.0, "articles_count": 1.0}], "pod_file_id": null, "seal_number": 1111111.0, "consignee_id": 1.0, "consignor_id": 1.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 1111.0, "fob_client_id": 2.0, "lr_deductions": [], "articles_count": 1.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY", "financial_year": "2026-27", "freight_amount": 1.01, "hamali_charges": 1.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "2026-05-23", "in_time": "10:19", "out_date": "2026-05-23", "out_time": "10:19"}, "articles_description": 1.0, "booked_on_owners_risk": 0.0}', '{"id": 16.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 4.01, "origin": "BANGALORE", "status": "DRAFT", "weight": 101.0, "cm_date": null, "pod_url": "/api/files/13/content", "remarks": null, "through": "Vendor Seed 01", "value_rs": 1.01, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779511707362", "surcharge": 1.0, "deductions": null, "eway_bills": [], "st_charges": 1.0, "through_id": 1.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "CHENNAI", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": 1.0, "freight_p": 1.0, "weight_kg": 1.0, "freight_rs": 1.0, "weight_qtl": 1.0, "description": 1.0, "rate_per_qtl": 1.0, "articles_count": 1.0}], "pod_file_id": null, "seal_number": 1111111.0, "consignee_id": 1.0, "consignor_id": 1.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 1111.0, "fob_client_id": 2.0, "lr_deductions": [], "articles_count": 1.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY", "financial_year": "2026-27", "freight_amount": 1.01, "hamali_charges": 1.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "2026-05-23", "in_time": "10:19", "out_date": "2026-05-23", "out_time": "10:19"}, "articles_description": 1.0, "booked_on_owners_risk": 0.0}', '2026-05-23 04:58:39.074536+00'),
-- 	(7, 'HireMemo', 14, 'UPDATE', NULL, NULL, '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 04:59:06.13081+00'),
-- 	(8, 'HireMemo', 14, 'UPDATE', NULL, NULL, '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": null, "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 05:00:37.3939+00'),
-- 	(12, 'Invoice', 12, 'CREATE', NULL, NULL, 'null', '{"id": 12.0, "lines": [], "po_no": null, "edited": 0.0, "status": "draft", "po_date": null, "hsn_code": 996791.0, "client_id": 2.0, "edited_at": null, "edited_by": null, "invoice_no": "1/26-27", "net_amount": 4.01, "tds_amount": 0.0, "gst_paid_by": null, "gross_amount": 4.01, "invoice_date": "2026-05-23", "total_amount": 4.01, "financial_year": "2026-27", "reverse_charge": 0.0, "amount_received": 0.0, "outstanding_amount": 4.01, "tax_on_reverse_charge": 0.0}', '2026-05-23 05:01:54.23532+00'),
-- 	(13, 'PaymentReceipt', 10, 'CREATE', NULL, NULL, 'null', '{"id": 10.0, "notes": null, "amount": 4.01, "created_at": "2026-05-23T05:02:12.454702+00:00", "invoice_id": 12.0, "net_amount": 4.01, "payment_date": "2026-05-23", "payment_mode": "BANK", "received_from": "HAVELLS INDIA LTD, SRICITY Dispatch", "financial_year": "2026-27", "received_from_id": 2.0}', '2026-05-23 05:02:12.454702+00'),
-- 	(9, 'HireMemo', 14, 'UPDATE', NULL, NULL, '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": null, "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 05:00:37.397307+00'),
-- 	(10, 'HireMemo', 14, 'UPDATE', NULL, NULL, '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": null, "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 05:00:37.397031+00'),
-- 	(11, 'HireMemo', 14, 'PRINT', NULL, 'system', 'null', '{"id": 14.0, "lr_id": 16.0, "balance": 1.0, "ack_status": "PENDING", "commission": 0.0, "print_type": "HIRE_MEMO", "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 1.0, "total_amount": 1.0, "financial_year": "2026-27", "hire_memo_date": null, "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 05:00:46.641103+00'),
-- 	(14, 'LR', 17, 'CREATE', NULL, NULL, 'null', '{"id": 17.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 232.3, "origin": "CHENNAI", "status": "DRAFT", "weight": 2323.0, "cm_date": null, "pod_url": null, "remarks": null, "through": "Vendor Seed 02", "value_rs": 232.3, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779512620401", "surcharge": 0.0, "deductions": null, "eway_bills": [], "st_charges": 0.0, "through_id": 2.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "BANGALORE", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": "test", "freight_p": 30.0, "weight_kg": 23.0, "freight_rs": 232.0, "weight_qtl": 23.0, "description": "test", "rate_per_qtl": 10.0, "articles_count": 12222.0}], "pod_file_id": null, "seal_number": 234124.0, "consignee_id": 1.0, "consignor_id": 2.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 124.0, "fob_client_id": 1.0, "lr_deductions": [], "articles_count": 12222.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY Dispatch", "financial_year": "2026-27", "freight_amount": 232.3, "hamali_charges": 0.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "", "in_time": "", "out_date": "", "out_time": ""}, "articles_description": "test", "booked_on_owners_risk": 0.0}', '2026-05-23 05:04:36.270661+00'),
-- 	(15, 'LR', 17, 'UPDATE', NULL, NULL, '{"id": 17.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 232.3, "origin": "CHENNAI", "status": "DRAFT", "weight": 2323.0, "cm_date": null, "pod_url": null, "remarks": null, "through": "Vendor Seed 02", "value_rs": 232.3, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779512620401", "surcharge": 0.0, "deductions": null, "eway_bills": [], "st_charges": 0.0, "through_id": 2.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "BANGALORE", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": "test", "freight_p": 30.0, "weight_kg": 23.0, "freight_rs": 232.0, "weight_qtl": 23.0, "description": "test", "rate_per_qtl": 10.0, "articles_count": 12222.0}], "pod_file_id": null, "seal_number": 234124.0, "consignee_id": 1.0, "consignor_id": 2.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 124.0, "fob_client_id": 1.0, "lr_deductions": [], "articles_count": 12222.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY Dispatch", "financial_year": "2026-27", "freight_amount": 232.3, "hamali_charges": 0.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "", "in_time": "", "out_date": "", "out_time": ""}, "articles_description": "test", "booked_on_owners_risk": 0.0}', '{"id": 17.0, "fob": null, "date": "2026-05-23", "cm_no": null, "total": 232.3, "origin": "CHENNAI", "status": "DRAFT", "weight": 2323.0, "cm_date": null, "pod_url": null, "remarks": null, "through": "Vendor Seed 02", "value_rs": 232.3, "bill_date": null, "eway_bill": null, "lr_number": "LR-1779512620401", "surcharge": 0.0, "deductions": null, "eway_bills": [], "st_charges": 0.0, "through_id": 2.0, "vehicle_id": 1.0, "bill_number": null, "delivery_at": "", "destination": "BANGALORE", "driver_name": null, "goods_items": [{"id": 1.0, "remarks": "test", "freight_p": 30.0, "weight_kg": 23.0, "freight_rs": 232.0, "weight_qtl": 23.0, "description": "test", "rate_per_qtl": 10.0, "articles_count": 12222.0}], "pod_file_id": null, "seal_number": 234124.0, "consignee_id": 1.0, "consignor_id": 2.0, "eway_bill_no": null, "pod_received": 0.0, "vehicle_type": "TRUCK", "amount_passed": null, "driver_mobile": 124.0, "fob_client_id": 1.0, "lr_deductions": [], "articles_count": 12222.0, "consignee_name": "HAVELLS INDIA LTD, SRICITY", "consignor_name": "HAVELLS INDIA LTD, SRICITY Dispatch", "financial_year": "2026-27", "freight_amount": 232.3, "hamali_charges": 0.0, "vehicle_number": "AP39TA1001", "pod_verified_at": null, "eway_bill_expiry": null, "loading_point_times": {"in_date": "2026-05-23", "in_time": "10:36", "out_date": "2026-05-23", "out_time": "10:38"}, "articles_description": "test", "booked_on_owners_risk": 0.0}', '2026-05-23 05:06:31.400047+00'),
-- 	(16, 'HireMemo', 15, 'CREATE', NULL, NULL, 'null', '{"id": 15.0, "lr_id": 17.0, "balance": 0.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 2.0, "total_amount": 0.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 05:10:38.316631+00'),
-- 	(17, 'HireMemo', 15, 'UPDATE', NULL, NULL, '{"id": 15.0, "lr_id": 17.0, "balance": 0.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 2.0, "total_amount": 0.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 15.0, "lr_id": 17.0, "balance": 0.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 2.0, "total_amount": 0.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 05:11:05.369774+00'),
-- 	(18, 'HireMemo', 15, 'UPDATE', NULL, NULL, '{"id": 15.0, "lr_id": 17.0, "balance": 0.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 0.0, "advance_cash": 0.0, "hire_memo_no": 2.0, "total_amount": 0.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '{"id": 15.0, "lr_id": 17.0, "balance": 0.0, "ack_status": "PENDING", "commission": 0.0, "advance_bank": 100.0, "advance_cash": 200.0, "hire_memo_no": 2.0, "total_amount": 300.0, "financial_year": "2026-27", "hire_memo_date": "2026-05-23", "vehicle_number": "AP39TA1001", "other_deductions": 0.0}', '2026-05-23 05:23:26.870124+00');


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cities" ("id", "name", "state", "code", "created_at", "updated_at") VALUES
	(1, 'SRICITY', 'Andhra Pradesh', 'SRI', '2026-05-23 04:44:14.12355+00', NULL),
	(2, 'CHENNAI', 'Tamil Nadu', 'CHE', '2026-05-23 04:44:14.12355+00', NULL),
	(3, 'BANGALORE', 'Karnataka', 'BLR', '2026-05-23 04:44:14.12355+00', NULL),
	(4, 'HYDERABAD', 'Telangana', 'HYD', '2026-05-23 04:44:14.12355+00', NULL),
	(5, 'MUMBAI', 'Maharashtra', 'BOM', '2026-05-23 04:44:14.12355+00', NULL),
	(6, 'DELHI', 'Delhi', 'DEL', '2026-05-23 04:44:14.12355+00', NULL),
	(7, 'PUNE', 'Maharashtra', 'PNQ', '2026-05-23 04:44:14.12355+00', NULL),
	(8, 'BHIWANDI', 'Maharashtra', 'BHI', '2026-05-23 04:44:14.12355+00', NULL),
	(9, 'KANNUR', 'Kerala', 'KNN', '2026-05-23 04:44:14.12355+00', NULL),
	(10, 'Bengaluru', 'Karnataka', 'BEN', '2026-05-23 04:44:14.12355+00', NULL),
	(11, 'Ahmedabad', 'Gujarat', 'AHM', '2026-05-23 04:44:14.12355+00', NULL),
	(12, 'Jaipur', 'Rajasthan', 'JAI', '2026-05-23 04:44:14.12355+00', NULL),
	(13, 'Kolkata', 'West Bengal', 'KOL', '2026-05-23 04:44:14.12355+00', NULL),
	(14, 'Bhubaneswar', 'Odisha', 'BHU', '2026-05-23 04:44:14.12355+00', NULL),
	(15, 'Kochi', 'Kerala', 'KOC', '2026-05-23 04:44:14.12355+00', NULL),
	(16, 'Coimbatore', 'Tamil Nadu', 'COI', '2026-05-23 04:44:14.12355+00', NULL),
	(17, 'Lucknow', 'Uttar Pradesh', 'LUC', '2026-05-23 04:44:14.12355+00', NULL),
	(18, 'Kanpur', 'Uttar Pradesh', 'KAN', '2026-05-23 04:44:14.12355+00', NULL),
	(19, 'Indore', 'Madhya Pradesh', 'IND', '2026-05-23 04:44:14.12355+00', NULL),
	(20, 'Bhopal', 'Madhya Pradesh', 'BHO', '2026-05-23 04:44:14.12355+00', NULL),
	(21, 'Patna', 'Bihar', 'PAT', '2026-05-23 04:44:14.12355+00', NULL),
	(22, 'Ranchi', 'Jharkhand', 'RAN', '2026-05-23 04:44:14.12355+00', NULL),
	(23, 'Guwahati', 'Assam', 'GUW', '2026-05-23 04:44:14.12355+00', NULL),
	(24, 'Shillong', 'Meghalaya', 'SHI', '2026-05-23 04:44:14.12355+00', NULL),
	(25, 'Chandigarh', 'Punjab', 'CHA', '2026-05-23 04:44:14.12355+00', NULL),
	(26, 'Ludhiana', 'Punjab', 'LUD', '2026-05-23 04:44:14.12355+00', NULL),
	(27, 'Nagpur', 'Maharashtra', 'NAG', '2026-05-23 04:44:14.12355+00', NULL),
	(28, 'Raipur', 'Chhattisgarh', 'RAI', '2026-05-23 04:44:14.12355+00', NULL),
	(29, 'Surat', 'Gujarat', 'SUR', '2026-05-23 04:44:14.12355+00', NULL),
	(30, 'Vadodara', 'Gujarat', 'VAD', '2026-05-23 04:44:14.12355+00', NULL),
	(31, 'Visakhapatnam', 'Andhra Pradesh', 'VIS', '2026-05-23 04:44:14.12355+00', NULL),
	(32, 'Vijayawada', 'Andhra Pradesh', 'VIJ', '2026-05-23 04:44:14.12355+00', NULL);


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."clients" ("id", "name", "type", "gstin", "mobile", "address", "tds_rate") VALUES
	(2, 'HAVELLS INDIA LTD, SRICITY Dispatch', 'consignor', NULL, NULL, NULL, 2.00),
	(1, 'HAVELLS INDIA LTD, SRICITY', 'both', NULL, NULL, NULL, 2.00),
	(4, 'SURYA ELECTRICALS, CHENNAI Dispatch', 'consignor', NULL, NULL, NULL, 2.00),
	(3, 'SURYA ELECTRICALS, CHENNAI', 'both', NULL, NULL, NULL, 2.00),
	(6, 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', 'consignor', NULL, NULL, NULL, 2.00),
	(5, 'FLYJAC LOGISTICS P LTD, CHENNAI', 'both', NULL, NULL, NULL, 2.00),
	(7, 'FLIPKART INDIA P LTD', 'customer', NULL, NULL, NULL, 2.00),
	(8, 'INSTAKART SERVICES P LTD', 'customer', NULL, NULL, NULL, 2.00);


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contracts" ("id", "name", "client_id", "start_date", "end_date", "expiry_alert_days", "notes", "created_at", "updated_at") VALUES
	(1, 'SEED-CONTRACT-001', 1, '2025-01-20', '2025-05-04', 30, '[SEED15] Contract for HAVELLS INDIA LTD, SRICITY', '2026-05-23 04:44:14.12355+00', NULL),
	(2, 'SEED-CONTRACT-002', 3, '2025-02-09', '2025-05-23', 30, '[SEED15] Contract for SURYA ELECTRICALS, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(3, 'SEED-CONTRACT-003', 3, '2025-01-31', '2025-05-13', 30, '[SEED15] Contract for SURYA ELECTRICALS, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(4, 'SEED-CONTRACT-004', 5, '2025-03-16', '2025-06-25', 30, '[SEED15] Contract for FLYJAC LOGISTICS P LTD, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(5, 'SEED-CONTRACT-005', 5, '2025-04-02', '2025-07-11', 30, '[SEED15] Contract for FLYJAC LOGISTICS P LTD, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(6, 'SEED-CONTRACT-006', 5, '2025-05-17', '2025-08-24', 30, '[SEED15] Contract for FLYJAC LOGISTICS P LTD, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(7, 'SEED-CONTRACT-007', 1, '2025-06-11', '2025-09-17', 30, '[SEED15] Contract for HAVELLS INDIA LTD, SRICITY', '2026-05-23 04:44:14.12355+00', NULL),
	(8, 'SEED-CONTRACT-008', 3, '2025-07-05', '2025-10-10', 30, '[SEED15] Contract for SURYA ELECTRICALS, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(9, 'SEED-CONTRACT-009', 3, '2025-08-20', '2025-11-24', 30, '[SEED15] Contract for SURYA ELECTRICALS, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(10, 'SEED-CONTRACT-010', 5, '2024-01-13', '2024-04-17', 30, '[SEED15] Contract for FLYJAC LOGISTICS P LTD, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(11, 'SEED-CONTRACT-011', 5, '2024-04-23', '2024-07-26', 30, '[SEED15] Contract for FLYJAC LOGISTICS P LTD, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(12, 'SEED-CONTRACT-012', 5, '2024-10-01', '2025-01-02', 30, '[SEED15] Contract for FLYJAC LOGISTICS P LTD, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(13, 'SEED-CONTRACT-013', 1, '2023-05-12', '2023-08-12', 30, '[SEED15] Contract for HAVELLS INDIA LTD, SRICITY', '2026-05-23 04:44:14.12355+00', NULL),
	(14, 'SEED-CONTRACT-014', 3, '2022-08-21', '2022-11-20', 30, '[SEED15] Contract for SURYA ELECTRICALS, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL),
	(15, 'SEED-CONTRACT-015', 3, '2025-11-22', '2026-02-20', 30, '[SEED15] Contract for SURYA ELECTRICALS, CHENNAI', '2026-05-23 04:44:14.12355+00', NULL);


--
-- Data for Name: lrs; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."lrs" ("id", "lr_number", "date", "consignor_id", "consignor_name", "consignee_id", "consignee_name", "origin", "destination", "delivery_at", "through_id", "through", "fob", "fob_client_id", "goods_items", "articles_count", "articles_description", "weight", "freight_amount", "vehicle_id", "vehicle_number", "vehicle_type", "seal_number", "driver_name", "driver_mobile", "booked_on_owners_risk", "loading_point_times", "value_rs", "surcharge", "hamali_charges", "st_charges", "total", "bill_number", "bill_date", "amount_passed", "deductions", "cm_no", "cm_date", "remarks", "pod_url", "pod_verified_at", "pod_received", "pod_file_id", "eway_bill_no", "eway_bill_expiry", "status", "financial_year", "created_at", "updated_at") VALUES
-- 	(1, 'SEEDLR-001-SAMPLE-001', '2025-04-20', '2', 'HAVELLS INDIA LTD, SRICITY Dispatch', '1', 'HAVELLS INDIA LTD, SRICITY', 'Sricity', 'Chennai', 'Chennai', NULL, 'Road', 'PAID', 1, '[{"id": "1", "freight_p": 0, "weight_kg": 50, "freight_rs": 1020, "weight_qtl": 8, "description": "Electronic Components", "rate_per_qtl": 120, "articles_count": 5}, {"id": "2", "freight_p": 0, "weight_kg": 20, "freight_rs": 420, "weight_qtl": 4, "description": "Hardware Parts", "rate_per_qtl": 100, "articles_count": 3}]', 8, 'Electronic Components', 1270.00, 1440.00, 1, 'AP39TA1001', 'TRUCK', 'SEAL0001', 'Driver 01', '9000000001', false, '{"in_date": "2025-04-20", "in_time": "08:00", "out_date": "2025-04-20", "out_time": "11:30"}', 1944.00, 100.00, 75.00, 25.00, 1640.00, 'SEED-BILL-001', '2025-04-28', 207500.00, 'NIL', '9583', '2025-06-30', '[SEED15] paid_billed_verified', '/api/files/1/content', '2026-05-22 04:44:14.248432+00', true, 1, 'EWBSEED00001', '2025-05-01 00:00:00+00', 'BILLED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(2, 'SEEDLR-002-47378', '2025-05-10', '4', 'SURYA ELECTRICALS, CHENNAI Dispatch', '3', 'SURYA ELECTRICALS, CHENNAI', 'Chennai', 'Hyderabad', 'Hyderabad', NULL, 'Road', 'PAID', 3, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1200, "weight_qtl": 15, "description": "FMCG Goods", "rate_per_qtl": 80, "articles_count": 10}, {"id": "2", "freight_p": 0, "weight_kg": 60, "freight_rs": 540, "weight_qtl": 3, "description": "Pharmaceutical Items", "rate_per_qtl": 150, "articles_count": 4}]', 14, 'FMCG Goods', 1860.00, 1740.00, 2, 'TN01AB2002', 'TRUCK', 'SEAL0002', 'Driver 02', '9000000002', true, '{"in_date": "2025-05-10", "in_time": "08:00", "out_date": "2025-05-10", "out_time": "11:30"}', 2349.00, 100.00, 75.00, 25.00, 1940.00, 'SEED-BILL-002', '2025-07-24', 1044.00, 'NIL', 'CM0002', '2025-08-03', '[SEED15] partial_collection', '/api/files/2/content', '2026-05-22 04:44:14.30656+00', true, 2, 'EWBSEED00002', '2025-05-21 00:00:00+00', 'BILLED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(3, 'SEEDLR-003-47871', '2025-05-01', '4', 'SURYA ELECTRICALS, CHENNAI Dispatch', '3', 'SURYA ELECTRICALS, CHENNAI', 'Bengaluru', 'Pune', 'Pune', NULL, 'Road', 'PAID', 3, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1800, "weight_qtl": 20, "description": "Textile Rolls", "rate_per_qtl": 90, "articles_count": 8}, {"id": "2", "freight_p": 0, "weight_kg": 50, "freight_rs": 605, "weight_qtl": 5, "description": "Apparel Cartons", "rate_per_qtl": 110, "articles_count": 2}]', 10, 'Textile Rolls', 2550.00, 2405.00, 3, 'KA05CD3003', 'TRUCK', 'SEAL0003', 'Driver 03', '9000000003', false, '{"in_date": "2025-05-01", "in_time": "08:00", "out_date": "2025-05-01", "out_time": "11:30"}', 3246.75, 100.00, 75.00, 25.00, 2605.00, 'SEED-BILL-003', '2025-08-26', NULL, 'NIL', 'CM0003', '2025-09-05', '[SEED15] pending_billing_report', '/api/files/3/content', '2026-05-22 04:44:14.344114+00', true, 3, 'EWBSEED00003', '2026-03-07 00:00:00+00', 'POD_VERIFIED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(4, 'SEEDLR-004-45668', '2025-06-14', '6', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', '5', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Mumbai', 'Ahmedabad', 'Ahmedabad', NULL, 'Road', 'PAID', 5, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1560, "weight_qtl": 12, "description": "Automobile Spare Parts", "rate_per_qtl": 130, "articles_count": 6}, {"id": "2", "freight_p": 0, "weight_kg": 80, "freight_rs": 880, "weight_qtl": 8, "description": "Tyre Assemblies", "rate_per_qtl": 100, "articles_count": 2}, {"id": "3", "freight_p": 0, "weight_kg": 40, "freight_rs": 544, "weight_qtl": 3, "description": "Engine Components", "rate_per_qtl": 160, "articles_count": 1}]', 9, 'Automobile Spare Parts', 2420.00, 2984.00, 4, 'MH12EF4004', 'TRUCK', 'SEAL0004', 'Driver 04', '9000000004', true, '{"in_date": "2025-06-14", "in_time": "08:00", "out_date": "2025-06-14", "out_time": "11:30"}', 4028.40, 100.00, 75.00, 25.00, 3184.00, 'SEED-BILL-004', '2025-04-30', 38720.00, 'NIL', '9592', '2025-07-10', '[SEED15] pod_uploaded_invoice_draft', '/api/files/4/content', NULL, true, 4, 'EWBSEED00004', '2025-06-25 00:00:00+00', 'POD_UPLOADED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(5, 'SEEDLR-005-45674', '2025-07-01', '6', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', '5', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Delhi', 'Jaipur', 'Jaipur', NULL, 'Road', 'PAID', 5, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1750, "weight_qtl": 25, "description": "Steel Rods", "rate_per_qtl": 70, "articles_count": 4}, {"id": "2", "freight_p": 0, "weight_kg": 0, "freight_rs": 850, "weight_qtl": 10, "description": "Metal Sheets", "rate_per_qtl": 85, "articles_count": 2}]', 6, 'Steel Rods', 3500.00, 2600.00, 5, 'GJ01GH5005', 'TRUCK', 'SEAL0005', 'Driver 05', '9000000005', false, '{"in_date": "2025-07-01", "in_time": "08:00", "out_date": "2025-07-01", "out_time": "11:30"}', 3510.00, 100.00, 75.00, 25.00, 2800.00, 'SEED-BILL-005', '2025-05-07', 14500.00, 'NIL', '9592', '2025-07-10', '[SEED15] dispatch_unbilled_expired_eway', NULL, NULL, false, NULL, 'EWBSEED00005', '2025-06-30 00:00:00+00', 'DISPATCHED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(6, 'SEEDLR-006-46245', '2025-08-15', '6', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', '5', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Kolkata', 'Bhubaneswar', 'Bhubaneswar', NULL, 'Road', 'PAID', 5, '[{"id": "1", "freight_p": 50, "weight_kg": 50, "freight_rs": 1757, "weight_qtl": 18, "description": "Industrial Chemicals", "rate_per_qtl": 95, "articles_count": 3}, {"id": "2", "freight_p": 0, "weight_kg": 0, "freight_rs": 660, "weight_qtl": 6, "description": "Lubricants (drums)", "rate_per_qtl": 110, "articles_count": 1}]', 4, 'Industrial Chemicals', 2450.00, 2417.50, 6, 'DL01JK6006', 'TRUCK', 'SEAL0006', 'Driver 06', '9000000006', true, '{"in_date": "2025-08-15", "in_time": "08:00", "out_date": "2025-08-15", "out_time": "11:30"}', 3263.62, 100.00, 75.00, 25.00, 2617.50, 'SEED-BILL-006', '2025-06-14', NULL, 'NIL', 'CM0006', '2025-06-24', '[SEED15] dispatch_unbilled_active', NULL, NULL, false, NULL, 'EWBSEED00006', '2025-08-26 00:00:00+00', 'DISPATCHED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(7, 'SEEDLR-007-SAMPLE-007', '2025-09-09', '2', 'HAVELLS INDIA LTD, SRICITY Dispatch', '1', 'HAVELLS INDIA LTD, SRICITY', 'Kochi', 'Coimbatore', 'Coimbatore', NULL, 'Road', 'PAID', 1, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1400, "weight_qtl": 14, "description": "Office Furniture", "rate_per_qtl": 100, "articles_count": 7}, {"id": "2", "freight_p": 60, "weight_kg": 30, "freight_rs": 879, "weight_qtl": 7, "description": "Wooden Cabinets", "rate_per_qtl": 120, "articles_count": 3}]', 10, 'Office Furniture', 2130.00, 2279.60, 7, 'WB20LM7007', 'TRUCK', 'SEAL0007', 'Driver 07', '9000000007', false, '{"in_date": "2025-09-09", "in_time": "08:00", "out_date": "2025-09-09", "out_time": "11:30"}', 3077.46, 100.00, 75.00, 25.00, 2479.60, 'SEED-BILL-007', '2025-04-28', 207500.00, 'NIL', '9583', '2025-06-30', '[SEED15] invoice_outstanding', '/api/files/5/content', '2026-05-22 04:44:14.467483+00', true, 5, 'EWBSEED00007', '2026-03-07 00:00:00+00', 'BILLED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(8, 'SEEDLR-008-47378', '2025-10-03', '4', 'SURYA ELECTRICALS, CHENNAI Dispatch', '3', 'SURYA ELECTRICALS, CHENNAI', 'Lucknow', 'Kanpur', 'Kanpur', NULL, 'Road', 'PAID', 3, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1800, "weight_qtl": 30, "description": "Processed Food Packets", "rate_per_qtl": 60, "articles_count": 20}, {"id": "2", "freight_p": 50, "weight_kg": 50, "freight_rs": 577, "weight_qtl": 10, "description": "Agricultural Produce", "rate_per_qtl": 55, "articles_count": 5}]', 25, 'Processed Food Packets', 4050.00, 2377.50, 8, 'UP32NP8008', 'TRUCK', 'SEAL0008', 'Driver 08', '9000000008', true, '{"in_date": "2025-10-03", "in_time": "08:00", "out_date": "2025-10-03", "out_time": "11:30"}', 3209.62, 100.00, 75.00, 25.00, 2577.50, 'SEED-BILL-008', '2025-07-24', NULL, 'NIL', 'CM0008', '2025-08-03', '[SEED15] cancelled_trip', NULL, NULL, false, NULL, 'EWBSEED00008', '2025-10-14 00:00:00+00', 'CANCELLED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(9, 'SEEDLR-009-47871', '2025-11-18', '4', 'SURYA ELECTRICALS, CHENNAI Dispatch', '3', 'SURYA ELECTRICALS, CHENNAI', 'Indore', 'Bhopal', 'Bhopal', NULL, 'Road', 'PAID', 3, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 2000, "weight_qtl": 10, "description": "White Goods (AC units)", "rate_per_qtl": 200, "articles_count": 4}, {"id": "2", "freight_p": 0, "weight_kg": 60, "freight_rs": 1548, "weight_qtl": 8, "description": "Home Appliances", "rate_per_qtl": 180, "articles_count": 6}]', 10, 'White Goods (AC units)', 1860.00, 3548.00, 9, 'MP09QR9009', 'TRUCK', 'SEAL0009', 'Driver 09', '9000000009', false, '{"in_date": "2025-11-18", "in_time": "08:00", "out_date": "2025-11-18", "out_time": "11:30"}', 4789.80, 100.00, 75.00, 25.00, 3748.00, 'SEED-BILL-009', '2025-08-26', NULL, 'NIL', 'CM0009', '2025-09-05', '[SEED15] issued_invoice', '/api/files/6/content', NULL, true, 6, 'EWBSEED00009', '2025-11-29 00:00:00+00', 'DELIVERED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(10, 'SEEDLR-010-45668', '2024-04-12', '6', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', '5', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Patna', 'Ranchi', 'Ranchi', NULL, 'Road', 'PAID', 5, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 450, "weight_qtl": 6, "description": "Corrugated Boxes", "rate_per_qtl": 75, "articles_count": 12}, {"id": "2", "freight_p": 0, "weight_kg": 0, "freight_rs": 810, "weight_qtl": 9, "description": "Plastic Containers", "rate_per_qtl": 90, "articles_count": 8}, {"id": "3", "freight_p": 0, "weight_kg": 50, "freight_rs": 150, "weight_qtl": 2, "description": "Bubble Wrap Rolls", "rate_per_qtl": 60, "articles_count": 3}]', 23, 'Corrugated Boxes', 1750.00, 1410.00, 10, 'BR01ST1010', 'TRUCK', 'SEAL0010', 'Driver 10', '9000000010', true, '{"in_date": "2024-04-12", "in_time": "08:00", "out_date": "2024-04-12", "out_time": "11:30"}', 1903.50, 100.00, 75.00, 25.00, 1610.00, 'SEED-BILL-010', '2025-04-30', 38720.00, 'NIL', '9592', '2025-07-10', '[SEED15] prior_fy_paid', '/api/files/7/content', '2026-05-22 04:44:14.572235+00', true, 7, 'EWBSEED00010', '2024-04-23 00:00:00+00', 'BILLED', '2024-25', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(11, 'SEEDLR-011-45674', '2024-07-22', '6', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', '5', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Guwahati', 'Shillong', 'Shillong', NULL, 'Road', 'PAID', 5, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 2200, "weight_qtl": 20, "description": "Glass Panels", "rate_per_qtl": 110, "articles_count": 5}, {"id": "2", "freight_p": 0, "weight_kg": 0, "freight_rs": 960, "weight_qtl": 12, "description": "Ceramic Tiles", "rate_per_qtl": 80, "articles_count": 3}]', 8, 'Glass Panels', 3200.00, 3160.00, 11, 'AS01UV1111', 'TRUCK', 'SEAL0011', 'Driver 11', '9000000011', false, '{"in_date": "2024-07-22", "in_time": "08:00", "out_date": "2024-07-22", "out_time": "11:30"}', 4266.00, 100.00, 75.00, 25.00, 3360.00, 'SEED-BILL-011', '2025-05-07', 14500.00, 'NIL', '9592', '2025-07-10', '[SEED15] prior_fy_partial', '/api/files/8/content', '2026-05-22 04:44:14.615282+00', true, 8, 'EWBSEED00011', '2024-07-21 00:00:00+00', 'BILLED', '2024-25', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(12, 'SEEDLR-012-46245', '2024-12-30', '6', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', '5', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Chandigarh', 'Ludhiana', 'Ludhiana', NULL, 'Road', 'PAID', 5, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1500, "weight_qtl": 5, "description": "Servers & Networking Equipment", "rate_per_qtl": 300, "articles_count": 3}, {"id": "2", "freight_p": 0, "weight_kg": 20, "freight_rs": 830, "weight_qtl": 3, "description": "Laptops & Accessories", "rate_per_qtl": 250, "articles_count": 8}]', 11, 'Servers & Networking Equipment', 820.00, 2330.00, 12, 'PB10WX1212', 'TRUCK', 'SEAL0012', 'Driver 12', '9000000012', true, '{"in_date": "2024-12-30", "in_time": "08:00", "out_date": "2024-12-30", "out_time": "11:30"}', 3145.50, 100.00, 75.00, 25.00, 2530.00, 'SEED-BILL-012', '2025-06-14', NULL, 'NIL', 'CM0012', '2025-06-24', '[SEED15] prior_fy_outstanding', '/api/files/9/content', '2026-05-22 04:44:14.665675+00', true, 9, 'EWBSEED00012', '2024-12-29 00:00:00+00', 'BILLED', '2024-25', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(13, 'SEEDLR-013-SAMPLE-013', '2023-08-10', '2', 'HAVELLS INDIA LTD, SRICITY Dispatch', '1', 'HAVELLS INDIA LTD, SRICITY', 'Nagpur', 'Raipur', 'Raipur', NULL, 'Road', 'PAID', 1, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1430, "weight_qtl": 22, "description": "PVC Pipes", "rate_per_qtl": 65, "articles_count": 6}, {"id": "2", "freight_p": 0, "weight_kg": 0, "freight_rs": 1050, "weight_qtl": 14, "description": "Polymer Granules", "rate_per_qtl": 75, "articles_count": 4}]', 10, 'PVC Pipes', 3600.00, 2480.00, 13, 'OD02YZ1313', 'TRUCK', 'SEAL0013', 'Driver 13', '9000000013', false, '{"in_date": "2023-08-10", "in_time": "08:00", "out_date": "2023-08-10", "out_time": "11:30"}', 3348.00, 100.00, 75.00, 25.00, 2680.00, 'SEED-BILL-013', '2025-04-28', 207500.00, 'NIL', '9583', '2025-06-30', '[SEED15] older_fy_paid', '/api/files/10/content', '2026-05-22 04:44:14.713704+00', true, 10, 'EWBSEED00013', '2023-08-09 00:00:00+00', 'BILLED', '2023-24', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(14, 'SEEDLR-014-47378', '2022-11-19', '4', 'SURYA ELECTRICALS, CHENNAI Dispatch', '3', 'SURYA ELECTRICALS, CHENNAI', 'Surat', 'Vadodara', 'Vadodara', NULL, 'Road', 'PAID', 3, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 500, "weight_qtl": 10, "description": "Books & Publications", "rate_per_qtl": 50, "articles_count": 15}, {"id": "2", "freight_p": 0, "weight_kg": 0, "freight_rs": 280, "weight_qtl": 4, "description": "Stationery Items", "rate_per_qtl": 70, "articles_count": 5}]', 20, 'Books & Publications', 1400.00, 780.00, 14, 'RJ14AA1414', 'TRUCK', 'SEAL0014', 'Driver 14', '9000000014', true, '{"in_date": "2022-11-19", "in_time": "08:00", "out_date": "2022-11-19", "out_time": "11:30"}', 1053.00, 100.00, 75.00, 25.00, 980.00, 'SEED-BILL-014', '2025-07-24', NULL, 'NIL', 'CM0014', '2025-08-03', '[SEED15] oldest_fy_outstanding', '/api/files/11/content', '2026-05-22 04:44:14.761181+00', true, 11, 'EWBSEED00014', '2022-11-18 00:00:00+00', 'BILLED', '2022-23', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(15, 'SEEDLR-015-47871', '2026-02-20', '4', 'SURYA ELECTRICALS, CHENNAI Dispatch', '3', 'SURYA ELECTRICALS, CHENNAI', 'Visakhapatnam', 'Vijayawada', 'Vijayawada', NULL, 'Road', 'PAID', 3, '[{"id": "1", "freight_p": 0, "weight_kg": 0, "freight_rs": 1600, "weight_qtl": 16, "description": "Mixed Consumer Goods", "rate_per_qtl": 100, "articles_count": 8}, {"id": "2", "freight_p": 0, "weight_kg": 50, "freight_rs": 585, "weight_qtl": 6, "description": "Packaged Items", "rate_per_qtl": 90, "articles_count": 4}, {"id": "3", "freight_p": 0, "weight_kg": 0, "freight_rs": 400, "weight_qtl": 2, "description": "Fragile Goods", "rate_per_qtl": 200, "articles_count": 2}]', 14, 'Mixed Consumer Goods', 2450.00, 2585.00, 15, 'KL07BB1515', 'TRUCK', 'SEAL0015', 'Driver 15', '9000000015', false, '{"in_date": "2026-02-20", "in_time": "08:00", "out_date": "2026-02-20", "out_time": "11:30"}', 3489.75, 100.00, 75.00, 25.00, 2785.00, 'SEED-BILL-015', '2025-08-26', 1551.00, 'NIL', 'CM0015', '2025-09-05', '[SEED15] recent_fy_mix', '/api/files/12/content', NULL, true, 12, 'EWBSEED00015', '2026-03-07 00:00:00+00', 'POD_UPLOADED', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(16, 'LR-1779511707362', '2026-05-23', '1', 'HAVELLS INDIA LTD, SRICITY', '1', 'HAVELLS INDIA LTD, SRICITY', 'BANGALORE', 'CHENNAI', '', 1, 'Vendor Seed 01', NULL, 2, '[{"id": "1", "remarks": "1", "freight_p": 1, "weight_kg": 1, "freight_rs": 1, "weight_qtl": 1, "description": "1", "rate_per_qtl": 1, "articles_count": 1}]', 1, '1', 101.00, 1.01, 1, 'AP39TA1001', 'TRUCK', '1111111', NULL, '1111', false, '{"in_date": "2026-05-23", "in_time": "10:19", "out_date": "2026-05-23", "out_time": "10:19"}', 1.01, 1.00, 1.00, 1.00, 4.01, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/api/files/14/content', NULL, false, NULL, NULL, NULL, 'POD_UPLOADED', '2026-27', '2026-05-23 04:49:30.740806+00', '2026-05-23 04:59:02.969905+00'),
-- 	(17, 'LR-1779512620401', '2026-05-23', '2', 'HAVELLS INDIA LTD, SRICITY Dispatch', '1', 'HAVELLS INDIA LTD, SRICITY', 'CHENNAI', 'BANGALORE', '', 2, 'Vendor Seed 02', NULL, 1, '[{"id": "1", "remarks": "test", "freight_p": 30, "weight_kg": 23, "freight_rs": 232, "weight_qtl": 23, "description": "test", "rate_per_qtl": 10, "articles_count": 12222}]', 12222, 'test', 2323.00, 232.30, 1, 'AP39TA1001', 'TRUCK', '234124', NULL, '124', false, '{"in_date": "2026-05-23", "in_time": "10:36", "out_date": "2026-05-23", "out_time": "10:38"}', 232.30, 0.00, 0.00, 0.00, 232.30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 'DRAFT', '2026-27', '2026-05-23 05:04:36.270661+00', '2026-05-23 05:06:31.400047+00');


--
-- Data for Name: eway_bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."eway_bills" ("id", "lr_id", "number", "valid_from", "valid_upto", "expires_at", "status", "alert_sent", "file_url", "extension_count", "last_extended_at", "meta", "created_at", "updated_at") VALUES
-- 	(1, 1, 'EWBSEED00001', '2025-04-20', '2025-04-30', '2025-05-01 00:00:00+00', 'EXPIRED', false, '/api/files/1/content', 0, NULL, '{"seed": true, "scenario": "paid_billed_verified"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(2, 2, 'EWBSEED00002', '2025-05-10', '2025-05-20', '2025-05-21 00:00:00+00', 'EXPIRED', false, '/api/files/2/content', 0, NULL, '{"seed": true, "scenario": "partial_collection"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(3, 3, 'EWBSEED00003', '2025-05-01', '2026-03-06', '2026-03-07 00:00:00+00', 'EXPIRED', true, '/api/files/3/content', 1, NULL, '{"seed": true, "scenario": "pending_billing_report"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(4, 4, 'EWBSEED00004', '2025-06-14', '2025-06-24', '2025-06-25 00:00:00+00', 'EXPIRED', false, '/api/files/4/content', 0, NULL, '{"seed": true, "scenario": "pod_uploaded_invoice_draft"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(5, 5, 'EWBSEED00005', '2025-07-01', '2025-06-29', '2025-06-30 00:00:00+00', 'EXPIRED', true, '/api/files/5/content', 0, NULL, '{"seed": true, "scenario": "dispatch_unbilled_expired_eway"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(6, 6, 'EWBSEED00006', '2025-08-15', '2025-08-25', '2025-08-26 00:00:00+00', 'EXPIRED', false, '/api/files/6/content', 0, NULL, '{"seed": true, "scenario": "dispatch_unbilled_active"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(7, 7, 'EWBSEED00007', '2025-09-09', '2026-03-06', '2026-03-07 00:00:00+00', 'EXPIRED', true, '/api/files/7/content', 1, NULL, '{"seed": true, "scenario": "invoice_outstanding"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(8, 8, 'EWBSEED00008', '2025-10-03', '2025-10-13', '2025-10-14 00:00:00+00', 'EXPIRED', false, '/api/files/8/content', 0, NULL, '{"seed": true, "scenario": "cancelled_trip"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(9, 9, 'EWBSEED00009', '2025-11-18', '2025-11-28', '2025-11-29 00:00:00+00', 'EXPIRED', false, '/api/files/9/content', 0, NULL, '{"seed": true, "scenario": "issued_invoice"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(10, 10, 'EWBSEED00010', '2024-04-12', '2024-04-22', '2024-04-23 00:00:00+00', 'EXPIRED', false, '/api/files/10/content', 0, NULL, '{"seed": true, "scenario": "prior_fy_paid"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(11, 11, 'EWBSEED00011', '2024-07-22', '2024-07-20', '2024-07-21 00:00:00+00', 'EXPIRED', true, '/api/files/11/content', 0, NULL, '{"seed": true, "scenario": "prior_fy_partial"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(12, 12, 'EWBSEED00012', '2024-12-30', '2024-12-28', '2024-12-29 00:00:00+00', 'EXPIRED', true, '/api/files/12/content', 0, NULL, '{"seed": true, "scenario": "prior_fy_outstanding"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(13, 13, 'EWBSEED00013', '2023-08-10', '2023-08-08', '2023-08-09 00:00:00+00', 'EXPIRED', true, '/api/files/13/content', 0, NULL, '{"seed": true, "scenario": "older_fy_paid"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(14, 14, 'EWBSEED00014', '2022-11-19', '2022-11-17', '2022-11-18 00:00:00+00', 'EXPIRED', true, '/api/files/14/content', 0, NULL, '{"seed": true, "scenario": "oldest_fy_outstanding"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(15, 15, 'EWBSEED00015', '2026-02-20', '2026-03-06', '2026-03-07 00:00:00+00', 'EXPIRED', true, '/api/files/15/content', 1, NULL, '{"seed": true, "scenario": "recent_fy_mix"}', '2026-05-23 04:44:14.12355+00', NULL),
-- 	(16, 16, '1', '2026-05-23', '2026-05-25', '2026-05-25 18:30:00+00', 'ACTIVE', false, NULL, 0, NULL, 'null', '2026-05-23 04:50:13.055397+00', NULL);


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."vendors" ("id", "name", "type", "mobile", "address", "tds_certificate_url", "pan", "created_at", "updated_at") VALUES
	(1, 'Vendor Seed 01', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(2, 'Vendor Seed 02', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(3, 'Vendor Seed 03', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(4, 'Vendor Seed 04', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(5, 'Vendor Seed 05', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(6, 'Vendor Seed 06', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(7, 'Vendor Seed 07', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(8, 'Vendor Seed 08', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(9, 'Vendor Seed 09', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(10, 'Vendor Seed 10', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(11, 'Vendor Seed 11', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(12, 'Vendor Seed 12', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(13, 'Vendor Seed 13', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(14, 'Vendor Seed 14', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL),
	(15, 'Vendor Seed 15', 'fleet_owner', '9000000000', NULL, NULL, 'PANVENDO', '2026-05-23 04:44:14.12355+00', NULL);


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."vehicles" ("id", "number", "type", "capacity", "owner_id", "status", "created_at", "updated_at") VALUES
	(1, 'AP39TA1001', 'TRUCK', '16T', 1, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(2, 'TN01AB2002', 'TRUCK', '16T', 2, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(3, 'KA05CD3003', 'TRUCK', '16T', 3, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(4, 'MH12EF4004', 'TRUCK', '16T', 4, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(5, 'GJ01GH5005', 'TRUCK', '16T', 5, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(6, 'DL01JK6006', 'TRUCK', '16T', 6, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(7, 'WB20LM7007', 'TRUCK', '16T', 7, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(8, 'UP32NP8008', 'TRUCK', '16T', 8, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(9, 'MP09QR9009', 'TRUCK', '16T', 9, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(10, 'BR01ST1010', 'TRUCK', '16T', 10, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(11, 'AS01UV1111', 'TRUCK', '16T', 11, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(12, 'PB10WX1212', 'TRUCK', '16T', 12, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(13, 'OD02YZ1313', 'TRUCK', '16T', 13, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(14, 'RJ14AA1414', 'TRUCK', '16T', 14, 'active', '2026-05-23 04:44:14.12355+00', NULL),
	(15, 'KL07BB1515', 'TRUCK', '16T', 15, 'active', '2026-05-23 04:44:14.12355+00', NULL);


--
-- Data for Name: hirememos; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."hirememos" ("id", "lr_id", "total_amount", "advance_cash", "advance_bank", "advance_payment_date", "balance", "balance_payment_date", "driver_name", "driver_mobile", "driver_license", "hire_memo_no", "hire_memo_date", "branch", "vehicle_id", "vehicle_number", "from_location", "to_location", "payment_location", "rate_type", "freight_rate", "freight_weight", "guaranteed_weight", "commission", "hamali", "mamul", "other_deductions", "ack_status", "notes", "financial_year", "created_at", "updated_at") VALUES
-- 	(1, 1, 1224.00, 367.20, 306.00, NULL, 550.80, NULL, 'Driver 01', '9000000001', 'DL000001', 'HM-SEED-001', '2025-04-21', 'HQ', 1, 'AP39TA1001', 'Sricity', 'Chennai', 'Chennai', 'FIXED', 1224.00, 10.00, 10.00, 24.48, 250.00, 100.00, 50.00, 'CLOSED', '[SEED15] HireMemo for scenario=paid_billed_verified', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(2, 2, 1479.00, 295.80, 221.85, NULL, 961.35, NULL, 'Driver 02', '9000000002', 'DL000002', 'HM-SEED-002', '2025-05-11', 'HQ', 2, 'TN01AB2002', 'Chennai', 'Hyderabad', 'Hyderabad', 'FIXED', 1479.00, 10.00, 10.00, 29.58, 250.00, 100.00, 50.00, 'RECEIVED', '[SEED15] HireMemo for scenario=partial_collection', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(3, 3, 2044.25, 408.85, 0.00, NULL, 1635.40, NULL, 'Driver 03', '9000000003', 'DL000003', 'HM-SEED-003', '2025-05-02', 'HQ', 3, 'KA05CD3003', 'Bengaluru', 'Pune', 'Pune', 'FIXED', 2044.25, 10.00, 10.00, 40.88, 250.00, 100.00, 50.00, 'PENDING', '[SEED15] HireMemo for scenario=pending_billing_report', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(4, 4, 2536.40, 507.28, 0.00, NULL, 2029.12, NULL, 'Driver 04', '9000000004', 'DL000004', 'HM-SEED-004', '2025-06-15', 'HQ', 4, 'MH12EF4004', 'Mumbai', 'Ahmedabad', 'Ahmedabad', 'FIXED', 2536.40, 10.00, 10.00, 50.73, 250.00, 100.00, 50.00, 'PENDING', '[SEED15] HireMemo for scenario=pod_uploaded_invoice_draft', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(5, 6, 2054.88, 410.98, 0.00, NULL, 1643.90, NULL, 'Driver 06', '9000000006', 'DL000006', 'HM-SEED-006', '2025-08-16', 'HQ', 6, 'DL01JK6006', 'Kolkata', 'Bhubaneswar', 'Bhubaneswar', 'FIXED', 2054.88, 10.00, 10.00, 41.10, 250.00, 100.00, 50.00, 'PENDING', '[SEED15] HireMemo for scenario=dispatch_unbilled_active', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(6, 7, 1937.66, 387.53, 290.65, NULL, 1259.48, NULL, 'Driver 07', '9000000007', 'DL000007', 'HM-SEED-007', '2025-09-10', 'HQ', 7, 'WB20LM7007', 'Kochi', 'Coimbatore', 'Coimbatore', 'FIXED', 1937.66, 10.00, 10.00, 38.75, 250.00, 100.00, 50.00, 'RECEIVED', '[SEED15] HireMemo for scenario=invoice_outstanding', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(7, 9, 3015.80, 904.74, 753.95, NULL, 1357.11, NULL, 'Driver 09', '9000000009', 'DL000009', 'HM-SEED-009', '2025-11-19', 'HQ', 9, 'MP09QR9009', 'Indore', 'Bhopal', 'Bhopal', 'FIXED', 3015.80, 10.00, 10.00, 60.32, 250.00, 100.00, 50.00, 'CLOSED', '[SEED15] HireMemo for scenario=issued_invoice', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(8, 10, 1198.50, 359.55, 299.62, NULL, 539.33, NULL, 'Driver 10', '9000000010', 'DL000010', 'HM-SEED-010', '2024-04-13', 'HQ', 10, 'BR01ST1010', 'Patna', 'Ranchi', 'Ranchi', 'FIXED', 1198.50, 10.00, 10.00, 23.97, 250.00, 100.00, 50.00, 'CLOSED', '[SEED15] HireMemo for scenario=prior_fy_paid', '2024-25', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(9, 11, 2686.00, 537.20, 402.90, NULL, 1745.90, NULL, 'Driver 11', '9000000011', 'DL000011', 'HM-SEED-011', '2024-07-23', 'HQ', 11, 'AS01UV1111', 'Guwahati', 'Shillong', 'Shillong', 'FIXED', 2686.00, 10.00, 10.00, 53.72, 250.00, 100.00, 50.00, 'RECEIVED', '[SEED15] HireMemo for scenario=prior_fy_partial', '2024-25', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(10, 12, 1980.50, 396.10, 0.00, NULL, 1584.40, NULL, 'Driver 12', '9000000012', 'DL000012', 'HM-SEED-012', '2024-12-31', 'HQ', 12, 'PB10WX1212', 'Chandigarh', 'Ludhiana', 'Ludhiana', 'FIXED', 1980.50, 10.00, 10.00, 39.61, 250.00, 100.00, 50.00, 'PENDING', '[SEED15] HireMemo for scenario=prior_fy_outstanding', '2024-25', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(11, 13, 2108.00, 632.40, 527.00, NULL, 948.60, NULL, 'Driver 13', '9000000013', 'DL000013', 'HM-SEED-013', '2023-08-11', 'HQ', 13, 'OD02YZ1313', 'Nagpur', 'Raipur', 'Raipur', 'FIXED', 2108.00, 10.00, 10.00, 42.16, 250.00, 100.00, 50.00, 'CLOSED', '[SEED15] HireMemo for scenario=older_fy_paid', '2023-24', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(12, 14, 663.00, 132.60, 0.00, NULL, 530.40, NULL, 'Driver 14', '9000000014', 'DL000014', 'HM-SEED-014', '2022-11-20', 'HQ', 14, 'RJ14AA1414', 'Surat', 'Vadodara', 'Vadodara', 'FIXED', 663.00, 10.00, 10.00, 13.26, 250.00, 100.00, 50.00, 'PENDING', '[SEED15] HireMemo for scenario=oldest_fy_outstanding', '2022-23', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(13, 15, 2197.25, 439.45, 329.59, NULL, 1428.21, NULL, 'Driver 15', '9000000015', 'DL000015', 'HM-SEED-015', '2026-02-21', 'HQ', 15, 'KL07BB1515', 'Visakhapatnam', 'Vijayawada', 'Vijayawada', 'FIXED', 2197.25, 10.00, 10.00, 43.94, 250.00, 100.00, 50.00, 'RECEIVED', '[SEED15] HireMemo for scenario=recent_fy_mix', '2025-26', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(14, 16, 1.00, 0.00, 0.00, NULL, 1.00, NULL, NULL, '1111', '', '1', NULL, '', 1, 'AP39TA1001', 'BANGALORE', 'CHENNAI', '', 'FIXED', NULL, 1.00, NULL, 0.00, 1.00, 0.00, 0.00, 'PENDING', '', '2026-27', '2026-05-23 04:50:52.23381+00', '2026-05-23 05:00:37.397031+00'),
-- 	(15, 17, 300.00, 200.00, 100.00, '2026-05-23', 0.00, '2026-05-23', '', '124', '', '2', '2026-05-23', '', 1, 'AP39TA1001', 'CHENNAI', 'BANGALORE', '', 'FIXED', NULL, 2.00, NULL, 0.00, 0.00, 0.00, 0.00, 'PENDING', '', '2026-27', '2026-05-23 05:10:38.316631+00', '2026-05-23 05:23:26.870124+00');


--
-- Data for Name: file_uploads; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."file_uploads" ("id", "document_type", "lr_id", "hirememo_id", "original_filename", "stored_filename", "storage_path", "file_url", "content_type", "file_size", "checksum", "uploaded_by", "is_archived", "archived_at", "created_at", "expires_at") VALUES
-- 	(1, 'POD', 1, NULL, 'SEEDLR-001-SAMPLE-001.pdf', 'SEEDLR-001-SAMPLE-001.pdf', '/backend/app/storage/uploads/seed/SEEDLR-001-SAMPLE-001.pdf', '/api/files/1/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.246585+00'),
-- 	(2, 'POD', 2, NULL, 'SEEDLR-002-47378.pdf', 'SEEDLR-002-47378.pdf', '/backend/app/storage/uploads/seed/SEEDLR-002-47378.pdf', '/api/files/2/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.305283+00'),
-- 	(3, 'POD', 3, NULL, 'SEEDLR-003-47871.pdf', 'SEEDLR-003-47871.pdf', '/backend/app/storage/uploads/seed/SEEDLR-003-47871.pdf', '/api/files/3/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.343017+00'),
-- 	(4, 'POD', 4, NULL, 'SEEDLR-004-45668.pdf', 'SEEDLR-004-45668.pdf', '/backend/app/storage/uploads/seed/SEEDLR-004-45668.pdf', '/api/files/4/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.374141+00'),
-- 	(5, 'POD', 7, NULL, 'SEEDLR-007-SAMPLE-007.pdf', 'SEEDLR-007-SAMPLE-007.pdf', '/backend/app/storage/uploads/seed/SEEDLR-007-SAMPLE-007.pdf', '/api/files/5/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.466225+00'),
-- 	(6, 'POD', 9, NULL, 'SEEDLR-009-47871.pdf', 'SEEDLR-009-47871.pdf', '/backend/app/storage/uploads/seed/SEEDLR-009-47871.pdf', '/api/files/6/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.532334+00'),
-- 	(7, 'POD', 10, NULL, 'SEEDLR-010-45668.pdf', 'SEEDLR-010-45668.pdf', '/backend/app/storage/uploads/seed/SEEDLR-010-45668.pdf', '/api/files/7/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.570985+00'),
-- 	(8, 'POD', 11, NULL, 'SEEDLR-011-45674.pdf', 'SEEDLR-011-45674.pdf', '/backend/app/storage/uploads/seed/SEEDLR-011-45674.pdf', '/api/files/8/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.614136+00'),
-- 	(9, 'POD', 12, NULL, 'SEEDLR-012-46245.pdf', 'SEEDLR-012-46245.pdf', '/backend/app/storage/uploads/seed/SEEDLR-012-46245.pdf', '/api/files/9/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.664144+00'),
-- 	(10, 'POD', 13, NULL, 'SEEDLR-013-SAMPLE-013.pdf', 'SEEDLR-013-SAMPLE-013.pdf', '/backend/app/storage/uploads/seed/SEEDLR-013-SAMPLE-013.pdf', '/api/files/10/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.712164+00'),
-- 	(11, 'POD', 14, NULL, 'SEEDLR-014-47378.pdf', 'SEEDLR-014-47378.pdf', '/backend/app/storage/uploads/seed/SEEDLR-014-47378.pdf', '/api/files/11/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.759785+00'),
-- 	(12, 'POD', 15, NULL, 'SEEDLR-015-47871.pdf', 'SEEDLR-015-47871.pdf', '/backend/app/storage/uploads/seed/SEEDLR-015-47871.pdf', '/api/files/12/content', 'application/pdf', 492, 'd56c8cb4dfc1b4920990544b068f773fc93e04b3a6883b3b87b70957835850f5', 'seed-script', false, NULL, '2026-05-23 04:44:14.12355+00', '2027-05-23 04:44:14.801258+00'),
-- 	(13, 'POD', 16, NULL, 'Daikin bill copy.pdf', '36500a2a15b24b01ac66ce39b46ed24c.pdf', '/app/app/storage/uploads/pod/2026/05/36500a2a15b24b01ac66ce39b46ed24c.pdf', '/api/files/13/content', 'application/pdf', 528564, '0ee72db9fff3e0c96f951dadd6d05736f07682cdbd722e1c563f36b60b9fa026', NULL, false, NULL, '2026-05-23 04:58:30.064656+00', '2027-05-23 04:58:30.0678+00'),
-- 	(14, 'POD', 16, 14, 'Daikin bill copy.pdf', 'cb8d3b9fd7e842e38d135a7b0120b66e.pdf', '/app/app/storage/uploads/pod/2026/05/cb8d3b9fd7e842e38d135a7b0120b66e.pdf', '/api/files/14/content', 'application/pdf', 528564, '0ee72db9fff3e0c96f951dadd6d05736f07682cdbd722e1c563f36b60b9fa026', NULL, false, NULL, '2026-05-23 04:59:02.962491+00', '2027-05-23 04:59:02.966611+00');


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."invoices" ("id", "invoice_no", "invoice_date", "client_id", "financial_year", "po_no", "po_date", "hsn_code", "reverse_charge", "gst_paid_by", "total_amount", "tds_amount", "net_amount", "status", "created_at", "updated_at") VALUES
-- 	(1, 'SEED-INV-001', '2025-04-30', 1, '2025-26', 'PO-001', '2025-04-20', '996791', false, 'consignor', 1440.00, 28.80, 1411.20, 'paid', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(2, 'SEED-INV-002', '2025-05-20', 3, '2025-26', 'PO-002', '2025-05-10', '996791', false, 'consignor', 1740.00, 34.80, 1705.20, 'partially_paid', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(3, 'SEED-INV-004', '2025-06-24', 5, '2025-26', 'PO-004', '2025-06-14', '996791', false, 'consignor', 2984.00, 59.68, 2924.32, 'draft', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(4, 'SEED-INV-007', '2025-09-19', 1, '2025-26', 'PO-007', '2025-09-09', '996791', false, 'consignor', 2279.60, 45.59, 2234.01, 'issued', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(5, 'SEED-INV-009', '2025-11-28', 3, '2025-26', 'PO-009', '2025-11-18', '996791', false, 'consignor', 3548.00, 70.96, 3477.04, 'issued', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(6, 'SEED-INV-010', '2024-04-22', 5, '2024-25', 'PO-010', '2024-04-12', '996791', false, 'consignor', 1410.00, 28.20, 1381.80, 'paid', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(7, 'SEED-INV-011', '2024-08-01', 5, '2024-25', 'PO-011', '2024-07-22', '996791', false, 'consignor', 3160.00, 63.20, 3096.80, 'partially_paid', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(8, 'SEED-INV-012', '2025-01-09', 5, '2024-25', 'PO-012', '2024-12-30', '996791', false, 'consignor', 2330.00, 46.60, 2283.40, 'issued', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(9, 'SEED-INV-013', '2023-08-20', 1, '2023-24', 'PO-013', '2023-08-10', '996791', false, 'consignor', 2480.00, 49.60, 2430.40, 'paid', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(10, 'SEED-INV-014', '2022-11-29', 3, '2022-23', 'PO-014', '2022-11-19', '996791', false, 'consignor', 780.00, 15.60, 764.40, 'issued', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(11, 'SEED-INV-015', '2026-03-02', 3, '2025-26', 'PO-015', '2026-02-20', '996791', false, 'consignor', 2585.00, 51.70, 2533.30, 'partially_paid', '2026-05-23 04:44:14.12355+00', '2026-05-23 04:44:14.12355+00'),
-- 	(12, '1/26-27', '2026-05-23', 2, '2026-27', NULL, NULL, '996791', false, NULL, 4.01, 0.00, 4.01, 'paid', '2026-05-23 05:01:54.23532+00', '2026-05-23 05:02:12.454702+00');


--
-- Data for Name: invoice_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."invoice_lines" ("id", "invoice_id", "lr_id", "s_no", "lr_no", "lr_date", "qty", "particulars", "v_type", "vehicle_no", "consignor", "consignee", "from_city", "to_city", "freight", "loading_detention", "unloading_charges", "unloading_detention", "other_charges", "total", "created_at", "updated_at") VALUES
-- 	(1, 1, 1, 1, 'SEEDLR-001-SAMPLE-001', '2025-04-20', 1.00, '[SEED15] Freight - Sricity to Chennai', 'TRUCK', 'AP39TA1001', 'HAVELLS INDIA LTD, SRICITY Dispatch', 'HAVELLS INDIA LTD, SRICITY', 'Sricity', 'Chennai', 1440.00, 0.00, 0.00, 0.00, 0.00, 1440.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(2, 2, 2, 1, 'SEEDLR-002-47378', '2025-05-10', 1.00, '[SEED15] Freight - Chennai to Hyderabad', 'TRUCK', 'TN01AB2002', 'SURYA ELECTRICALS, CHENNAI Dispatch', 'SURYA ELECTRICALS, CHENNAI', 'Chennai', 'Hyderabad', 1740.00, 0.00, 0.00, 0.00, 0.00, 1740.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(3, 3, 4, 1, 'SEEDLR-004-45668', '2025-06-14', 1.00, '[SEED15] Freight - Mumbai to Ahmedabad', 'TRUCK', 'MH12EF4004', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Mumbai', 'Ahmedabad', 2984.00, 0.00, 0.00, 0.00, 0.00, 2984.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(4, 4, 7, 1, 'SEEDLR-007-SAMPLE-007', '2025-09-09', 1.00, '[SEED15] Freight - Kochi to Coimbatore', 'TRUCK', 'WB20LM7007', 'HAVELLS INDIA LTD, SRICITY Dispatch', 'HAVELLS INDIA LTD, SRICITY', 'Kochi', 'Coimbatore', 2279.60, 0.00, 0.00, 0.00, 0.00, 2279.60, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(5, 5, 9, 1, 'SEEDLR-009-47871', '2025-11-18', 1.00, '[SEED15] Freight - Indore to Bhopal', 'TRUCK', 'MP09QR9009', 'SURYA ELECTRICALS, CHENNAI Dispatch', 'SURYA ELECTRICALS, CHENNAI', 'Indore', 'Bhopal', 3548.00, 0.00, 0.00, 0.00, 0.00, 3548.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(6, 6, 10, 1, 'SEEDLR-010-45668', '2024-04-12', 1.00, '[SEED15] Freight - Patna to Ranchi', 'TRUCK', 'BR01ST1010', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Patna', 'Ranchi', 1410.00, 0.00, 0.00, 0.00, 0.00, 1410.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(7, 7, 11, 1, 'SEEDLR-011-45674', '2024-07-22', 1.00, '[SEED15] Freight - Guwahati to Shillong', 'TRUCK', 'AS01UV1111', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Guwahati', 'Shillong', 3160.00, 0.00, 0.00, 0.00, 0.00, 3160.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(8, 8, 12, 1, 'SEEDLR-012-46245', '2024-12-30', 1.00, '[SEED15] Freight - Chandigarh to Ludhiana', 'TRUCK', 'PB10WX1212', 'FLYJAC LOGISTICS P LTD, CHENNAI Dispatch', 'FLYJAC LOGISTICS P LTD, CHENNAI', 'Chandigarh', 'Ludhiana', 2330.00, 0.00, 0.00, 0.00, 0.00, 2330.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(9, 9, 13, 1, 'SEEDLR-013-SAMPLE-013', '2023-08-10', 1.00, '[SEED15] Freight - Nagpur to Raipur', 'TRUCK', 'OD02YZ1313', 'HAVELLS INDIA LTD, SRICITY Dispatch', 'HAVELLS INDIA LTD, SRICITY', 'Nagpur', 'Raipur', 2480.00, 0.00, 0.00, 0.00, 0.00, 2480.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(10, 10, 14, 1, 'SEEDLR-014-47378', '2022-11-19', 1.00, '[SEED15] Freight - Surat to Vadodara', 'TRUCK', 'RJ14AA1414', 'SURYA ELECTRICALS, CHENNAI Dispatch', 'SURYA ELECTRICALS, CHENNAI', 'Surat', 'Vadodara', 780.00, 0.00, 0.00, 0.00, 0.00, 780.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(11, 11, 15, 1, 'SEEDLR-015-47871', '2026-02-20', 1.00, '[SEED15] Freight - Visakhapatnam to Vijayawada', 'TRUCK', 'KL07BB1515', 'SURYA ELECTRICALS, CHENNAI Dispatch', 'SURYA ELECTRICALS, CHENNAI', 'Visakhapatnam', 'Vijayawada', 2585.00, 0.00, 0.00, 0.00, 0.00, 2585.00, '2026-05-23 04:44:14.12355+00', NULL),
-- 	(12, 12, 16, 1, 'LR-1779511707362', '2026-05-23', 1.00, 'Transport Service', 'TRUCK', 'AP39TA1001', 'HAVELLS INDIA LTD, SRICITY', 'HAVELLS INDIA LTD, SRICITY', 'BANGALORE', 'CHENNAI', 4.01, 0.00, 0.00, 0.00, 0.00, 4.01, '2026-05-23 05:01:54.23532+00', NULL);


--
-- Data for Name: lr_deductions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: payment_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."payment_receipts" ("id", "payment_date", "amount", "invoice_id", "received_from_id", "received_from", "total_billed_amount", "tds_deducted", "net_amount", "other_deduction", "deduction_remarks", "payment_mode", "financial_year", "notes", "created_at") VALUES
-- 	(1, '2025-11-27', 591897.46, NULL, 7, 'FLIPKART INDIA P LTD', 603977.00, 12079.54, 591897.46, 0.00, NULL, 'NEFT', '2025-26', '[SEED15] Workbook fallback receipt 1', '2026-05-23 04:44:14.12355+00'),
-- 	(2, '2025-12-16', 3202800.00, NULL, 8, 'INSTAKART SERVICES P LTD', 3268163.27, 65363.27, 3202800.00, 0.00, NULL, 'RTGS', '2025-26', '[SEED15] Workbook fallback receipt 2', '2026-05-23 04:44:14.12355+00'),
-- 	(3, '2025-12-16', 1862214.00, NULL, 7, 'FLIPKART INDIA P LTD', 1900814.00, 38016.28, 1862214.00, 583.72, 'Bank charges adjusted', 'BANK', '2025-26', '[SEED15] Workbook fallback receipt 3', '2026-05-23 04:44:14.12355+00'),
-- 	(4, '2025-05-20', 1411.20, 1, 1, 'HAVELLS INDIA LTD, SRICITY', 1440.00, 28.80, 1411.20, 0.00, 'TDS adjusted', 'BANK', '2025-26', '[SEED15] INVOICE-SEED-INV-001', '2026-05-23 04:44:14.12355+00'),
-- 	(5, '2025-06-09', 937.86, 2, 3, 'SURYA ELECTRICALS, CHENNAI', 937.86, 0.00, 937.86, 0.00, 'partial settlement', 'NEFT', '2025-26', '[SEED15] INVOICE-SEED-INV-002', '2026-05-23 04:44:14.12355+00'),
-- 	(6, '2024-05-12', 1381.80, 6, 5, 'FLYJAC LOGISTICS P LTD, CHENNAI', 1410.00, 28.20, 1381.80, 0.00, 'TDS adjusted', 'CHEQUE', '2024-25', '[SEED15] INVOICE-SEED-INV-010', '2026-05-23 04:44:14.12355+00'),
-- 	(7, '2024-08-21', 1703.24, 7, 5, 'FLYJAC LOGISTICS P LTD, CHENNAI', 1703.24, 0.00, 1703.24, 0.00, 'partial settlement', 'BANK', '2024-25', '[SEED15] INVOICE-SEED-INV-011', '2026-05-23 04:44:14.12355+00'),
-- 	(8, '2023-09-09', 2430.40, 9, 1, 'HAVELLS INDIA LTD, SRICITY', 2480.00, 49.60, 2430.40, 0.00, 'TDS adjusted', 'RTGS', '2023-24', '[SEED15] INVOICE-SEED-INV-013', '2026-05-23 04:44:14.12355+00'),
-- 	(9, '2026-03-22', 1393.32, 11, 3, 'SURYA ELECTRICALS, CHENNAI', 1393.32, 0.00, 1393.32, 0.00, 'partial settlement', 'CHEQUE', '2025-26', '[SEED15] INVOICE-SEED-INV-015', '2026-05-23 04:44:14.12355+00'),
-- 	(10, '2026-05-23', 4.01, 12, 2, 'HAVELLS INDIA LTD, SRICITY Dispatch', 4.01, 0.00, 4.01, 0.00, NULL, 'BANK', '2026-27', NULL, '2026-05-23 05:02:12.454702+00');


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: vehicle_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."vehicle_locations" ("id", "lr_id", "vehicle_number", "location", "status", "reported_by", "reported_at", "notes", "created_at") VALUES
-- 	(1, 1, 'AP39TA1001', 'Sricity', 'LOADING', 'seed-script', '2026-03-01 15:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(2, 1, 'AP39TA1001', 'Midway-1', 'IN_TRANSIT', 'seed-script', '2026-03-01 16:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(3, 1, 'AP39TA1001', 'Chennai', 'DELIVERED', 'seed-script', '2026-03-01 17:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(4, 2, 'TN01AB2002', 'Chennai', 'LOADING', 'seed-script', '2026-03-01 20:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(5, 2, 'TN01AB2002', 'Midway-2', 'IN_TRANSIT', 'seed-script', '2026-03-01 21:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(6, 2, 'TN01AB2002', 'Hyderabad', 'AT_HUB', 'seed-script', '2026-03-01 22:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(7, 3, 'KA05CD3003', 'Bengaluru', 'LOADING', 'seed-script', '2026-03-02 01:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(8, 3, 'KA05CD3003', 'Midway-3', 'IN_TRANSIT', 'seed-script', '2026-03-02 02:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(9, 3, 'KA05CD3003', 'Pune', 'IN_TRANSIT', 'seed-script', '2026-03-02 03:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(10, 4, 'MH12EF4004', 'Mumbai', 'LOADING', 'seed-script', '2026-03-02 06:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(11, 4, 'MH12EF4004', 'Midway-4', 'IN_TRANSIT', 'seed-script', '2026-03-02 07:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(12, 4, 'MH12EF4004', 'Ahmedabad', 'UNLOADING', 'seed-script', '2026-03-02 08:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(13, 5, 'GJ01GH5005', 'Delhi', 'LOADING', 'seed-script', '2026-03-02 11:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(14, 5, 'GJ01GH5005', 'Midway-5', 'IN_TRANSIT', 'seed-script', '2026-03-02 12:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(15, 5, 'GJ01GH5005', 'Jaipur', 'LOADING', 'seed-script', '2026-03-02 13:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(16, 6, 'DL01JK6006', 'Kolkata', 'LOADING', 'seed-script', '2026-03-02 16:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(17, 6, 'DL01JK6006', 'Midway-6', 'IN_TRANSIT', 'seed-script', '2026-03-02 17:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(18, 6, 'DL01JK6006', 'Bhubaneswar', 'IN_TRANSIT', 'seed-script', '2026-03-02 18:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(19, 7, 'WB20LM7007', 'Kochi', 'LOADING', 'seed-script', '2026-03-02 21:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(20, 7, 'WB20LM7007', 'Midway-7', 'IN_TRANSIT', 'seed-script', '2026-03-02 22:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(21, 7, 'WB20LM7007', 'Coimbatore', 'AT_DESTINATION', 'seed-script', '2026-03-02 23:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(22, 8, 'UP32NP8008', 'Lucknow', 'LOADING', 'seed-script', '2026-03-03 02:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(23, 8, 'UP32NP8008', 'Midway-8', 'IN_TRANSIT', 'seed-script', '2026-03-03 03:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(24, 8, 'UP32NP8008', 'Kanpur', 'CANCELLED', 'seed-script', '2026-03-03 04:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(25, 9, 'MP09QR9009', 'Indore', 'LOADING', 'seed-script', '2026-03-03 07:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(26, 9, 'MP09QR9009', 'Midway-9', 'IN_TRANSIT', 'seed-script', '2026-03-03 08:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(27, 9, 'MP09QR9009', 'Bhopal', 'DELIVERED', 'seed-script', '2026-03-03 09:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(28, 10, 'BR01ST1010', 'Patna', 'LOADING', 'seed-script', '2026-03-03 12:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(29, 10, 'BR01ST1010', 'Midway-10', 'IN_TRANSIT', 'seed-script', '2026-03-03 13:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(30, 10, 'BR01ST1010', 'Ranchi', 'DELIVERED', 'seed-script', '2026-03-03 14:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(31, 11, 'AS01UV1111', 'Guwahati', 'LOADING', 'seed-script', '2026-03-03 17:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(32, 11, 'AS01UV1111', 'Midway-11', 'IN_TRANSIT', 'seed-script', '2026-03-03 18:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(33, 11, 'AS01UV1111', 'Shillong', 'AT_HUB', 'seed-script', '2026-03-03 19:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(34, 12, 'PB10WX1212', 'Chandigarh', 'LOADING', 'seed-script', '2026-03-03 22:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(35, 12, 'PB10WX1212', 'Midway-12', 'IN_TRANSIT', 'seed-script', '2026-03-03 23:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(36, 12, 'PB10WX1212', 'Ludhiana', 'IN_TRANSIT', 'seed-script', '2026-03-04 00:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(37, 13, 'OD02YZ1313', 'Nagpur', 'LOADING', 'seed-script', '2026-03-04 03:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(38, 13, 'OD02YZ1313', 'Midway-13', 'IN_TRANSIT', 'seed-script', '2026-03-04 04:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(39, 13, 'OD02YZ1313', 'Raipur', 'DELIVERED', 'seed-script', '2026-03-04 05:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(40, 14, 'RJ14AA1414', 'Surat', 'LOADING', 'seed-script', '2026-03-04 08:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(41, 14, 'RJ14AA1414', 'Midway-14', 'IN_TRANSIT', 'seed-script', '2026-03-04 09:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(42, 14, 'RJ14AA1414', 'Vadodara', 'AT_DESTINATION', 'seed-script', '2026-03-04 10:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(43, 15, 'KL07BB1515', 'Visakhapatnam', 'LOADING', 'seed-script', '2026-03-04 13:00:00+00', '[SEED15] hop=0', '2026-05-23 04:44:14.12355+00'),
-- 	(44, 15, 'KL07BB1515', 'Midway-15', 'IN_TRANSIT', 'seed-script', '2026-03-04 14:00:00+00', '[SEED15] hop=1', '2026-05-23 04:44:14.12355+00'),
-- 	(45, 15, 'KL07BB1515', 'Vijayawada', 'IN_TRANSIT', 'seed-script', '2026-03-04 15:00:00+00', '[SEED15] hop=2', '2026-05-23 04:44:14.12355+00'),
-- 	(46, 16, 'AP39TA1001', 'KANNUR', 'IN_TRANSIT', 'User', '2026-05-23 04:59:54.288675+00', NULL, '2026-05-23 04:59:54.288675+00'),
-- 	(47, 16, 'AP39TA1001', 'KANNUR', 'ARRIVED_DESTINATION', 'User', '2026-05-23 05:07:36.84953+00', NULL, '2026-05-23 05:07:36.84953+00'),
-- 	(48, 17, 'AP39TA1001', 'BANGALORE', 'IN_TRANSIT', 'User', '2026-05-23 05:07:47.102437+00', NULL, '2026-05-23 05:07:47.102437+00'),
-- 	(49, 17, 'AP39TA1001', 'MUMBAI', 'IN_TRANSIT', 'User', '2026-05-23 05:08:18.496746+00', NULL, '2026-05-23 05:08:18.496746+00'),
-- 	(50, 17, 'AP39TA1001', 'BANGALORE', 'ARRIVED_DESTINATION', 'User', '2026-05-23 05:08:37.22539+00', NULL, '2026-05-23 05:08:37.22539+00'),
-- 	(51, 17, 'AP39TA1001', 'BANGALORE', 'ARRIVED_DESTINATION', 'User', '2026-05-23 05:08:37.226531+00', NULL, '2026-05-23 05:08:37.226531+00');


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- INSERT INTO "public"."vouchers" ("id", "voucher_type", "reference_id", "reference_type", "amount", "narration", "date", "financial_year", "created_at") VALUES
-- 	(1, 'cash_debit', 1, 'HIREMEMO_ADVANCE_CASH', 367.20, 'Advance cash paid for HM HM-SEED-001', '2025-04-21', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(2, 'bank_debit', 1, 'HIREMEMO_ADVANCE_BANK', 306.00, 'Advance bank paid for HM HM-SEED-001', '2025-04-21', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(3, 'cash_debit', 2, 'HIREMEMO_ADVANCE_CASH', 295.80, 'Advance cash paid for HM HM-SEED-002', '2025-05-11', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(4, 'bank_debit', 2, 'HIREMEMO_ADVANCE_BANK', 221.85, 'Advance bank paid for HM HM-SEED-002', '2025-05-11', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(5, 'cash_debit', 3, 'HIREMEMO_ADVANCE_CASH', 408.85, 'Advance cash paid for HM HM-SEED-003', '2025-05-02', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(6, 'cash_debit', 4, 'HIREMEMO_ADVANCE_CASH', 507.28, 'Advance cash paid for HM HM-SEED-004', '2025-06-15', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(7, 'cash_debit', 5, 'HIREMEMO_ADVANCE_CASH', 410.98, 'Advance cash paid for HM HM-SEED-006', '2025-08-16', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(8, 'cash_debit', 6, 'HIREMEMO_ADVANCE_CASH', 387.53, 'Advance cash paid for HM HM-SEED-007', '2025-09-10', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(9, 'bank_debit', 6, 'HIREMEMO_ADVANCE_BANK', 290.65, 'Advance bank paid for HM HM-SEED-007', '2025-09-10', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(10, 'cash_debit', 7, 'HIREMEMO_ADVANCE_CASH', 904.74, 'Advance cash paid for HM HM-SEED-009', '2025-11-19', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(11, 'bank_debit', 7, 'HIREMEMO_ADVANCE_BANK', 753.95, 'Advance bank paid for HM HM-SEED-009', '2025-11-19', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(12, 'cash_debit', 8, 'HIREMEMO_ADVANCE_CASH', 359.55, 'Advance cash paid for HM HM-SEED-010', '2024-04-13', '2024-25', '2026-05-23 04:44:14.12355+00'),
-- 	(13, 'bank_debit', 8, 'HIREMEMO_ADVANCE_BANK', 299.62, 'Advance bank paid for HM HM-SEED-010', '2024-04-13', '2024-25', '2026-05-23 04:44:14.12355+00'),
-- 	(14, 'cash_debit', 9, 'HIREMEMO_ADVANCE_CASH', 537.20, 'Advance cash paid for HM HM-SEED-011', '2024-07-23', '2024-25', '2026-05-23 04:44:14.12355+00'),
-- 	(15, 'bank_debit', 9, 'HIREMEMO_ADVANCE_BANK', 402.90, 'Advance bank paid for HM HM-SEED-011', '2024-07-23', '2024-25', '2026-05-23 04:44:14.12355+00'),
-- 	(16, 'cash_debit', 10, 'HIREMEMO_ADVANCE_CASH', 396.10, 'Advance cash paid for HM HM-SEED-012', '2024-12-31', '2024-25', '2026-05-23 04:44:14.12355+00'),
-- 	(17, 'cash_debit', 11, 'HIREMEMO_ADVANCE_CASH', 632.40, 'Advance cash paid for HM HM-SEED-013', '2023-08-11', '2023-24', '2026-05-23 04:44:14.12355+00'),
-- 	(18, 'bank_debit', 11, 'HIREMEMO_ADVANCE_BANK', 527.00, 'Advance bank paid for HM HM-SEED-013', '2023-08-11', '2023-24', '2026-05-23 04:44:14.12355+00'),
-- 	(19, 'cash_debit', 12, 'HIREMEMO_ADVANCE_CASH', 132.60, 'Advance cash paid for HM HM-SEED-014', '2022-11-20', '2022-23', '2026-05-23 04:44:14.12355+00'),
-- 	(20, 'cash_debit', 13, 'HIREMEMO_ADVANCE_CASH', 439.45, 'Advance cash paid for HM HM-SEED-015', '2026-02-21', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(21, 'bank_debit', 13, 'HIREMEMO_ADVANCE_BANK', 329.59, 'Advance bank paid for HM HM-SEED-015', '2026-02-21', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(22, 'bank_credit', 1, 'PAYMENT_RECEIPT', 591897.46, '[SEED15] Receipt from FLIPKART INDIA P LTD', '2025-11-27', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(23, 'bank_credit', 2, 'PAYMENT_RECEIPT', 3202800.00, '[SEED15] Receipt from INSTAKART SERVICES P LTD', '2025-12-16', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(24, 'bank_credit', 3, 'PAYMENT_RECEIPT', 1862214.00, '[SEED15] Receipt from FLIPKART INDIA P LTD', '2025-12-16', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(25, 'bank_credit', 4, 'PAYMENT_RECEIPT', 1411.20, '[SEED15] Receipt from HAVELLS INDIA LTD, SRICITY', '2025-05-20', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(26, 'bank_credit', 5, 'PAYMENT_RECEIPT', 937.86, '[SEED15] Receipt from SURYA ELECTRICALS, CHENNAI', '2025-06-09', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(27, 'bank_credit', 6, 'PAYMENT_RECEIPT', 1381.80, '[SEED15] Receipt from FLYJAC LOGISTICS P LTD, CHENNAI', '2024-05-12', '2024-25', '2026-05-23 04:44:14.12355+00'),
-- 	(28, 'bank_credit', 7, 'PAYMENT_RECEIPT', 1703.24, '[SEED15] Receipt from FLYJAC LOGISTICS P LTD, CHENNAI', '2024-08-21', '2024-25', '2026-05-23 04:44:14.12355+00'),
-- 	(29, 'bank_credit', 8, 'PAYMENT_RECEIPT', 2430.40, '[SEED15] Receipt from HAVELLS INDIA LTD, SRICITY', '2023-09-09', '2023-24', '2026-05-23 04:44:14.12355+00'),
-- 	(30, 'bank_credit', 9, 'PAYMENT_RECEIPT', 1393.32, '[SEED15] Receipt from SURYA ELECTRICALS, CHENNAI', '2026-03-22', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(31, 'cash_debit', 1, 'SEED_MANUAL', 2500.00, '[SEED15] petty cash expense', '2025-06-01', '2025-26', '2026-05-23 04:44:14.12355+00'),
-- 	(32, 'cash_debit', 15, 'HIREMEMO_ADVANCE_CASH', 200.00, 'Advance cash paid for HM 2', '2026-05-23', '2026-27', '2026-05-23 05:23:26.870124+00'),
-- 	(33, 'bank_debit', 15, 'HIREMEMO_ADVANCE_BANK', 100.00, 'Advance bank paid for HM 2', '2026-05-23', '2026-27', '2026-05-23 05:23:26.870124+00');


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."audit_log_id_seq"', 18, true);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."cities_id_seq"', 32, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."clients_id_seq"', 8, true);


--
-- Name: contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."contracts_id_seq"', 15, true);


--
-- Name: eway_bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."eway_bills_id_seq"', 16, true);


--
-- Name: file_uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."file_uploads_id_seq"', 14, true);


--
-- Name: hirememos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."hirememos_id_seq"', 15, true);


--
-- Name: invoice_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."invoice_lines_id_seq"', 12, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."invoices_id_seq"', 12, true);


--
-- Name: lr_deductions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."lr_deductions_id_seq"', 1, false);


--
-- Name: lrs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."lrs_id_seq"', 17, true);


--
-- Name: payment_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."payment_receipts_id_seq"', 10, true);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."templates_id_seq"', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."users_id_seq"', 1, false);


--
-- Name: vehicle_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."vehicle_locations_id_seq"', 51, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."vehicles_id_seq"', 15, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."vendors_id_seq"', 15, true);


--
-- Name: vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('"public"."vouchers_id_seq"', 33, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 85e91yhSmuCz3uJDFVK6uS8vdfv1bVMkdIx5XrSwz352Zgp0HUfy7eGVaSBNblD

RESET ALL;
