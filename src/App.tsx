import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const ax = (el: React.ReactNode) => <AxLayout>{el}</AxLayout>

export default function App() {
  const { setRole, role } = useDemo()
  return (
    <TourProvider onRole={setRole} role={role}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={ax(<Dashboard />)} />
        <Route path="/today" element={ax(<TodayAx />)} />
        <Route path="/schedule" element={ax(<Schedule />)} />
        <Route path="/sites" element={ax(<Sites />)} />
        <Route path="/sites/:id" element={ax(<SiteDetail />)} />
        <Route path="/work" element={ax(<Work />)} />
        <Route path="/team" element={ax(<Team />)} />
        <Route path="/customers" element={ax(<Customers />)} />
        <Route path="/customers/:id" element={ax(<CustomerDetail />)} />
        <Route path="/requests" element={ax(<Requests />)} />
        <Route path="/quality" element={ax(<Quality />)} />
        <Route path="/renewals" element={ax(<Renewals />)} />
        <Route path="/upsell" element={ax(<Upsell />)} />
        <Route path="/profitability" element={ax(<Profitability />)} />
        <Route path="/ai" element={ax(<AiCenter />)} />
        <Route path="/evidence" element={ax(<Evidence />)} />
        <Route path="/why-ax" element={ax(<WhyAx />)} />
        <Route path="/settings" element={ax(<SettingsPage />)} />
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/field" element={<FieldApp />} />
        <Route path="/care" element={<CareLanding />} />
        <Route path="/care/home" element={<CareHome />} />
        <Route path="/care/reports" element={<CareReports />} />
        <Route path="/care/requests" element={<CareRequests />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TourProvider>
  )
}
