export type PropertyType = 'single-family' | 'townhouse' | 'condo' | 'multi-unit' | 'other';
export type FloorCount = '1' | '2' | '3' | '4+';
export type HvacType = 'central-ac' | 'heat-pump' | 'furnace' | 'mini-split' | 'other';
export type WaterHeaterType = 'tank' | 'tankless' | 'heat-pump' | 'solar';
export type RoofingType = 'asphalt-shingles' | 'metal' | 'tile' | 'slate' | 'flat';
export type OwnershipLength = '<1' | '1-5' | '5-10' | '10+';

export interface Property {
  id: string;
  user_id: string;
  homeowner_profile_id: string | null;
  multi_unit_profile_id: string | null;

  // Property details
  address: string;
  property_type: PropertyType;
  year_built: number | null;
  square_footage: number | null;
  floors: FloorCount;
  unit_count: number;
  ownership_length: OwnershipLength | null;

  // Home systems (optional)
  hvac_type: HvacType | null;
  hvac_age: number | null;
  water_heater_type: WaterHeaterType | null;
  water_heater_age: number | null;
  roofing_type: RoofingType | null;
  roofing_age: number | null;
  photos: string[];

  created_at: string;
  updated_at: string;
}
