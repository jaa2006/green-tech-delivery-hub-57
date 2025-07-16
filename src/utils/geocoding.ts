
const OPENCAGE_API_KEY = "ca6674a8653d4504800ad4bc6b72a474";
const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Converts an address string to coordinates using OpenCage Geocoding API
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
    const url = `${OPENCAGE_BASE_URL}?q=${encodedAddress}&key=${OPENCAGE_API_KEY}&limit=1&no_annotations=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.lat,
        lng: result.geometry.lng
      };
    } else {
      console.warn("No results found for address:", address);
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Converts coordinates to address using OpenCage Reverse Geocoding API
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise<string | null> - Returns formatted address or null if failed
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const url = `${OPENCAGE_BASE_URL}?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&limit=1&no_annotations=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted;
    } else {
      console.warn("No results found for coordinates:", lat, lng);
      return null;
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};
