# Master Field Dictionary

| Field Name         | Entity         | Data Type   | Description/Notes |
|--------------------|---------------|------------|-------------------|
| lr_number          | LorryReceipt  | string     | Unique LR number  |
| date               | LorryReceipt  | date       | Date of LR        |
| month              | LorryReceipt  | string     | Month (derived)   |
| consignor_id       | Customer      | string/ref | Consignor client   |
| consignee_id       | Customer      | string/ref | Consignee client   |
| articles_count     | LorryReceipt  | integer    | Number of articles|
| description        | LorryReceipt  | string     | Goods description |
| vehicle_type       | Vehicle       | string     | Type of vehicle   |
| vehicle_number     | Vehicle       | string     | Vehicle number    |
| origin             | LorryReceipt  | string     | Origin location   |
| destination        | LorryReceipt  | string     | Destination       |
| fob                | LorryReceipt  | string     | Free on board     |
| through_id         | LorryReceipt  | integer/ref| Through vendor id |
| through            | LorryReceipt  | string     | Through vendor name snapshot |
| remarks            | LorryReceipt  | string     | Remarks           |
| reported_on        | LorryReceipt  | date       | Reported on date  |
| hire_memo_no       | HireMemo      | string     | Hire Memo number  |
| branch             | HireMemo      | string     | Branch name       |
| driver_name        | HireMemo      | string     | Driver name       |
| freight_rate       | HireMemo      | decimal    | Rate per unit     |
| total_amount       | HireMemo      | decimal    | Freight to pay    |
| freight_weight     | HireMemo      | decimal    | Weight for calc   |
| advance_cash       | HireMemo      | decimal    | Less part payment |
| advance_bank       | HireMemo      | decimal    | Bank advance      |
| balance            | HireMemo      | decimal    | Balance amount    |
| driver_signature   | HireMemo      | string     | Driver signature  |
| driver_license     | HireMemo      | string     | License number    |
| deduction_reason   | HireMemo      | string     | Deduction reason  |
| invoice_no         | Invoice       | string     | Invoice number    |
| invoice_date       | Invoice       | date       | Invoice date      |
| bill_to_id         | Customer      | string/ref | Bill to client     |
| gstin              | client/Vendor  | string     | GST number        |
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
| seal_number        | LorryReceipt  | string     | Seal number       |
