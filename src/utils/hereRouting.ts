
interface RouteLocation {
  lat: number;
  lng: number;
}

interface RouteSummary {
  duration: number; // in seconds
  length: number;   // in meters
}

interface RouteResponse {
  routes: Array<{
    sections: Array<{
      summary: RouteSummary;
      departure: {
        place: {
          location: RouteLocation;
        };
      };
      arrival: {
        place: {
          location: RouteLocation;
        };
      };
    }>;
  }>;
  notice?: Array<{
    title: string;
    code: string;
  }>;
}

export interface RouteResult {
  success: boolean;
  data?: {
    duration: number; // in minutes
    distance: number; // in kilometers
    durationText: string;
    distanceText: string;
  };
  error?: string;
}

const HERE_API_KEY = '9DEcTqIK0xRJmZ6wmAumvouN1PPET3HIZ0nu-pX08tM';

export const calculateRoute = async (
  origin: RouteLocation,
  destination: RouteLocation
): Promise<RouteResult> => {
  try {
    // Encode parameters properly
    const originParam = encodeURIComponent(`${origin.lat},${origin.lng}`);
    const destinationParam = encodeURIComponent(`${destination.lat},${destination.lng}`);
    
    const url = `https://router.hereapi.com/v8/routes?` +
      `transportMode=car&` +
      `origin=${originParam}&` +
      `destination=${destinationParam}&` +
      `return=summary&` +
      `apiKey=${HERE_API_KEY}`;

    console.log('Making HERE API request:', url);

    const response = await fetch(url);
    const data: RouteResponse = await response.json();

    console.log('HERE API response:', data);

    // Check if request failed
    if (data.notice && data.notice.length > 0) {
      const errorMessage = data.notice[0].title || 'Route calculation failed';
      return {
        success: false,
        error: errorMessage
      };
    }

    // Check if routes exist
    if (!data.routes || data.routes.length === 0) {
      return {
        success: false,
        error: 'No routes found'
      };
    }

    const route = data.routes[0];
    if (!route.sections || route.sections.length === 0) {
      return {
        success: false,
        error: 'Invalid route data'
      };
    }

    const summary = route.sections[0].summary;
    const durationMinutes = Math.round(summary.duration / 60);
    const distanceKm = Math.round(summary.length / 1000 * 100) / 100; // Round to 2 decimal places

    return {
      success: true,
      data: {
        duration: durationMinutes,
        distance: distanceKm,
        durationText: `${durationMinutes} min`,
        distanceText: `${distanceKm} km`
      }
    };

  } catch (error) {
    console.error('Error calculating route:', error);
    return {
      success: false,
      error: 'Failed to calculate route. Please try again.'
    };
  }
};
