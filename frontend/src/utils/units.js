// Display-only conversions. The backend always stores/expects kg and km -
// these are only for what's rendered to the user.

export function kgToLbs(kg) {
  return Math.round(kg * 2.20462)
}

export function kmToMiles(km) {
  return Math.round(km * 0.621371 * 100) / 100
}

export function lbsToKg(lbs) {
  return lbs / 2.20462
}

export function milesToKm(miles) {
  return miles / 0.621371
}
