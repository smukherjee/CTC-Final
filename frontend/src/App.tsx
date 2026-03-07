import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DispatchRegister from '@/features/operations/DispatchRegister';
import CreateLR from '@/features/operations/CreateLR';
import HireMemo from '@/features/hirememo/HireMemo';
import HireMemoRegister from '@/features/hirememo/HireMemoRegister';
import VehicleTracking from '@/features/tracking/VehicleTracking';
import TrackingLog from '@/features/tracking/TrackingLog';
import ClientMaster from '@/features/client/ClientMaster';
import VendorMaster from '@/features/vendor/VendorMaster';
import VehicleMaster from '@/features/vehicle/VehicleMaster';
import ContractMaster from '@/features/contract/ContractMaster';
import UserMaster from '@/features/user/UserMaster';
import TemplateMaster from '@/features/template/TemplateMaster';
import CityMaster from '@/features/city/CityMaster';
import BillBook from '@/features/finance/BillBook';
import InvoiceForm from '@/features/finance/InvoiceForm';
import PaymentReceiptsRegister from '@/features/finance/PaymentReceiptsRegister';
import LedgerBook from '@/features/finance/LedgerBook';
import PODManagement from '@/features/pod/PODManagement';
import Reports from '@/features/reports/Reports';
/* dashboard page not used after navigation change */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/operations/dispatch" replace />} />
          {/* dashboard route removed - users now start on dispatch register */}
          <Route path="pod" element={<PODManagement />} />
          <Route path="hire-memo-register" element={<Navigate to="/operations/hire-memo-register" replace />} />

          <Route path="operations">
            <Route path="dispatch" element={<DispatchRegister />} />
            <Route path="create-lr" element={<CreateLR />} />
            <Route path="lr/:lrId" element={<CreateLR />} />
            <Route path="hirememo" element={<HireMemo />} />
            <Route path="hire-memo-register" element={<HireMemoRegister />} />
            <Route path="tracking" element={<VehicleTracking />} />
            <Route path="tracking-log" element={<TrackingLog />} />
          </Route>

          <Route path="finance">
            <Route path="pod-verify" element={<Navigate to="/pod" replace />} />
            <Route path="invoices" element={<BillBook />} />
            <Route path="invoices/new" element={<InvoiceForm />} />
            <Route path="payment-receipts" element={<PaymentReceiptsRegister />} />
            <Route path="vouchers" element={<LedgerBook />} />
          </Route>

          <Route path="reports" element={<Reports />} />

          <Route path="masters">
            <Route path="clients" element={<ClientMaster />} />
            <Route path="vendors" element={<VendorMaster />} />
            <Route path="vehicles" element={<VehicleMaster />} />
            <Route path="contracts" element={<ContractMaster />} />
            <Route path="users" element={<UserMaster />} />
            <Route path="templates" element={<TemplateMaster />} />
            <Route path="cities" element={<CityMaster />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
