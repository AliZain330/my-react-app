import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import './history.css';

// Add regular icons to the library
library.add(far);

function History({ historyItems, onLoadHistoryItem, newItemAdded }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollIntervalRef = useRef(null);

  // Always show exactly 5 items
  const maxVisible = 5;
  
  // Deduplicate history items based on videoId to ensure each YouTube video appears only once
  const deduplicatedItems = React.useMemo(() => {
    if (!historyItems || historyItems.length === 0) {
      return [];
    }
    
    const seenVideoIds = new Set();
    const uniqueItems = [];
    
    for (const item of historyItems) {
      // Get videoId from videoData
      const videoId = item.videoData?.videoId;
      
      // If no videoId, treat as unique (might be invalid data)
      if (!videoId) {
        uniqueItems.push(item);
        continue;
      }
      
      // Only add if we haven't seen this videoId before
      if (!seenVideoIds.has(videoId)) {
        seenVideoIds.add(videoId);
        uniqueItems.push(item);
      }
    }
    
    return uniqueItems;
  }, [historyItems]);
  
  const totalRealItems = deduplicatedItems.length;
  
  // Create exactly 5 placeholder items
  const placeholderItems = Array.from({ length: maxVisible }, (_, i) => ({
    id: `placeholder-${i}`,
    isPlaceholder: true,
    title: `Example ${i + 1}`
  }));

  // Combine real items with placeholders to always have at least 5 items
  // If we have real items, mix them with placeholders until we have 5 total
  let itemsToShow = [];
  if (totalRealItems === 0) {
    // No real items, show 5 placeholders
    itemsToShow = placeholderItems;
  } else if (totalRealItems < maxVisible) {
    // Some real items, fill the rest with placeholders
    const placeholdersNeeded = maxVisible - totalRealItems;
    itemsToShow = [
      ...deduplicatedItems.slice(0, totalRealItems),
      ...placeholderItems.slice(0, placeholdersNeeded)
    ];
  } else {
    // 5 or more real items, use only real items
    itemsToShow = deduplicatedItems;
  }

  const totalItems = itemsToShow.length;
  const maxScrollIndex = Math.max(0, totalItems - maxVisible);

  // Auto-scroll every 5 seconds - loop back to start when reaching the end
  useEffect(() => {
    autoScrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // If we've reached the end, loop back to start; otherwise move to next
        if (prevIndex >= maxScrollIndex) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 5000); // 5 seconds

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [totalItems, maxScrollIndex]);

  // Handle new item animation - reset to show newest
  useEffect(() => {
    if (newItemAdded && totalRealItems > 0) {
      setCurrentIndex(0);
    }
  }, [newItemAdded, totalRealItems]);

  const handleScrollRight = () => {
    setCurrentIndex((prevIndex) => {
      // If we've reached the end, loop back to start; otherwise move to next
      if (prevIndex >= maxScrollIndex) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const getVideoTitle = (item) => {
    if (item.videoData && item.videoData.title) {
      return item.videoData.title;
    }
    return 'Untitled Video';
  };

  const getVideoThumbnail = (item) => {
    if (item.videoData && item.videoData.thumbnail) {
      return item.videoData.thumbnail;
    }
    return null;
  };

  const handleItemClick = (item) => {
    if (item.isPlaceholder) return; // Don't load placeholder items
    if (onLoadHistoryItem) {
      onLoadHistoryItem(item);
    }
  };

  // Calculate transform - each card position is approximately 20% of container
  // (card width + gap) / container width ≈ 20%
  // Limit scrolling to prevent going beyond the last item
  const clampedIndex = Math.min(currentIndex, maxScrollIndex);
  const translateX = -(clampedIndex * 20);

  return (
    <div className="history-component" id="history-section">
      <h3 className="history-heading">See past examples</h3>
      <div className="history-carousel-container">
        <div 
          className="history-carousel"
          style={{
            transform: `translateX(${translateX}%)`
          }}
        >
          {/* Render items - each video appears only once */}
          {itemsToShow.map((item, index) => {
            const isPlaceholder = item.isPlaceholder;
            const thumbnail = isPlaceholder ? null : getVideoThumbnail(item);
            const title = isPlaceholder ? item.title : getVideoTitle(item);
            const isNewItem = newItemAdded && !isPlaceholder && index === 0 && totalRealItems > 0;
            const itemKey = item.id || `item-${index}`;
            
            return (
              <div
                key={itemKey}
                className={`history-card ${isNewItem ? 'new-item-appearing' : ''} ${isPlaceholder ? 'history-card-placeholder-item' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {thumbnail ? (
                  <div className="history-card-thumbnail">
                    <img src={thumbnail} alt={title} />
                  </div>
                ) : (
                  <div className="history-card-thumbnail history-card-placeholder">
                    <FontAwesomeIcon icon={['far', 'face-meh-blank']} className="placeholder-icon" />
                  </div>
                )}
                <div className="history-card-title">{title}</div>
              </div>
            );
          })}
        </div>
        {totalItems > maxVisible && (
          <button 
            className="history-scroll-button history-scroll-right"
            onClick={handleScrollRight}
            aria-label="Scroll right"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}

export default History;
