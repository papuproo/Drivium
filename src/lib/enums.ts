export const CONDITIONS = ['NEW', 'USED', 'CERTIFIED_PRE_OWNED'] as const;
export const BODY_TYPES = [
    'SEDAN',
    'SUV',
    'TRUCK',
    'COUPE',
    'HATCHBACK',
    'VAN',
    'CONVERTIBLE',
    'WAGON'
] as const;

export const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID'] as const;
export const TRANSMISSIONS = ['AUTOMATIC', 'MANUAL', 'CVT'] as const;

export type Condition = (typeof CONDITIONS)[number];
export type BodyTypeValue = (typeof BODY_TYPES)[number];
export type FuelTypeValue = (typeof FUEL_TYPES)[number];
export type TransmissionValue = (typeof TRANSMISSIONS)[number];

export const isCondition = (v: string): v is Condition =>
    (CONDITIONS as readonly string[]).includes(v);
export const isBodyType = (v: string): v is BodyTypeValue =>
    (BODY_TYPES as readonly string[]).includes(v);
export const isFuelType = (v: string): v is FuelTypeValue =>
    (FUEL_TYPES as readonly string[]).includes(v);