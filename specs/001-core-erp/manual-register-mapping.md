# Legacy Field to New Data Model Mapping Table

This table maps fields from legacy documents (Dispatch Register, Hire Memo, Invoice, Lorry Receipt) to the new system's entities, with data types and notes.

| Legacy Field                | New Entity      | New Field Name         | Data Type   | Required | Notes |
|-----------------------------|-----------------|------------------------|-------------|----------|-------|
| LR.NO                       | LorryReceipt    | lr_no                  | string      | Yes      | Unique, appears in multiple docs |
| DATE                        | LorryReceipt    | date                   | date        | Yes      | |
| MONTH                       | LorryReceipt    | month                  | string      | No       | Derived from date |
| CONSIGNOR                   | Customer        | consignor_id           | string/ref  | Yes      | Foreign key to Customer master |
| CONSIGNEE                   | Customer        | consignee_id           | string/ref  | Yes      | Foreign key to Customer master |
| NO. OF ARTICLES             | LorryReceipt    | num_articles           | integer     | Yes      | |
| DESCRIPTION                 | LorryReceipt    | description            | string      | Yes      | Description of goods |
| TYPE OF VEHICLE             | Vehicle         | vehicle_type           | string      | Yes      | |
| VEHICLE NO.                 | Vehicle         | vehicle_no             | string      | Yes      | Foreign key to Vehicle master |
| ORIGIN                      | LorryReceipt    | origin                 | string      | Yes      | |
| DESTINATION                 | LorryReceipt    | destination            | string      | Yes      | |
| FOB                         | LorryReceipt    | fob                    | string      | No       | |
| THROUGH BILL NO             | LorryReceipt    | through_bill_no        | string      | No       | |
| REMARKS                     | LorryReceipt    | remarks                | string      | No       | |
| REPORTED ON                 | LorryReceipt    | reported_on            | date        | No       | |
| Hire Memo No.               | HireMemo        | hire_memo_no           | string      | Yes      | Unique |
| Branch                      | HireMemo        | branch                 | string      | Yes      | |
| Lorry No.                   | Vehicle         | vehicle_no             | string      | Yes      | |
| Driver Name                 | HireMemo        | driver_name            | string      | Yes      | |
| Rate                        | HireMemo        | rate                   | decimal     | Yes      | |
| Freight to be paid          | HireMemo        | freight_to_be_paid     | decimal     | Yes      | |
| For Weight                  | HireMemo        | for_weight             | decimal     | No       | |
| Less Part Payment           | HireMemo        | less_part_payment      | decimal     | No       | |
| Balance                     | HireMemo        | balance                | decimal     | No       | |
| Total Amount Rs.            | HireMemo        | total_amount           | decimal     | Yes      | |
| Signature of Driver/Owner   | HireMemo        | driver_signature       | string      | No       | |
| Lie. No. (License No.)      | HireMemo        | license_no             | string      | No       | |
| Deduct Rs on account of     | HireMemo        | deduction_reason       | string      | No       | |
| Invoice No                  | Invoice         | invoice_no             | string      | Yes      | Unique |
| Invoice Date                | Invoice         | invoice_date           | date        | Yes      | |
| BILL TO (consignee details) | Customer        | bill_to_id             | string/ref  | Yes      | Foreign key to Customer master |
| GST NO                      | Customer        | gst_no                 | string      | Yes      | |
| PARTICULARS                 | Invoice         | particulars            | string      | Yes      | |
| VEHICLE TYPE                | Vehicle         | vehicle_type           | string      | Yes      | |
| AMOUNT                      | Invoice         | amount                 | decimal     | Yes      | |
| CGNR (Consignor)            | Customer        | consignor_id           | string/ref  | Yes      | |
| CGNEE (Consignee)           | Customer        | consignee_id           | string/ref  | Yes      | |
| TOTAL                       | Invoice         | total                  | decimal     | Yes      | |
| RUPEES (amount in words)    | Invoice         | amount_words           | string      | No       | |
| HSN CODE                    | Invoice         | hsn_code               | string      | No       | |
| TAX PAYABLE ON REVERSE CHARGES | Invoice     | reverse_charge         | boolean     | No       | |
| BANK DETAIL                 | Invoice         | bank_detail            | string      | No       | |
| IFSC Code                   | Invoice         | ifsc_code              | string      | No       | |
| Ac No.                      | Invoice         | account_no             | string      | No       | |
| S NO                        | InvoiceAnnexure | serial_no              | integer     | Yes      | |
| QTY                         | LorryReceipt    | quantity               | decimal     | Yes      | |
| FROM                        | LorryReceipt    | origin                 | string      | Yes      | |
| TO                          | LorryReceipt    | destination            | string      | Yes      | |
| FREIGHT                     | InvoiceAnnexure | freight                | decimal     | Yes      | |
| UNLOADING CHARGES           | InvoiceAnnexure | unloading_charges      | decimal     | No       | |
| PLACED ON                   | LorryReceipt    | placed_on              | date        | No       | |
| LOADED ON                   | LorryReceipt    | loaded_on              | date        | No       | |
| LOADING DETENTION CHARGES   | InvoiceAnnexure | loading_detention      | decimal     | No       | |
| UNLOADED ON                 | LorryReceipt    | unloaded_on            | date        | No       | |
| UNLOADING DETENTION CHARGES | InvoiceAnnexure | unloading_detention    | decimal     | No       | |
| OTHER CHARGES               | InvoiceAnnexure | other_charges          | decimal     | No       | |
| Value Rs.                   | LorryReceipt    | value_rs               | decimal     | No       | |
| Surcharge                   | LorryReceipt    | surcharge              | decimal     | No       | |
| Hamali Charges              | LorryReceipt    | hamali_charges         | decimal     | No       | |
| St. Charges                 | LorryReceipt    | st_charges             | decimal     | No       | |
| Box                         | LorryReceipt    | box                    | string      | No       | |
| SEAL No.                    | LorryReceipt    | seal_no                | string      | No       | |

*This table can be extended as new fields/entities are identified.*

---

## Next Steps
- Review and confirm the mapping table.
- Update the checklist: Mark CHK003 (field mapping) and CHK005 (field definitions) as satisfied if this covers all required fields.
- For any missing fields or entities, please specify and I will update the table.
