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
  const totalRealItems = historyItems ? historyItems.length : 0;
  
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
      ...historyItems.slice(0, totalRealItems),
      ...placeholderItems.slice(0, placeholdersNeeded)
    ];
  } else {
    // 5 or more real items, use only real items
    itemsToShow = historyItems;
  }

  const totalItems = itemsToShow.length;

  // Auto-scroll every 5 seconds - always scroll, even with placeholders
  useEffect(() => {
    autoScrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Circular rotation - always move to next item
        return (prevIndex + 1) % totalItems;
      });
    }, 5000); // 5 seconds

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [totalItems]);

  // Handle new item animation - reset to show newest
  useEffect(() => {
    if (newItemAdded && totalRealItems > 0) {
      setCurrentIndex(0);
    }
  }, [newItemAdded, totalRealItems]);

  const handleScrollRight = () => {
    setCurrentIndex((prevIndex) => {
      return (prevIndex + 1) % totalItems;
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

  // For circular scrolling, duplicate items at the end for seamless loop
  const extendedItems = [...itemsToShow, ...itemsToShow.slice(0, maxVisible)];
  
  // Calculate transform - each card position is approximately 20% of container
  // (card width + gap) / container width ≈ 20%
  const translateX = -(currentIndex * 20);

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
          {/* Render extended items for seamless circular scrolling */}
          {extendedItems.map((item, index) => {
            const isPlaceholder = item.isPlaceholder;
            const thumbnail = isPlaceholder ? null : getVideoThumbnail(item);
            const title = isPlaceholder ? item.title : getVideoTitle(item);
            const originalIndex = index % totalItems;
            const isNewItem = newItemAdded && !isPlaceholder && originalIndex === 0 && totalRealItems > 0;
            const itemKey = `${item.id || originalIndex}-${index}`;
            
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
