
import { doc, updateDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Ensure test driver exists
export const ensureTestDriverExists = async () => {
  const testDriverId = 'test-driver-123';
  
  try {
    const driverDoc = await getDoc(doc(db, 'drivers', testDriverId));
    
    if (!driverDoc.exists()) {
      console.log('Creating test driver document...');
      await setDoc(doc(db, 'drivers', testDriverId), {
        name: 'Budi Santoso',
        vehicle_type: 'Motor',
        plate_number: 'M 1234 AB',
        vehicle: 'Motor',
        vehicle_plate: 'M 1234 AB',
        plate: 'M 1234 AB',
        role: 'driver',
        created_at: Timestamp.now()
      });
      console.log('Test driver created successfully');
    } else {
      console.log('Test driver already exists');
    }
  } catch (error) {
    console.error('Error checking/creating test driver:', error);
  }
};

// Enhanced simulator with better error handling
export const simulateDriverAcceptOrder = async (orderId: string, delay: number = 3000) => {
  console.log(`=== DRIVER SIMULATION STARTED ===`);
  console.log(`Order ID: ${orderId}`);
  console.log(`Delay: ${delay}ms`);
  
  // Ensure test driver exists first
  await ensureTestDriverExists();
  
  setTimeout(async () => {
    try {
      console.log(`=== SIMULATING DRIVER ACCEPT ===`);
      console.log(`Accepting order ${orderId}...`);
      
      const dummyDriverId = 'test-driver-123';
      
      // Update the order to accepted status
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'accepted',
        assigned_driver_id: dummyDriverId,
        updated_at: Timestamp.now()
      });
      
      console.log(`=== ORDER ACCEPTED SUCCESSFULLY ===`);
      console.log(`Order ${orderId} has been accepted by driver ${dummyDriverId}`);
      console.log(`This should trigger the driver found popup`);
      
    } catch (error) {
      console.error('=== DRIVER SIMULATION ERROR ===');
      console.error('Error simulating driver accept:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  }, delay);
};
