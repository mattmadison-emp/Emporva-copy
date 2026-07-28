import { useProfile } from './useProfile';

const dashboardRoutes: Record<string, string> = {
  homeowner: '/homeowner-dashboard-core',
  'multi-unit': '/multi-unit-dashboard-core',
  contractor: '/contractor-dashboard-core',
};

const premiumDashboardRoutes: Record<string, string> = {
  homeowner: '/homeowner-dashboard-premium',
  'multi-unit': '/multi-unit-dashboard-premium',
  contractor: '/contractor-dashboard-premium',
};

const accountRoutes: Record<string, string> = {
  homeowner: '/homeowner-account',
  'multi-unit': '/homeowner-account',
  contractor: '/contractor-account',
};

const planRoutes: Record<string, string> = {
  homeowner: '/homeowner-plans',
  'multi-unit': '/multi-unit-plans',
  contractor: '/contractor-plans',
};

export function useRoleRoutes() {
  const { profile } = useProfile();
  const role = profile?.role || 'homeowner';
  const tier = profile?.tier || 'core';
  const isPremium = tier !== 'core';

  const dashboard = isPremium
    ? (premiumDashboardRoutes[role] || dashboardRoutes[role])
    : (dashboardRoutes[role] || '/homeowner-dashboard-core');

  const account = accountRoutes[role] || '/homeowner-account';
  const plans = planRoutes[role] || '/homeowner-plans';

  return {
    role,
    tier,
    isPremium,
    dashboard,
    account,
    plans,
    profile: `${account}/profile`,
    billing: `${account}/billing`,
    settings: `${account}/settings`,
    help: `${account}/help`,
  };
}
