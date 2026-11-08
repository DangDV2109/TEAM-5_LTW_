import React, { useState } from 'react';
import Header from './components/Header/Header';
import BodySlider from './components/BodySlider/BodySlider';
import Footer from './components/Footer/Footer';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('booking');
  const [activeSlide, setActiveSlide] = useState(0); // 0: Slide 1, 1: Slide 2, 2: Slide 3 (lịch chiếu), 3: Slide 4 (slide cuối)

  // Khi click Logo về trang chủ (chuyển về slide 1)
  const handleNavigateHome = () => {
    setActiveTab('booking');
    setActiveSlide(0);
  };

  // Khi click vào các mục trên Header
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'booking') {
      // Khi click vào nút ĐẶT VÉ trên Header sẽ dẫn đến slide đầu (Slide 1)
      setActiveSlide(0);
    }
    if (tabId === 'schedule') {
      // Khi click vào nút LỊCH CHIẾU trên Header sẽ dẫn đến Slide 3
      setActiveSlide(2);
    }
  };

  const handleSearch = (keyword) => {
    console.log(`Tìm kiếm: ${keyword}`);
  };

  /**
   * Xử lý chuyển slide — đồng bộ cả activeSlide lẫn activeTab trên Header.
   * Dù người dùng dùng wheel, mũi tên bàn phím, hay click thanh nav bên phải,
   * Header đều tự động highlight đúng mục hiện tại.
   * - Slide 1 & Slide 2 cùng thuộc mục ĐẶT VÉ
   */
  const handleSlideChange = (slideIndex) => {
    setActiveSlide(slideIndex);
    if (slideIndex === 0 || slideIndex === 1) setActiveTab('booking');
    else if (slideIndex === 2) setActiveTab('schedule');
    else setActiveTab(''); // Slide 4 (blank) — không có tab tương ứng
  };

  // Slide cuối cùng là Slide 4 (index 3)
  const isLastSlide = activeSlide === 3;

  return (
    <div className="app-container">
      {/* 1. HEADER CHÍNH */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNavigateHome={handleNavigateHome}
        onSearch={handleSearch}
      />

      {/* 2. BODY SLIDER (4 Slides) */}
      <main className="main-content-slider">
        <BodySlider
          activeSlide={activeSlide}
          onSlideChange={handleSlideChange}
        />
      </main>

      {/* 3. FOOTER CHÍNH: Tự động hiển thị chèn lên body ở slide cuối (Slide 4), ẩn ở các slide trên */}
      <Footer isVisible={isLastSlide} />
    </div>
  );
};

export default App;
