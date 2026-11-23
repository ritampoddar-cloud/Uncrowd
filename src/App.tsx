import { WorkspaceShell } from './components/WorkspaceShell';
import { SystemProvider, useSystem } from './context/SystemContext';
import { AdminZonesPage } from './pages/AdminZonesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuthorityDashboardPage } from './pages/AuthorityDashboardPage';
import { ClearancePage } from './pages/ClearancePage';
import { GovernancePage } from './pages/GovernancePage';
import { OverviewPage } from './pages/OverviewPage';
import { ParkingLocatorPage } from './pages/ParkingLocatorPage';
import { ReportParkingPage } from './pages/ReportParkingPage';
import { RoadMapPage } from './pages/RoadMapPage';

function PageRouter() {
  const { currentPage } = useSystem();

  switch (currentPage) {
    case 'overview':
      return <OverviewPage />;
    case 'road-map':
      return <RoadMapPage />;
    case 'parking-locator':
      return <ParkingLocatorPage />;
    case 'report-parking':
      return <ReportParkingPage />;
    case 'clearance':
      return <ClearancePage />;
    case 'authority-dashboard':
      return <AuthorityDashboardPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'admin-zones':
      return <AdminZonesPage />;
    case 'governance':
      return <GovernancePage />;
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  return (
    <SystemProvider>
      <WorkspaceShell>
        <PageRouter />
      </WorkspaceShell>
    </SystemProvider>
  );
}
