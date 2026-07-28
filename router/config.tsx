import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const HomePage = lazy(() => import('../pages/home/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ProvidersPage = lazy(() => import('../pages/providers/page'));
const HomeownerDashboard = lazy(() => import('../pages/homeowner-dashboard/page'));
const HomeownerDashboardCore = lazy(() => import('../pages/homeowner-dashboard-core/page'));
const HomeownerDashboardPremium = lazy(() => import('../pages/homeowner-dashboard-premium/page'));
const ContractorDashboardCore = lazy(() => import('../pages/contractor-dashboard-core/page'));
const ContractorDashboardPremium = lazy(() => import('../pages/contractor-dashboard-premium/page'));
const ContractorAccountProfile = lazy(() => import('../pages/contractor-account/profile/page'));
const ContractorAccountBilling = lazy(() => import('../pages/contractor-account/billing/page'));
const ContractorAccountSettings = lazy(() => import('../pages/contractor-account/settings/page'));
const ContractorAccountHelp = lazy(() => import('../pages/contractor-account/help/page'));
const HomeownerAccountProfile = lazy(() => import('../pages/homeowner-account/profile/page'));
const HomeownerAccountBilling = lazy(() => import('../pages/homeowner-account/billing/page'));
const HomeownerAccountSettings = lazy(() => import('../pages/homeowner-account/settings/page'));
const HomeownerAccountHelp = lazy(() => import('../pages/homeowner-account/help/page'));
const BlogPage = lazy(() => import('../pages/blog/page'));
const BlogArticle = lazy(() => import('../pages/blog/article/page'));
const LocationsPage = lazy(() => import('../pages/locations/page'));
const LocationCity = lazy(() => import('../pages/locations/city/page'));
const HowItWorksPage = lazy(() => import('../pages/how-it-works/page'));
const ForHomeownersPage = lazy(() => import('../pages/for-homeowners/page'));
const ForContractorsPage = lazy(() => import('../pages/for-contractors/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const PrivacyPage = lazy(() => import('../pages/privacy/page'));
const TermsPage = lazy(() => import('../pages/terms/page'));
const ContractorStandardsPage = lazy(() => import('../pages/contractor-standards/page'));
const AIDisclosurePage = lazy(() => import('../pages/ai-disclosure/page'));
const ProblemsPage = lazy(() => import('../pages/problems/page'));
const ServicesPage = lazy(() => import('../pages/services/page'));
const ServicesIndex = lazy(() => import('../pages/services/index/page'));
const ForInsurancePage = lazy(() => import('../pages/for-insurance/page'));
const ForRealEstatePage = lazy(() => import('../pages/for-real-estate/page'));
const AIIntakePage = lazy(() => import('../pages/ai-intake/page'));
const CSRPage = lazy(() => import('../pages/csr/page'));
const ContractorProfile = lazy(() => import('../pages/contractor-profile/page'));
const HomeownerPlans = lazy(() => import('../pages/homeowner-plans/page'));
const ContractorPlans = lazy(() => import('../pages/contractor-plans/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const SignUpPage = lazy(() => import('../pages/signup/page'));
const RoleSelectionPage = lazy(() => import('../pages/role-selection/page'));
const EnrollHomeowner = lazy(() => import("../pages/enroll-homeowner/page"));
const EnrollContractor = lazy(() => import("../pages/enroll-contractor/page"));
const EnrollMultiUnit = lazy(() => import("../pages/enroll-multi-unit/page"));
const MultiUnitDashboardCore = lazy(() => import("../pages/multi-unit-dashboard-core/page"));
const MultiUnitDashboardPremium = lazy(() => import("../pages/multi-unit-dashboard-premium/page"));
const ForMultiUnit = lazy(() => import("../pages/for-multi-unit/page"));
const EarlyAccessContractors = lazy(() => import("../pages/early-access-contractors/page"));
const EarlyAccessHomeowners = lazy(() => import("../pages/early-access-homeowners/page"));
const CheckoutPage = lazy(() => import("../pages/checkout/page"));
const CheckoutSuccess = lazy(() => import("../pages/checkout/success/page"));

const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/early-access-contractors',
    element: <EarlyAccessContractors />,
  },
  {
    path: '/early-access-homeowners',
    element: <EarlyAccessHomeowners />,
  },
  {
    path: '/providers',
    element: <ProvidersPage />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/blog/:slug',
    element: <BlogArticle />,
  },
  {
    path: '/locations',
    element: <LocationsPage />,
  },
  {
    path: '/locations/:city',
    element: <LocationCity />,
  },
  {
    path: '/how-it-works',
    element: <HowItWorksPage />,
  },
  {
    path: '/for-homeowners',
    element: <ForHomeownersPage />,
  },
  {
    path: '/for-contractors',
    element: <ForContractorsPage />,
  },
  {
    path: '/homeowner-plans',
    element: <HomeownerPlans />,
  },
  {
    path: '/contractor-plans',
    element: <ContractorPlans />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/csr',
    element: <CSRPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/contractor-standards',
    element: <ContractorStandardsPage />,
  },
  {
    path: '/ai-disclosure',
    element: <AIDisclosurePage />,
  },
  {
    path: '/problems',
    element: <ProblemsPage />,
  },
  {
    path: '/services',
    element: <ServicesIndex />,
  },
  {
    path: '/services/:service',
    element: <ServicesPage />,
  },
  {
    path: '/for-insurance',
    element: <ForInsurancePage />,
  },
  {
    path: '/for-real-estate',
    element: <ForRealEstatePage />,
  },
  {
    path: '/contractor/:contractorId',
    element: <ContractorProfile />,
  },
  {
    path: '/for-multi-unit',
    element: <ForMultiUnit />,
  },

  // Protected routes
  {
    path: '/role-selection',
    element: <RoleSelectionPage />,
  },
  {
    path: '/enroll-homeowner',
    element: <EnrollHomeowner />,
  },
  {
    path: '/enroll-contractor',
    element: <EnrollContractor />,
  },
  {
    path: '/enroll-multi-unit',
    element: <EnrollMultiUnit />,
  },
  {
    path: '/homeowner-dashboard',
    element: <ProtectedRoute><HomeownerDashboard /></ProtectedRoute>,
  },
  {
    path: '/homeowner-dashboard-core',
    element: <ProtectedRoute><HomeownerDashboardCore /></ProtectedRoute>,
  },
  {
    path: '/homeowner-dashboard-premium',
    element: <ProtectedRoute><HomeownerDashboardPremium /></ProtectedRoute>,
  },
  {
    path: '/contractor-dashboard-core',
    element: <ProtectedRoute><ContractorDashboardCore /></ProtectedRoute>,
  },
  {
    path: '/contractor-dashboard-premium',
    element: <ProtectedRoute><ContractorDashboardPremium /></ProtectedRoute>,
  },
  {
    path: '/contractor-account/profile',
    element: <ProtectedRoute><ContractorAccountProfile /></ProtectedRoute>,
  },
  {
    path: '/contractor-account/billing',
    element: <ProtectedRoute><ContractorAccountBilling /></ProtectedRoute>,
  },
  {
    path: '/contractor-account/settings',
    element: <ProtectedRoute><ContractorAccountSettings /></ProtectedRoute>,
  },
  {
    path: '/contractor-account/help',
    element: <ProtectedRoute><ContractorAccountHelp /></ProtectedRoute>,
  },
  {
    path: '/homeowner-account/profile',
    element: <ProtectedRoute><HomeownerAccountProfile /></ProtectedRoute>,
  },
  {
    path: '/homeowner-account/billing',
    element: <ProtectedRoute><HomeownerAccountBilling /></ProtectedRoute>,
  },
  {
    path: '/homeowner-account/settings',
    element: <ProtectedRoute><HomeownerAccountSettings /></ProtectedRoute>,
  },
  {
    path: '/homeowner-account/help',
    element: <ProtectedRoute><HomeownerAccountHelp /></ProtectedRoute>,
  },
  {
    path: '/ai-intake',
    element: <ProtectedRoute><AIIntakePage /></ProtectedRoute>,
  },
  {
    path: '/multi-unit-dashboard-core',
    element: <ProtectedRoute><MultiUnitDashboardCore /></ProtectedRoute>,
  },
  {
    path: '/multi-unit-dashboard-premium',
    element: <ProtectedRoute><MultiUnitDashboardPremium /></ProtectedRoute>,
  },
  {
    path: '/checkout',
    element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
  },
  {
    path: '/checkout/success',
    element: <ProtectedRoute><CheckoutSuccess /></ProtectedRoute>,
  },

  // Catch-all
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
