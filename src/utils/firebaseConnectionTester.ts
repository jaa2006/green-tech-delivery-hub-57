
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const testFirebaseConnection = async () => {
  console.log('=== FIREBASE CONNECTION TEST ===');
  
  try {
    // Test document reference
    const testDocRef = doc(db, 'connection_test', 'test_doc');
    
    // Test write operation
    console.log('Testing write operation...');
    const testData = {
      timestamp: new Date(),
      test: 'connection_test',
      project: 'habisin-migrasi-database'
    };
    
    await setDoc(testDocRef, testData);
    console.log('✅ Write test successful');
    
    // Test read operation
    console.log('Testing read operation...');
    const docSnap = await getDoc(testDocRef);
    
    if (docSnap.exists()) {
      console.log('✅ Read test successful');
      console.log('Retrieved data:', docSnap.data());
    } else {
      console.log('❌ Read test failed - document does not exist');
      return false;
    }
    
    // Clean up test document
    console.log('Cleaning up test document...');
    await deleteDoc(testDocRef);
    console.log('✅ Cleanup successful');
    
    console.log('🎉 All Firebase connection tests passed!');
    console.log('================================');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.log('================================');
    return false;
  }
};

// Auto-run connection test on import (for debugging)
if (typeof window !== 'undefined') {
  // Run test after a short delay to ensure Firebase is initialized
  setTimeout(() => {
    testFirebaseConnection().catch(console.error);
  }, 2000);
}
