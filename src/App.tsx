import { Suspense, useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { TourProvider } from './components/tour/TourProvider'
import { useDemo } from './lib/data/context'
import AxLayout from './components/layout/AxLayout'
import { ErrorBoundary } from './components/system/ErrorBoundary'
import { PageFallback } from './components/system/PageFallback'
import { lazyPage, preloadAllPages } from './lib/lazyPage'
import { titleFor } from './lib/routeTitles'

// 화면 단위 코드 분할 — 각 화면은 처음 열 때(또는 한가할 때 미리) 따로 받는다
const Dashboard = lazyPage(() => import('./pages/ax/Dashboard'))
const TodayAx = lazyPage(() => import('./pages/ax/TodayAx'))
const Schedule = lazyPage(() => import('./pages/ax/Schedule'))
const Sites = lazyPage(() => import('./pages/ax/Sites'))
const SiteDetail = lazyPage(() => import('./pages/ax/SiteDetail'))
const Work = lazyPage(() => import('./pages/ax/Work'))
const Team = lazyPage(() => import('./pages/ax/Team'))
const Customers = lazyPage(() => import('./pages/ax/Customers'))
const CustomerDetail = lazyPage(() => import('./pages/ax/CustomerDetail'))
const Requests = lazyPage(() => import('./pages/ax/Requests'))
const Quality = lazyPage(() => import('./pages/ax/Quality'))
const Renewals = lazyPage(() => import('./pages/ax/Renewals'))
const Upsell = lazyPage(() => import('./pages/ax/Upsell'))
const Profitability = lazyPage(() => import('./pages/ax/Profitability'))
const AiCenter = lazyPage(() => import('./pages/ax/AiCenter'))
const Evidence = lazyPage(() => import('./pages/ax/Evidence'))
const WhyAx = lazyPage(() => import('./pages/ax/WhyAx'))
const SettingsPage = lazyPage(() => import('./pages/ax/SettingsPage'))
const Presentation = lazyPage(() => import('./pages/ax/Presentation'))
const FieldApp = lazyPage(() => import('./pages/field/FieldApp'))
const CareLanding = lazyPage(() => import('./pages/care/CareLanding'))
const CareHome = lazyPage(() => import('./pages/care/CareHome'))
const CareReports = lazyPage(() => import('./pages/care/CareReports'))
const CareRequests = lazyPage(() => import('./pages/care/CareRequests'))
const NotFound = lazyPage(() => import('./pages/NotFound'))

/** 화면 이동 시 맨 위로 + 탭 제목 갱신 */
function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = titleFor(pathname)
  }, [pathname])
  useEffect(() => { preloadAllPages() }, [])
  return null
}

/** AX 본문 — 사이드바·헤더는 유지한 채 본문만 불러오기·오류 처리 */
function AxOutlet() {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageFallback />}><Outlet /></Suspense>
    </ErrorBoundary>
  )
}

/** AX 밖 화면(고객 플랫폼 · 현장 앱 · 시연) — 자체 셸을 가지므로 전체 화면 자리표시 */
function StandaloneOutlet() {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageFallback full />}><Outlet /></Suspense>
    </ErrorBoundary>
  )
}


export default function App() {
  const { setRole, role } = useDemo()
  return (
    <TourProvider onRole={setRole} role={role}>
      <RouteEffects />
      <Routes>
        {/* AX 화면은 하나의 레이아웃을 공유 — 화면을 옮겨도 사이드바·헤더가 다시 그려지지 않는다 */}
        <Route element={<AxLayout><AxOutlet /></AxLayout>}>
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
        <Route element={<StandaloneOutlet />}>
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/field" element={<FieldApp />} />
          <Route path="/care" element={<CareLanding />} />
          <Route path="/care/home" element={<CareHome />} />
          <Route path="/care/reports" element={<CareReports />} />
          <Route path="/care/requests" element={<CareRequests />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </TourProvider>
  )
}
