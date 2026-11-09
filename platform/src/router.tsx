import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedLayout } from '@/shared/components/layout/ProtectedLayout'
import LoginPage from '@/features/auth/screens/LoginPage'
import DashboardPage from '@/features/dashboard/screens/DashboardPage'
import AppointmentsPage from '@/features/appointments/screens/AppointmentsPage'
import SchedulesPage from '@/features/schedules/screens/SchedulesPage'
import UsersPage from '@/features/users/screens/UsersPage'
import SurveysPage from '@/features/surveys/screens/SurveysPage'
import JournalsPage from '@/features/journals/screens/JournalsPage'
import ProfilePage from '@/features/profile/screens/ProfilePage'
import GeneralSettingsPage from '@/features/settings/screens/GeneralSettingsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'appointments',
        element: <AppointmentsPage />,
      },
      {
        path: 'appointments/:id',
        element: <AppointmentsPage />,
      },
      {
        path: 'schedules',
        element: <SchedulesPage />,
      },
      {
        path: 'schedules/:id',
        element: <SchedulesPage />,
      },
      {
        path: 'trainees',
        element: <UsersPage />,
      },
      {
        path: 'trainees/:id',
        element: <UsersPage />,
      },
      {
        path: 'surveys',
        element: <SurveysPage />,
      },
      {
        path: 'surveys/:id',
        element: <SurveysPage />,
      },
      {
        path: 'journals',
        element: <JournalsPage />,
      },
      {
        path: 'journals/:id',
        element: <JournalsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <GeneralSettingsPage />,
      },
    ],
  },
])
