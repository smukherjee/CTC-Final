import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DispatchRegister from '@/features/operations/DispatchRegister';
import CreateLR from '@/features/operations/CreateLR';
import PartyMaster from '@/features/party/PartyMaster';
import VendorMaster from '@/features/vendor/VendorMaster';

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
          </Route>

          <Route path="finance">
            <Route path="pod-verify" element={<div>POD Verify</div>} />
            <Route path="invoices" element={<div>Invoices</div>} />
          </Route>

          <Route path="masters">
            <Route path="parties" element={<PartyMaster />} />
            <Route path="vendors" element={<VendorMaster />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
