import React, {lazy} from 'react'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const StatisticPage = lazy(() => import('./pages/Statistic'))

type AppRoute = {
    path: string;
    element: React.ReactNode;
    name: string; // Needed for Navbar search
    description: string; // Needed for Navbar search
};

export const routes: AppRoute[] = [
    {
        path: '/',
        element: <Login />,
        name: 'Home',
        description: 'Home page',
    },
    {
        path: '/login',
        element: <Login />,
        name: 'Login',
        description: 'Login page',
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
        name: 'Dashboard',
        description: 'Dashboard page',
    },
    {
        path: '/statistic',
        element: <StatisticPage />,
        name: 'Statistic',
        description: 'Statistic page',
    },
]