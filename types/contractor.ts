export type CompanyType = 'solo' | 'small-team' | 'multi-crew';

export type Trade =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC'
  | 'Roofing'
  | 'Painting'
  | 'General Contracting'
  | 'Landscaping'
  | 'Flooring'
  | 'Carpentry'
  | 'Concrete/Masonry'
  | 'Windows/Doors'
  | 'Insulation'
  | 'Solar'
  | 'Pool/Spa'
  | 'Appliance Repair'
  | 'Pest Control'
  | 'Cleaning'
  | 'Other';

export type TravelRadius = '10' | '25' | '50' | '100' | 'unlimited';
export type LicensingStatus = 'licensed' | 'not-required' | 'in-progress' | 'not-licensed';
export type InsuranceStatus = 'general-liability' | 'full-coverage' | 'not-insured';
export type ContractorPlan = 'core' | 'premium';
export type StarterPackSize = 5 | 10 | 25 | 50;

export interface ContractorProfile {
  id: string;
  user_id: string;

  // Business Information
  business_name: string;
  company_type: CompanyType;
  primary_trade: Trade;
  secondary_trades: Trade[];
  years_in_business: number;

  // Service Area
  service_zips: string;
  travel_radius: TravelRadius;
  emergency_available: boolean;

  // Credentials (all optional)
  licensing_status: LicensingStatus | null;
  insurance_status: InsuranceStatus | null;
  certifications: string | null;

  // Plan Selection
  selected_plan: ContractorPlan;
  starter_pack: StarterPackSize | null;
  credit_balance: number;

  created_at: string;
  updated_at: string;
}
