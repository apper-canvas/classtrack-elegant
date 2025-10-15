import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all pages
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Students = lazy(() => import("@/components/pages/Students"));
const Classes = lazy(() => import("@/components/pages/Classes"));
const Grades = lazy(() => import("@/components/pages/Grades"));
const Attendance = lazy(() => import("@/components/pages/Attendance"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Suspense wrapper component
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="text-lg">Loading.....</div></div>}>
    {children}
  </Suspense>
);

// Define main routes
const mainRoutes = [
  {
    path: "",
    index: true,
    element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>
  },
  {
    path: "students",
    element: <SuspenseWrapper><Students /></SuspenseWrapper>
  },
  {
    path: "classes",
    element: <SuspenseWrapper><Classes /></SuspenseWrapper>
  },
  {
    path: "grades",
    element: <SuspenseWrapper><Grades /></SuspenseWrapper>
  },
  {
    path: "attendance",
    element: <SuspenseWrapper><Attendance /></SuspenseWrapper>
  },
  {
    path: "*",
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>
  }
];

// Create routes array
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: mainRoutes
  }
];

// Export router
export const router = createBrowserRouter(routes);