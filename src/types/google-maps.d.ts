
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      fitBounds(bounds: LatLngBounds, padding?: number): void;
      setZoom(zoom: number): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      styles?: any[];
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latlng: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: any;
    }

    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setMap(map: Map): void;
      setDirections(directions: DirectionsResult | any): void;
    }

    interface DirectionsRendererOptions {
      suppressMarkers?: boolean;
      polylineOptions?: any;
    }

    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral | string;
      destination: LatLng | LatLngLiteral | string;
      travelMode: TravelMode;
    }

    interface DirectionsResult {
      routes: any[];
    }

    type DirectionsStatus = string;

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    class DistanceMatrixService {
      getDistanceMatrix(request: DistanceMatrixRequest, callback: (response: DistanceMatrixResponse | null, status: DistanceMatrixStatus) => void): void;
    }

    interface DistanceMatrixRequest {
      origins: (LatLng | LatLngLiteral | string)[];
      destinations: (LatLng | LatLngLiteral | string)[];
      travelMode: TravelMode;
      unitSystem: UnitSystem;
    }

    interface DistanceMatrixResponse {
      rows: DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
      elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: string;
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
    }

    type DistanceMatrixStatus = string;

    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1
    }

    class LatLngBounds {
      extend(point: LatLng | LatLngLiteral): void;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class Size {
      constructor(width: number, height: number);
    }

    namespace SymbolPath {
      const CIRCLE: any;
    }
  }
}

export {};
