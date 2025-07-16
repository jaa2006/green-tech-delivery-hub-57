
const GOMAPS_API_KEY = "AlzaSyZeESi26cHhefwci9CkBwpQ-B1ZjyaS3ej";
const GOMAPS_BASE_URL = "https://maps.gomaps.pro/maps/api/geocode/json";

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Converts an address string to coordinates using Gomaps Geocoding API
 * @param address - The address string to geocode
 * @returns Promise<Coordinates | null> - Returns coordinates object or null if failed
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!address || address.trim().length === 0) {
    console.warn("Address is empty");
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${GOMAPS_BASE_URL}?address=${encodedAddress}&key=${GOMAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      };
    } else {
      console.warn("No results found for address:", address);
      return null;
    }
  } catch (error) {
    console.error("Gomaps geocoding error:", error);
    return null;
  }
};

/**
 * Converts coordinates to address using Gomaps Reverse Geocoding API
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise<string | null> - Returns formatted address or null if failed
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const url = `${GOMAPS_BASE_URL}?latlng=${lat},${lng}&key=${GOMAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.warn("No results found for coordinates:", lat, lng);
      return null;
    }
  } catch (error) {
    console.error("Gomaps reverse geocoding error:", error);
    return null;
  }
};
