// Storage utility for persisting timestamp history
// Uses LocalStorage for client-side persistence

const STORAGE_KEY = 'timestamp_history';
const MAX_HISTORY_ITEMS = 100; // Store up to 100 items

/**
 * Load history from localStorage
 * @returns {Array} Array of history items
 */
export const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Error loading history from storage:', error);
  }
  return [];
};

/**
 * Save history to localStorage
 * @param {Array} historyItems - Array of history items to save
 */
export const saveHistory = (historyItems) => {
  try {
    // Keep only the most recent items
    const itemsToSave = historyItems.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToSave));
  } catch (error) {
    console.error('Error saving history to storage:', error);
    // If storage is full, try to save fewer items
    if (error.name === 'QuotaExceededError') {
      try {
        const reducedItems = historyItems.slice(0, 50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedItems));
        console.warn('Storage quota exceeded. Saved reduced history.');
      } catch (retryError) {
        console.error('Failed to save reduced history:', retryError);
      }
    }
  }
};

/**
 * Add a new item to history
 * @param {Object} newItem - New history item to add
 * @returns {Array} Updated history array
 */
export const addToHistory = (newItem) => {
  const currentHistory = loadHistory();
  const updatedHistory = [newItem, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
  saveHistory(updatedHistory);
  return updatedHistory;
};

/**
 * Clear all history
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};

/**
 * Get storage size info (for debugging)
 */
export const getStorageInfo = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sizeInBytes = new Blob([stored]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      return {
        itemCount: loadHistory().length,
        sizeInBytes,
        sizeInKB,
        maxItems: MAX_HISTORY_ITEMS
      };
    }
  } catch (error) {
    console.error('Error getting storage info:', error);
  }
  return { itemCount: 0, sizeInBytes: 0, sizeInKB: 0, maxItems: MAX_HISTORY_ITEMS };
};

