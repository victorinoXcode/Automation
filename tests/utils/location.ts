import {randomIntFromInterval} from "@/utils/math";

export type UsLocation = {
  zipCode: string;
  city: string;
  state: string;
};

const USA_LOCATIONS: readonly UsLocation[] = [
  {zipCode: "10001", city: "New York", state: "NY"},
  {zipCode: "33101", city: "Miami", state: "FL"},
  {zipCode: "60601", city: "Chicago", state: "IL"},
  {zipCode: "73301", city: "Austin", state: "TX"},
  {zipCode: "90001", city: "Los Angeles", state: "CA"},
  {zipCode: "85001", city: "Phoenix", state: "AZ"},
  {zipCode: "19102", city: "Philadelphia", state: "PA"},
  {zipCode: "78205", city: "San Antonio", state: "TX"},
  {zipCode: "92101", city: "San Diego", state: "CA"},
  {zipCode: "75201", city: "Dallas", state: "TX"},
  {zipCode: "95113", city: "San Jose", state: "CA"},
  {zipCode: "76102", city: "Fort Worth", state: "TX"},
  {zipCode: "32202", city: "Jacksonville", state: "FL"},
  {zipCode: "94203", city: "Sacramento", state: "CA"},
  {zipCode: "28202", city: "Charlotte", state: "NC"},
  {zipCode: "80202", city: "Denver", state: "CO"},
  {zipCode: "02108", city: "Boston", state: "MA"},
  {zipCode: "48226", city: "Detroit", state: "MI"},
  {zipCode: "43215", city: "Columbus", state: "OH"},
  {zipCode: "98101", city: "Seattle", state: "WA"},
  {zipCode: "20001", city: "Washington", state: "DC"},
  {zipCode: "37219", city: "Nashville", state: "TN"},
  {zipCode: "46204", city: "Indianapolis", state: "IN"},
  {zipCode: "74103", city: "Tulsa", state: "OK"},
  {zipCode: "64106", city: "Kansas City", state: "MO"},
  {zipCode: "63101", city: "St. Louis", state: "MO"},
  {zipCode: "55401", city: "Minneapolis", state: "MN"},
  {zipCode: "53202", city: "Milwaukee", state: "WI"},
  {zipCode: "33602", city: "Tampa", state: "FL"},
  {zipCode: "32801", city: "Orlando", state: "FL"},
  {zipCode: "89101", city: "Las Vegas", state: "NV"},
  {zipCode: "15222", city: "Pittsburgh", state: "PA"},
  {zipCode: "70112", city: "New Orleans", state: "LA"},
  {zipCode: "02903", city: "Providence", state: "RI"},
  {zipCode: "84111", city: "Salt Lake City", state: "UT"},
  {zipCode: "96813", city: "Honolulu", state: "HI"},
  {zipCode: "99501", city: "Anchorage", state: "AK"},
  {zipCode: "55414", city: "Minneapolis", state: "MN"},
  {zipCode: "44113", city: "Cleveland", state: "OH"},
  {zipCode: "73102", city: "Oklahoma City", state: "OK"},
  {zipCode: "64108", city: "Kansas City", state: "MO"},
  {zipCode: "70130", city: "New Orleans", state: "LA"},
];

export function getRandomUsLocation(): UsLocation {
  const locationIndex = randomIntFromInterval(0, USA_LOCATIONS.length - 1);
  const location = USA_LOCATIONS[locationIndex] ?? USA_LOCATIONS[0];
  if (!location) {
    throw new Error("No US locations configured");
  }
  return location;
}
