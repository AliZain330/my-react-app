// Firestore storage utility for persisting timestamp history
// Uses Firebase Firestore for cloud-based persistence

import { db } from '../../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

const COLLECTION_NAME = 'timestamp_history';
const MAX_HISTORY_ITEMS = null;

const normalizeHistory = (querySnapshot) => {
  const history = [];

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    history.push({
      id: docSnapshot.id,
      timestamps: data.timestamps || [],
      videoData: data.videoData || null,
      timestampData: data.timestampData || null,
      // Convert Firestore Timestamp to ISO string
      date: data.createdAt?.toDate?.()?.toISOString() || data.date || new Date().toISOString()
    });
  });

  return history;
};

/**
 * Save history item to Firestore
 * @param {Object} historyItem - History item to save
 * @returns {Promise<string>} Document ID of the saved item
 */
export const saveToFirestore = async (historyItem) => {
  if (!db) {
    console.warn('⚠️ Firestore not configured. Cannot save to Firestore.');
    return null;
  }
  
  try {
    // Convert date string to Firestore Timestamp if needed
    const itemToSave = {
      ...historyItem,
      createdAt: historyItem.date ? Timestamp.fromDate(new Date(historyItem.date)) : Timestamp.now(),
      // Store the original date as ISO string for easy access
      date: historyItem.date || new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), itemToSave);
    console.log('✅ Saved to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    throw error;
  }
};

/**
 * Load history from Firestore
 * @returns {Promise<Array>} Array of history items
 */
export const loadFromFirestore = async () => {
  if (!db) {
    console.warn('⚠️ Firestore not configured. Cannot load from Firestore.');
    return [];
  }
  
  try {
    const constraints = [orderBy('createdAt', 'desc')];
    if (MAX_HISTORY_ITEMS) {
      constraints.push(limit(MAX_HISTORY_ITEMS));
    }
    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const querySnapshot = await getDocs(q);
    const history = normalizeHistory(querySnapshot);

    console.log(`✅ Loaded ${history.length} items from Firestore`);
    return history;
  } catch (error) {
    const errorCode = error?.code || '';
    const canFallback = errorCode === 'failed-precondition' || errorCode === 'invalid-argument';

    if (canFallback) {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const history = normalizeHistory(querySnapshot);
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        console.log(`✅ Loaded ${history.length} items from Firestore (fallback)`);
        return history;
      } catch (fallbackError) {
        console.error('❌ Error loading from Firestore (fallback):', fallbackError);
        return [];
      }
    }

    console.error('❌ Error loading from Firestore:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Add a new item to Firestore history
 * @param {Object} newItem - New history item to add
 * @returns {Promise<Array>} Updated history array
 */
export const addToHistory = async (newItem) => {
  try {
    // Save to Firestore
    await saveToFirestore(newItem);
    
    // Load updated history
    const updatedHistory = await loadFromFirestore();
    return updatedHistory;
  } catch (error) {
    console.error('Error adding to Firestore history:', error);
    // Return current history even if save fails
    return await loadFromFirestore();
  }
};

/**
 * Delete a history item from Firestore
 * @param {string} itemId - Document ID to delete
 */
export const deleteFromFirestore = async (itemId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, itemId));
    console.log('✅ Deleted item from Firestore:', itemId);
  } catch (error) {
    console.error('❌ Error deleting from Firestore:', error);
    throw error;
  }
};

/**
 * Clear all history from Firestore
 * Note: This requires loading all items first, then deleting them
 */
export const clearFirestoreHistory = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, COLLECTION_NAME, docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    console.log('✅ Cleared all history from Firestore');
  } catch (error) {
    console.error('❌ Error clearing Firestore history:', error);
    throw error;
  }
};

/**
 * Migrate LocalStorage data to Firestore (one-time operation)
 * @returns {Promise<number>} Number of items migrated
 */
export const migrateLocalStorageToFirestore = async () => {
  try {
    const localHistory = JSON.parse(localStorage.getItem('timestamp_history') || '[]');
    
    if (localHistory.length === 0) {
      console.log('ℹ️ No local history to migrate');
      return 0;
    }
    
    console.log(`🔄 Migrating ${localHistory.length} items from LocalStorage to Firestore...`);
    
    let migratedCount = 0;
    for (const item of localHistory) {
      try {
        // Check if item already exists (by checking if we can find it)
        // For simplicity, we'll just add all items
        // In production, you might want to check for duplicates
        await saveToFirestore(item);
        migratedCount++;
      } catch (error) {
        console.error('Error migrating item:', error);
      }
    }
    
    console.log(`✅ Migration complete! Migrated ${migratedCount} items.`);
    
    // Optionally clear LocalStorage after successful migration
    // localStorage.removeItem('timestamp_history');
    
    return migratedCount;
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

