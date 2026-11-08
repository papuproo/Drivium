// Sirve para hacer la conversión de millas a kilómetros debido a que en la base de datos se quedó registrado las millas para la versión en inglés

const KM_PER_MILE = 1.609344;

export const milesToKm = (miles: number): number => Math.round(miles * KM_PER_MILE);