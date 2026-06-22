import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "./routes";
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { CreateOrderPage } from "@/pages/CreateOrderPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { LandingPage } from "@/pages/LandingPage";
import { ReportsPage } from "@/pages/ReportsPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.ORDERS, element: <OrdersPage /> },
          { path: "/orders/:id", element: <OrderDetailPage /> },
          { path: ROUTES.CREATE_ORDER, element: <CreateOrderPage /> },
          { path: ROUTES.REPORTS, element: <ReportsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
