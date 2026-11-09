import React, { useState } from 'react';
import './Header.css';
import ptitLogo from '../../assets/ptit-logo.png';
import mapIcon from '../../assets/map-icon.png';

/**
 * Header Component - PTIT Cine
 * - Màn hình máy tính: Giữ nguyên như ban đầu (5 nút ĐẶT VÉ, LỊCH CHIẾU... cạnh logo với hover Arena Breakout).
 * - Màn hình điện thoại (khi thu nhỏ): Tự động ẩn 5 nút và hiện nút 3 gạch (Hamburger Menu).
 *   Khi click nút 3 gạch sẽ trượt mở menu chứa toàn bộ các nút bị ẩn.
 */
const Header = ({
  onNavigateHome = () => { },
  onSearch = () => { },
  activeTab = 'booking',
  onTabChange = () => { }
}) => {
  const [keyword, setKeyword] = useState('');
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Danh sách các mục điều hướng
  const navItems = [
    { id: 'booking', label: 'ĐẶT VÉ' },
    { id: 'schedule', label: 'LỊCH CHIẾU' },
    { id: 'pricing', label: 'GIÁ VÉ' },
    { id: 'community', label: 'CỘNG ĐỒNG' },
    { id: 'promotion', label: 'KHUYẾN MÃI' },
  ];

  // Đóng/Mở menu 3 gạch
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Click logo về trang chủ
  const handleLogoClick = (e) => {
    e.preventDefault();
    setCurrentTab('');
    setIsMobileMenuOpen(false);
    onNavigateHome();
  };

  // Click các nút điều hướng
  const handleNavClick = (e, item) => {
    e.preventDefault();
    setCurrentTab(item.id);
    setIsMobileMenuOpen(false); // Tự động đóng menu trên điện thoại sau khi chọn
    onTabChange(item.id, item.label);
    console.log(`Nav click: ${item.label} (hành động: null)`);
  };

  // Submit tìm kiếm khi nhấn Enter
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(keyword.trim());
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="ptit-header">
      {/* ================= PHẦN TRÊN THANH HEADER ================= */}
      <div className="header-main-bar">
        {/* NHÓM 1: Logo và các nút điều hướng trên máy tính */}
        <div className="header-left">
          {/* Logo PTIT Cine */}
          <div
            className="brand-logo"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            title="PTIT Cine"
          >
            <img
              src={ptitLogo}
              alt="PTIT Logo"
              className="brand-logo-img"
            />
            <span className="brand-title">Cine</span>
          </div>

          {/* Dải 5 nút cho MÁY TÍNH (ẩn trên điện thoại) */}
          <nav className="header-nav-desktop" aria-label="Desktop Navigation">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`nav-item-btn ${(activeTab || currentTab) === id ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, { id, label })}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* NHÓM 2: Search, Map, Hỗ trợ, Tài khoản + Nút 3 gạch */}
        <div className="header-right">
          {/* Thanh tìm kiếm */}
          <div className="search-wrapper">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="nhập từ khóa tìm kiếm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearchSubmit}
              aria-label="Tìm kiếm phim"
            />
          </div>

          {/* Icon Bản đồ (Map) - Ảnh 3, cỡ 2em */}
          <button
            type="button"
            className="map-btn"
            title="Vị trí rạp chiếu"
            onClick={() => console.log('Click Map')}
          >
            <img
              src={mapIcon}
              alt="Bản đồ rạp"
              className="map-icon-img"
            />
          </button>

          {/* Nút Hỗ trợ (ẩn trên điện thoại, hiển thị trong menu 3 gạch) */}
          <button
            type="button"
            className="header-action-btn desktop-only"
            onClick={() => console.log('Click Hỗ trợ')}
          >
            hỗ trợ
          </button>

          {/* Nút Tài khoản */}
          <button
            type="button"
            className="header-action-btn"
            onClick={() => console.log('Click Tài khoản')}
          >
            <svg
              className="user-icon"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
            <span className="desktop-only">tài khoản</span>
          </button>

          {/* NÚT 3 GẠCH (HAMBURGER BUTTON) - Chỉ hiện khi thu nhỏ trên điện thoại */}
          <button
            type="button"
            className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Mở menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* ================= MENU XỔ XUỐNG KHI BẤM NÚT 3 GẠCH (MOBILE) ================= */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        <nav className="mobile-nav-list" aria-label="Mobile Navigation">
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`mobile-nav-item ${(activeTab || currentTab) === id ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, { id, label })}
            >
              <span>{label}</span>
              <span className="mobile-nav-arrow">›</span>
            </button>
          ))}

          {/* Tiện ích thêm trong menu mobile */}
          <div className="mobile-menu-footer">
            <button
              type="button"
              className="mobile-footer-btn"
              onClick={() => { setIsMobileMenuOpen(false); console.log('Hỗ trợ'); }}
            >
              Hỗ trợ khách hàng
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
