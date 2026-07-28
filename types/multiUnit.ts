export type MultiUnitRole = 'owner' | 'property-manager' | 'facilities-manager' | 'asset-manager' | 'other';
export type PortfolioType = 'multi-family' | 'small-apartments' | 'mixed-residential' | 'rental-properties' | 'other';

export interface MultiUnitProfile {
  id: string;
  user_id: string;

  // Role & Portfolio Information
  multi_unit_role: MultiUnitRole;
  portfolio_name: string;
  portfolio_type: PortfolioType;
  total_properties: number;
  total_units: number;

  created_at: string;
  updated_at: string;
}
