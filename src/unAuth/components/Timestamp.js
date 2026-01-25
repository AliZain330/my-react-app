import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { onAuthStateChanged } from 'firebase/auth';
import { functions, auth, db } from '../../firebase';
import Enter from './Timestamp.comp/enter';
import Times from './Timestamp.comp/times';
import History from './Timestamp.comp/history';
import { loadFromFirestore, addToHistory as addToFirestoreHistory } from './Timestamp.comp/firestoreStorage';
import './Timestamp.css';

function Timestamp({ onOpenLogin, onOpenSignup }) {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [timestamps, setTimestamps] = useState(null);
  const [generatingTimestamps, setGeneratingTimestamps] = useState(false);
  const [history, setHistory] = useState([]);
  const [enterKey, setEnterKey] = useState(0); // Key to force reset of Enter component
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [requestError, setRequestError] = useState('');

  // Track authentication state
  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Load history from Firestore on component mount
  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        if (!db) {
          setHistoryError('Firestore is not configured. Check your .env and restart.');
          setHistory([]);
          return;
        }
        setHistoryLoading(true);
        setHistoryError('');
        const savedHistory = await loadFromFirestore();
        setHistory(savedHistory);
      } catch (error) {
        console.error('Error loading history:', error);
        setHistoryError(error?.message || 'Failed to load history.');
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    if (authReady) {
      loadHistoryData();
    }
  }, [authReady, user]);

  const extractVideoId = (urlString) => {
    const match = urlString.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const handleVideoDataChange = (newVideoData) => {
    setVideoData(newVideoData);
    // Clear timestamps when video data changes
    if (!newVideoData && timestamps) {
      setTimestamps(null);
    }
  };

  const handleGenerateTimestamps = async (videoUrl) => {
    if (!videoUrl || !videoData) {
      return;
    }

    // Extract video ID to check if it's already in history
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      // Check if this video already exists in history
      const existingItem = history.find(item => 
        item.videoData && item.videoData.videoId === videoId
      );
      
      if (existingItem) {
        // Video already processed, load from history instead of calling API
        handleLoadHistoryItem(existingItem);
        return;
      }
    }

    setUrl(videoUrl);
    setGeneratingTimestamps(true);
    setRequestError('');

    try {
      if (!functions) {
        const message = 'Firebase Functions is not configured. Check your .env and restart.';
        console.error(message);
        setRequestError(message);
        setGeneratingTimestamps(false);
        return;
      }
      
      const getTimestamps = httpsCallable(functions, 'get_timestamps');
      const result = await getTimestamps({ url: videoUrl });
      
      if (result.data && result.data.success) {
        const timestampData = result.data.data;
        setTimestamps(timestampData);
        
        // Filter timestamps for history
        const timestampList = timestampData.timestamps_list || [];
        const filtered = [];
        for (const timestamp of timestampList) {
          if (timestamp.toLowerCase().includes('video tutorial')) {
            filtered.push(timestamp);
            break;
          }
          filtered.push(timestamp);
        }
        
        // Save to history immediately when timestamps are generated
        const historyItem = {
          timestamps: filtered,
          videoData: videoData,
          timestampData: timestampData,
          date: new Date().toISOString()
        };
        
        // Add to Firestore and update state
        try {
          const updatedHistory = await addToFirestoreHistory(historyItem);
          setHistory(updatedHistory);
          setNewItemAdded(true);
          setTimeout(() => {
            setNewItemAdded(false);
          }, 1500);
        } catch (error) {
          console.error('Error saving to Firestore:', error);
          // Still show the timestamps even if save fails
        }
      } else {
        const message = 'Failed to generate timestamps. Please try again.';
        console.error(message);
        setRequestError(message);
      }
    } catch (err) {
      const message = err?.message || 'Error generating timestamps. Please try again.';
      console.error('Error generating timestamps:', err);
      setRequestError(message);
    } finally {
      setGeneratingTimestamps(false);
    }
  };

  const handleSaveToHistory = async (historyItem) => {
    try {
      // Add to Firestore and update state
      const updatedHistory = await addToFirestoreHistory(historyItem);
      setHistory(updatedHistory);
      setNewItemAdded(true);
      // Reset the flag after animation completes
      setTimeout(() => {
        setNewItemAdded(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  const handleGenerateAnother = () => {
    // Clear current state
    setUrl('');
    setVideoData(null);
    setTimestamps(null);
    setGeneratingTimestamps(false);
    // Force Enter component to reset by changing key
    setEnterKey(prev => prev + 1);
  };

  const handleLoadHistoryItem = (item) => {
    // Load history item back into the component
    setVideoData(item.videoData);
    setTimestamps(item.timestampData);
    // Clear the Enter component state by incrementing the key
    setEnterKey(prev => prev + 1);
    
    // Scroll to the timestamp section to show the loaded content
    setTimeout(() => {
      const timestampSection = document.getElementById('timestamp-section');
      if (timestampSection) {
        timestampSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="timestamp" id="timestamp-section">
      <div className="timestamp-container">
        <Enter 
          key={enterKey}
          onVideoDataChange={handleVideoDataChange}
          onGenerateTimestamps={handleGenerateTimestamps}
          generatingTimestamps={generatingTimestamps}
          showOnlyPreview={!!timestamps}
          videoData={videoData}
        />
        {requestError && (
          <p className="timestamp-error">{requestError}</p>
        )}
        {timestamps && (
          <Times
            timestamps={timestamps}
            videoData={videoData}
            onGenerateAnother={handleGenerateAnother}
            onSaveToHistory={handleSaveToHistory}
            user={user}
            onOpenLogin={onOpenLogin}
            onOpenSignup={onOpenSignup}
          />
        )}
      </div>
      
      <History
        historyItems={history}
        onLoadHistoryItem={handleLoadHistoryItem}
        newItemAdded={newItemAdded}
        loading={historyLoading}
        error={historyError}
      />
    </div>
  );
}

export default Timestamp;

