
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as ttapi from '@tomtom-international/web-sdk-services';

const TOMTOM_API_KEY = 'iA54SRddlkPve4SnJ18SpJQPe91ZQZNu';

// Cache for geocoding results
const geocodingCache = new Map<string, { lat: number; lng: number }>();

interface OrderData {
  user_id: string;
  user_name: string;
  user_email?: string;
  pickup: string;
  destination: string;
  pickup_coordinates: { lat: number; lng: number };
  destination_coordinates: { lat: number; lng: number };
}

interface DriverData {
  name: string;
  vehicle_type: string;
  plate_number: string;
}

export class OrderService {
  private static instance: OrderService;
  
  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // Enhanced order creation with user name
  async createOrder(orderData: Omit<OrderData, 'destination_coordinates'> & { destinationAddress: string }): Promise<string> {
    console.log('=== ENHANCED ORDER CREATION WITH USER NAME ===');
    console.log('Creating order with user info:', {
      user_id: orderData.user_id,
      user_name: orderData.user_name,
      user_email: orderData.user_email,
      pickup: orderData.pickup,
      destination: orderData.destinationAddress
    });

    try {
      // Step 1: Geocode destination
      let destinationCoords = await this.geocodeAddress(
        orderData.destinationAddress, 
        orderData.pickup_coordinates
      );

      if (!destinationCoords) {
        console.warn('OrderService: Using fallback coordinates');
        destinationCoords = { lat: -6.2088, lng: 106.8456 };
      }

      // Step 2: Create order with enhanced user data
      const finalOrderData = {
        user_id: orderData.user_id,
        user_name: orderData.user_name,
        user_email: orderData.user_email || '',
        pickup: orderData.pickup,
        destination: orderData.destinationAddress,
        pickup_coordinates: orderData.pickup_coordinates,
        destination_coordinates: destinationCoords,
        status: "waiting" as const,
        assigned_driver_id: null,
        assigned_driver_data: null,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        // Additional fields for better tracking
        expires_at: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000), // 15 minutes
        search_radius: 15, // km
        priority: 'normal'
      };

      console.log('OrderService: Creating order with enhanced structure:', finalOrderData);

      // Step 3: Save to Firestore
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, finalOrderData);

      console.log('OrderService: Enhanced order created successfully with ID:', docRef.id);
      console.log('OrderService: Order with user name will be visible to drivers immediately');

      return docRef.id;

    } catch (error: any) {
      console.error('OrderService: Enhanced order creation failed:', error);
      
      if (error.code === 'permission-denied') {
        throw new Error('Tidak memiliki izin untuk membuat order. Silakan login ulang.');
      } else if (error.code === 'unavailable') {
        throw new Error('Layanan tidak tersedia. Periksa koneksi internet Anda.');
      } else {
        throw new Error(`Gagal membuat order: ${error.message || 'Terjadi kesalahan'}`);
      }
    }
  }

  // Enhanced driver assignment with proper data structure
  async assignDriverToOrder(orderId: string, driverId: string, driverData: DriverData): Promise<void> {
    console.log('=== ASSIGNING DRIVER TO ORDER ===');
    console.log('Order ID:', orderId);
    console.log('Driver ID:', driverId);
    console.log('Driver Data:', driverData);

    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // Update order with driver assignment
      await updateDoc(orderRef, {
        status: 'accepted',
        assigned_driver_id: driverId,
        assigned_driver_data: {
          name: driverData.name,
          vehicle_type: driverData.vehicle_type,
          plate_number: driverData.plate_number
        },
        updated_at: Timestamp.now(),
        accepted_at: Timestamp.now()
      });

      console.log('OrderService: Driver assigned successfully');
      
    } catch (error) {
      console.error('OrderService: Driver assignment failed:', error);
      throw new Error('Gagal assign driver ke order');
    }
  }

  async geocodeAddress(address: string, centerPoint?: { lat: number; lng: number }): Promise<{ lat: number; lng: number } | null> {
    const cacheKey = `${address}_${centerPoint?.lat}_${centerPoint?.lng}`;
    
    if (geocodingCache.has(cacheKey)) {
      console.log('OrderService: Using cached geocoding result');
      return geocodingCache.get(cacheKey)!;
    }

    try {
      console.log('OrderService: Geocoding address:', address);
      
      const response = await ttapi.services.fuzzySearch({
        key: TOMTOM_API_KEY,
        query: address.trim(),
        limit: 1,
        center: centerPoint ? 
          { lat: centerPoint.lat, lon: centerPoint.lng } : 
          { lat: -6.2088, lon: 106.8456 },
        radius: 50000
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const coordinates = {
          lat: result.position.lat,
          lng: result.position.lng
        };
        
        geocodingCache.set(cacheKey, coordinates);
        console.log('OrderService: Geocoding successful:', coordinates);
        return coordinates;
      }
      
      console.warn('OrderService: No geocoding results found');
      return null;
      
    } catch (error) {
      console.error('OrderService: Geocoding error:', error);
      return null;
    }
  }

  clearCache(): void {
    geocodingCache.clear();
    console.log('OrderService: Geocoding cache cleared');
  }
}

export const orderService = OrderService.getInstance();
