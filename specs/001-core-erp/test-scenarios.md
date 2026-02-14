# End-to-End Test Scenarios (Draft)

1. **Full Dispatch to Payment Cycle**
   - Create LR → Dispatch Register → Hire Memo → POD Upload → Invoice Generation → Payment Recording
2. **Contract Expiry Alert**
   - Create contract with near expiry → Receive alert → Block new entries post-expiry
3. **File Upload Failure and Retry**
   - Attempt invalid file upload (wrong type/size) → Show error → Retry with valid file
4. **E-way Bill Expiry Alert**
   - Create E-way Bill with near expiry → Receive alert → Block dispatch if expired
5. **Duplicate Invoice Prevention**
   - Attempt to create invoice for same LR twice → Show error, prevent save
6. **Role-Based Access**
   - Dispatcher creates LR, Accounts generates invoice, Admin audits logs
7. **Audit Log Verification**
   - Edit LR/HireMemo fields → Verify audit log entries for all changes
8. **Vendor TDS Certificate Upload**
   - Upload TDS certificate for vendor → Validate file type/size → Link to vendor record
9. **Parallel Run**
   - Enter data in both legacy and new system → Compare outputs for consistency
10. **Exception Handling**
    - Simulate system error (e.g., DB down) → Show user-friendly error, log incident
