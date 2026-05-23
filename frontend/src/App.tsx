import { lazy, Suspense, Component, type ReactNode } from 'react';
import ToastContainer from '@/components/ui/ToastContainer';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const AppLayout = lazy(() => import('@/layouts/AppLayout'));
const DispatchRegister = lazy(() => import('@/features/operations/DispatchRegister'));
const CreateLR = lazy(() => import('@/features/operations/CreateLR'));
const HireMemo = lazy(() => import('@/features/hirememo/HireMemo'));
const HireMemoRegister = lazy(() => import('@/features/hirememo/HireMemoRegister'));
const VehicleTracking = lazy(() => import('@/features/tracking/VehicleTracking'));
const TrackingLog = lazy(() => import('@/features/tracking/TrackingLog'));
const ClientMaster = lazy(() => import('@/features/client/ClientMaster'));
const VendorMaster = lazy(() => import('@/features/vendor/VendorMaster'));
const VehicleMaster = lazy(() => import('@/features/vehicle/VehicleMaster'));
const ContractMaster = lazy(() => import('@/features/contract/ContractMaster'));
const UserMaster = lazy(() => import('@/features/user/UserMaster'));
const TemplateMaster = lazy(() => import('@/features/template/TemplateMaster'));
const CityMaster = lazy(() => import('@/features/city/CityMaster'));
const BillBook = lazy(() => import('@/features/finance/BillBook'));
const InvoiceForm = lazy(() => import('@/features/finance/InvoiceForm'));
const PaymentReceiptsRegister = lazy(() => import('@/features/finance/PaymentReceiptsRegister'));
const LedgerBook = lazy(() => import('@/features/finance/LedgerBook'));
const PODManagement = lazy(() => import('@/features/operations/PODManagement'));
const Reports = lazy(() => import('@/features/reports/Reports'));

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>404 — Page not found</h2>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <BrowserRouter>
        <Suspense fallback={<div style={{ padding: '2rem' }}>Loading…</div>}>
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
                <Route path="invoices/:invoiceId/edit" element={<InvoiceForm />} />
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

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
