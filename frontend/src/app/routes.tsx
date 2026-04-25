import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { SignUpPage } from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PostCreationPage } from "./pages/PostCreationPage";
import { PublicPostFormPage } from "./pages/PublicPostFormPage";
import { ConsultingRequestPage } from "./pages/ConsultingRequestPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ContractPaymentPage } from "./pages/ContractPaymentPage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { CompleteProfilePage } from "./pages/CompleteProfilePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/signup",
    Component: SignUpPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/oauth-callback",
    Component: OAuthCallbackPage,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: "/complete-profile",
    element: <ProtectedRoute allowIncomplete><CompleteProfilePage /></ProtectedRoute>,
  },
  {
    path: "/profile/:id",
    element: <ProfilePage />,
  },
  {
    path: "/post-creation",
    element: <ProtectedRoute allowedRoles={['artist']}><PostCreationPage /></ProtectedRoute>,
  },
  {
    path: "/public-post",
    element: <ProtectedRoute allowedRoles={['artist']}><PublicPostFormPage /></ProtectedRoute>,
  },
  {
    path: "/consulting-request",
    element: <ProtectedRoute allowedRoles={['artist']}><ConsultingRequestPage /></ProtectedRoute>,
  },
  {
    path: "/project/:id",
    element: <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>,
  },
  {
    path: "/contract/:id",
    element: <ProtectedRoute><ContractPaymentPage /></ProtectedRoute>,
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={['admin']}><AdminPanelPage /></ProtectedRoute>,
  },
]);
