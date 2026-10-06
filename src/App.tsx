import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { TourProvider } from './components/tour/TourProvider'
import { useDemo } from './lib/data/store'
import AxLayout from './components/layout/AxLayout'
import Dashboard from './pages/ax/Dashboard'
import TodayAx from './pages/ax/TodayAx'
import Schedule from './pages/ax/Schedule'
import Sites from './pages/ax/Sites'
import SiteDetail from './pages/ax/SiteDetail'
import Work from './pages/ax/Work'
import Team from './pages/ax/Team'
import Customers from './pages/ax/Customers'
import CustomerDetail from './pages/ax/CustomerDetail'
import Requests from './pages/ax/Requests'
import Quality from './pages/ax/Quality'
import Renewals from './pages/ax/Renewals'
import Upsell from './pages/ax/Upsell'
import Profitability from './pages/ax/Profitability'
import AiCenter from './pages/ax/AiCenter'
import Evidence from './pages/ax/Evidence'
import WhyAx from './pages/ax/WhyAx'
import SettingsPage from './pages/ax/SettingsPage'
import Presentation from './pages/ax/Presentation'
import FieldApp from './pages/field/FieldApp'
import CareLanding from './pages/care/CareLanding'
import CareHome from './pages/care/CareHome'
import CareReports from './pages/care/CareReports'
import CareRequests from './pages/care/CareRequests'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}


export default function App() {
  const { setRole, role } = useDemo()
  return (
    <TourProvider onRole={setRole} role={role}>
      <ScrollToTop />
      <Routes>
        {/* AX 화면은 하나의 레이아웃을 공유 — 화면을 옮겨도 사이드바·헤더가 다시 그려지지 않는다 */}
        <Route element={<AxLayout><Outlet /></AxLayout>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<TodayAx />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/sites/:id" element={<SiteDetail />} />
          <Route path="/work" element={<Work />} />
          <Route path="/team" element={<Team />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/quality" element={<Quality />} />
          <Route path="/renewals" element={<Renewals />} />
          <Route path="/upsell" element={<Upsell />} />
          <Route path="/profitability" element={<Profitability />} />
          <Route path="/ai" element={<AiCenter />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/why-ax" element={<WhyAx />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/field" element={<FieldApp />} />
        <Route path="/care" element={<CareLanding />} />
        <Route path="/care/home" element={<CareHome />} />
        <Route path="/care/reports" element={<CareReports />} />
        <Route path="/care/requests" element={<CareRequests />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TourProvider>
  )
}
