import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import AppointmentsPage from '@/pages/AppointmentsPage'
import SchedulesPage from '@/pages/SchedulesPage'
import UsersPage from '@/pages/UsersPage'
import SurveysPage from '@/pages/SurveysPage'
import JournalsPage from '@/pages/JournalsPage'
import ProfilePage from '@/pages/ProfilePage'

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
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'users/:id',
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
    ],
  },
])
