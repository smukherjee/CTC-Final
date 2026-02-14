# Master Field Dictionary

| Field Name         | Entity         | Data Type   | Description/Notes |
|--------------------|---------------|------------|-------------------|
| lr_no              | LorryReceipt  | string     | Unique LR number  |
| date               | LorryReceipt  | date       | Date of LR        |
| month              | LorryReceipt  | string     | Month (derived)   |
| consignor_id       | Customer      | string/ref | Consignor party   |
| consignee_id       | Customer      | string/ref | Consignee party   |
| num_articles       | LorryReceipt  | integer    | Number of articles|
| description        | LorryReceipt  | string     | Goods description |
| vehicle_type       | Vehicle       | string     | Type of vehicle   |
| vehicle_no         | Vehicle       | string     | Vehicle number    |
| origin             | LorryReceipt  | string     | Origin location   |
| destination        | LorryReceipt  | string     | Destination       |
| fob                | LorryReceipt  | string     | Free on board     |
| through_bill_no    | LorryReceipt  | string     | Through bill no   |
| remarks            | LorryReceipt  | string     | Remarks           |
| reported_on        | LorryReceipt  | date       | Reported on date  |
| hire_memo_no       | HireMemo      | string     | Hire Memo number  |
| branch             | HireMemo      | string     | Branch name       |
| driver_name        | HireMemo      | string     | Driver name       |
| rate               | HireMemo      | decimal    | Rate per unit     |
| freight_to_be_paid | HireMemo      | decimal    | Freight to pay    |
| for_weight         | HireMemo      | decimal    | Weight for calc   |
| less_part_payment  | HireMemo      | decimal    | Less part payment |
| balance            | HireMemo      | decimal    | Balance amount    |
| total_amount       | HireMemo      | decimal    | Total amount      |
| driver_signature   | HireMemo      | string     | Driver signature  |
| license_no         | HireMemo      | string     | License number    |
| deduction_reason   | HireMemo      | string     | Deduction reason  |
| invoice_no         | Invoice       | string     | Invoice number    |
| invoice_date       | Invoice       | date       | Invoice date      |
| bill_to_id         | Customer      | string/ref | Bill to party     |
| gst_no             | Customer      | string     | GST number        |
| particulars        | Invoice       | string     | Invoice details   |
| amount             | Invoice       | decimal    | Invoice amount    |
| total              | Invoice       | decimal    | Invoice total     |
| amount_words       | Invoice       | string     | Amount in words   |
| hsn_code           | Invoice       | string     | HSN code          |
| reverse_charge     | Invoice       | boolean    | Reverse charge    |
| bank_detail        | Invoice       | string     | Bank details      |
| ifsc_code          | Invoice       | string     | IFSC code         |
| account_no         | Invoice       | string     | Account number    |
| serial_no          | InvoiceAnnexure| integer   | Serial number     |
| quantity           | LorryReceipt  | decimal    | Quantity          |
| placed_on          | LorryReceipt  | date       | Placed on date    |
| loaded_on          | LorryReceipt  | date       | Loaded on date    |
| loading_detention  | InvoiceAnnexure| decimal   | Loading detention |
| unloaded_on        | LorryReceipt  | date       | Unloaded on date  |
| unloading_detention| InvoiceAnnexure| decimal   | Unloading detention|
| other_charges      | InvoiceAnnexure| decimal   | Other charges     |
| value_rs           | LorryReceipt  | decimal    | Value in Rs.      |
| surcharge          | LorryReceipt  | decimal    | Surcharge         |
| hamali_charges     | LorryReceipt  | decimal    | Hamali charges    |
| st_charges         | LorryReceipt  | decimal    | St. charges       |
| box                | LorryReceipt  | string     | Box info          |
| seal_no            | LorryReceipt  | string     | Seal number       |
