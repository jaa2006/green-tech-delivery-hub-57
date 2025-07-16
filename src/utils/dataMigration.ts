
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MigrationResult {
  success: boolean;
  migrated: boolean;
  error?: string;
}

export const migrateDriverData = async (userId: string): Promise<MigrationResult> => {
  try {
    console.log('migrateDriverData: Starting migration for user:', userId);
    
    // Check if data already exists in drivers collection
    const driverDoc = await getDoc(doc(db, 'drivers', userId));
    if (driverDoc.exists()) {
      console.log('migrateDriverData: Driver data already exists in drivers collection');
      return { success: true, migrated: false };
    }

    // Get legacy data from users collection
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log('migrateDriverData: No legacy data found in users collection');
      return { success: false, migrated: false, error: 'No legacy data found' };
    }

    const legacyData = userDoc.data();
    if (legacyData.role !== 'driver') {
      console.log('migrateDriverData: User is not a driver, skipping migration');
      return { success: false, migrated: false, error: 'User is not a driver' };
    }

    // Migrate data to drivers collection
    const migratedDriverData = {
      uid: userId,
      name: legacyData.name || 'Driver',
      email: legacyData.email || '',
      role: 'driver',
      vehicle_type: legacyData.kendaraan || legacyData.vehicle_type || legacyData.vehicleType || 'Motor',
      plate_number: legacyData.plat_nomor || legacyData.plate_number || legacyData.vehicleNumber || 'Unknown',
      phone: legacyData.phone || '',
      photoURL: legacyData.photoURL || '',
      licenseNumber: legacyData.licenseNumber || '',
      location: legacyData.location || { lat: -6.2088, lng: 106.8456 },
      createdAt: legacyData.createdAt || new Date(),
      migratedAt: new Date()
    };

    await setDoc(doc(db, 'drivers', userId), migratedDriverData);
    console.log('migrateDriverData: Successfully migrated driver data');
    
    return { success: true, migrated: true };
  } catch (error) {
    console.error('migrateDriverData: Error during migration:', error);
    return { 
      success: false, 
      migrated: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const migrateSellerData = async (userId: string): Promise<MigrationResult> => {
  try {
    console.log('migrateSellerData: Starting migration for user:', userId);
    
    // Check if data already exists in sellers collection
    const sellerDoc = await getDoc(doc(db, 'sellers', userId));
    if (sellerDoc.exists()) {
      console.log('migrateSellerData: Seller data already exists in sellers collection');
      return { success: true, migrated: false };
    }

    // Get legacy data from users collection
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log('migrateSellerData: No legacy data found in users collection');
      return { success: false, migrated: false, error: 'No legacy data found' };
    }

    const legacyData = userDoc.data();
    if (legacyData.role !== 'seller') {
      console.log('migrateSellerData: User is not a seller, skipping migration');
      return { success: false, migrated: false, error: 'User is not a seller' };
    }

    // Migrate data to sellers collection
    const migratedSellerData = {
      uid: userId,
      name: legacyData.name || legacyData.fullName || 'Seller',
      email: legacyData.email || '',
      role: 'seller',
      storeName: legacyData.storeName || `${legacyData.name || 'Seller'}'s Store`,
      storeDescription: legacyData.storeDescription || '',
      location: legacyData.location || { lat: -6.2088, lng: 106.8456 },
      createdAt: legacyData.createdAt || new Date(),
      updatedAt: new Date(),
      migratedAt: new Date()
    };

    await setDoc(doc(db, 'sellers', userId), migratedSellerData);
    console.log('migrateSellerData: Successfully migrated seller data');
    
    return { success: true, migrated: true };
  } catch (error) {
    console.error('migrateSellerData: Error during migration:', error);
    return { 
      success: false, 
      migrated: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
