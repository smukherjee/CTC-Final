# Exception Flows (Draft)

## DR/LR/HireMemo
- All field changes are audited (user, timestamp, old/new value)
- On failed upload: show error, allow retry, log failure
- On contract expiry: block new entries, show alert

## Invoice
- On missing POD: block invoice generation, show error
- On duplicate invoice: show error, prevent save

## E-way Bill
- On expiry: show alert, block dispatch if not renewed

## General
- On permission denied: show error, log attempt
- On audit log error: show error, escalate to admin
