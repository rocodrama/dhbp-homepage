import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Pending from './pages/Pending'
import Home from './pages/Home'
import ManualList from './pages/manual/ManualList'
import ManualForm from './pages/manual/ManualForm'
import ManualDetail from './pages/manual/ManualDetail'
import LunchMap from './pages/lunchmap/LunchMap'
import BoardList from './pages/board/BoardList'
import BoardForm from './pages/board/BoardForm'
import BoardDetail from './pages/board/BoardDetail'
import EquipmentList from './pages/equipment/EquipmentList'
import CalendarPage from './pages/calendar/CalendarPage'
import Timetable from './pages/timetable/Timetable'
import TaskList from './pages/tasks/TaskList'
import Game from './pages/game/Game'
import Complaints from './pages/complaints/ComplaintsPage'
import UserManagement from './pages/admin/UserManagement'
import More from './pages/More'

export default function App() {
  const { user, isApproved, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  if (!isApproved) {
    return (
      <Routes>
        <Route path="*" element={<Pending />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/manual" element={<ManualList />} />
        <Route path="/manual/new" element={<ManualForm />} />
        <Route path="/manual/:id" element={<ManualDetail />} />
        <Route path="/lunch-map" element={<LunchMap />} />
        <Route path="/board" element={<BoardList />} />
        <Route path="/board/new" element={<BoardForm />} />
        <Route path="/board/:id" element={<BoardDetail />} />
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/checklist" element={<TaskList />} />
        <Route path="/game" element={<Game />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/more" element={<More />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
