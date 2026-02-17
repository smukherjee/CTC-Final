import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DispatchRegister from '@/features/operations/DispatchRegister';
import CreateLR from '@/features/operations/CreateLR';
import HireMemo from '@/features/hirememo/HireMemo';
import PartyMaster from '@/features/party/PartyMaster';
import VendorMaster from '@/features/vendor/VendorMaster';
import VehicleMaster from '@/features/vehicle/VehicleMaster';
import ContractMaster from '@/features/contract/ContractMaster';
import UserMaster from '@/features/user/UserMaster';
import TemplateMaster from '@/features/template/TemplateMaster';
import CityMaster from '@/features/city/CityMaster';

function App() {
  console.log("App component rendering!"); // Debug log

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/operations/dispatch" replace />} />

          <Route path="operations">
            <Route path="dispatch" element={<DispatchRegister />} />
            <Route path="create-lr" element={<CreateLR />} />
            <Route path="lr/:lrId" element={<CreateLR />} />
            <Route path="hirememo" element={<HireMemo />} />
          </Route>

          <Route path="finance">
            <Route path="pod-verify" element={<div>POD Verify</div>} />
            <Route path="invoices" element={<div>Invoices</div>} />
          </Route>

          <Route path="masters">
            <Route path="parties" element={<PartyMaster />} />
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
