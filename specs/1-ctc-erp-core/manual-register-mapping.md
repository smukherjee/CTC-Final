# Manual Register Field Mapping: CTC-ERP

## Purpose
To ensure a smooth transition from manual registers to the CTC-ERP system, each field in the legacy registers must be mapped to its equivalent in the new data model. This mapping supports data migration, user training, and system validation.

## Registers to be Mapped
- Day Book
- Dispatch Register
- Hire Memo (Bhada Parchi)
- Bill Notebook
- Bank/Cash Books

## Mapping Table Example
| Manual Register      | Field Name           | CTC-ERP Entity      | CTC-ERP Field         |
|---------------------|---------------------|---------------------|-----------------------|
| Day Book            | Date                | Order/LR            | orderDate / lrDate    |
| Day Book            | Consignor           | Consignor           | name                  |
| Dispatch Register   | Vehicle No          | Vehicle             | vehicleNumber         |
| Hire Memo           | Broker Name         | Supplier/Broker     | brokerName            |
| Bill Notebook       | Invoice No          | Invoice             | invoiceNumber         |
| Bank/Cash Books     | Payment Date        | Voucher             | paymentDate           |
| ...                 | ...                 | ...                 | ...                   |

## Action Items
- Complete the mapping for all fields in each register.
- Validate that all critical data is captured in the new system.
- Use this mapping for migration scripts and user documentation.

## Acceptance Criteria
- Every field in the manual registers is mapped to a CTC-ERP entity/field or marked as obsolete.
- Mapping is reviewed and approved by business stakeholders.
- Mapping is used for migration and training materials.
