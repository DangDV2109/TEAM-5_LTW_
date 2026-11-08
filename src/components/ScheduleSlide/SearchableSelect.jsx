import React, { useState, useEffect, useRef } from 'react';
import './SearchableSelect.css';
import { removeVietnameseTones } from '../../data/cinemasData';

/**
 * SearchableSelect Component
 * - Hỗ trợ cả 2 cách chọn:
 *   1. Click chuột để mở danh sách và chọn mục
 *   2. Nhập bàn phím để tìm kiếm (hỗ trợ cả tiếng Việt có dấu và không dấu)
 * - Tự động đóng khi click ra ngoài
 */
const SearchableSelect = ({
  label = '',
  placeholder = 'Chọn...',
  options = [],
  selectedId = null,
  onSelect = () => {},
  onClear = () => {},
  disabled = false,
  disabledPlaceholder = 'Vui lòng chọn...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Tìm item đang được chọn
  const selectedItem = options.find(opt => opt.id === selectedId);

  // Lọc danh sách theo từ khóa gõ
  const filteredOptions = options.filter(opt => {
    if (!query.trim()) return true;
    const cleanQuery = removeVietnameseTones(query);
    const cleanName = removeVietnameseTones(opt.name);
    const cleanSub = opt.address ? removeVietnameseTones(opt.address) : '';
    return cleanName.includes(cleanQuery) || cleanSub.includes(cleanQuery);
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mở dropdown & focus input
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return next;
    });
  };

  // Chọn 1 item
  const handleItemClick = (item) => {
    onSelect(item);
    setIsOpen(false);
    setQuery('');
  };

  // Xử lý phím Enter / Escape trong input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleItemClick(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  // Xóa lựa chọn hiện tại
  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div 
      className={`searchable-select-wrap ${disabled ? 'is-disabled' : ''} ${isOpen ? 'is-open' : ''}`}
      ref={containerRef}
    >
      {/* Box hiển thị / kích hoạt */}
      <div 
        className="select-display-box"
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
      >
        <span className="select-icon">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </span>

        {/* Text hiển thị: Tên item đã chọn HOẶC input khi đang mở/tìm kiếm */}
        <div className="select-content">
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="select-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập để tìm..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`select-value-text ${!selectedItem ? 'placeholder' : ''}`}>
              {disabled 
                ? disabledPlaceholder 
                : (selectedItem ? selectedItem.name : placeholder)
              }
            </span>
          )}
        </div>

        {/* Nút xóa lựa chọn hoặc mũi tên xổ xuống */}
        <div className="select-actions">
          {selectedItem && !disabled && (
            <button
              type="button"
              className="select-clear-btn"
              onClick={handleClear}
              title="Xóa lựa chọn"
              aria-label="Xóa lựa chọn"
            >
              ✕
            </button>
          )}
          <span className={`select-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
        </div>
      </div>

      {/* Dropdown danh sách các mục */}
      {isOpen && !disabled && (
        <div className="select-dropdown-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  className={`select-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="item-name">{item.name}</div>
                  {item.address && (
                    <div className="item-sub">{item.address}</div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="select-empty-item">
              Không tìm thấy kết quả "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
