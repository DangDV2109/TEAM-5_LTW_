import React, { useState } from 'react';
import Header from './components/Header/Header';
import BodySlider from './components/BodySlider/BodySlider';
import Footer from './components/Footer/Footer';
import MovieDetailPage from './pages/MovieDetailPage';
import { moviesData } from './data/moviesData';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('booking');
  // 0: Slide 1, 1: Slide 2, 2: Slide 3 (phim đang chiếu), 3: Slide 4 (phim sắp chiếu), 4: Slide 5 (phim Việt Nam), 5: Slide 6 (slide cuối - Footer)
  const [activeSlide, setActiveSlide] = useState(0);

  // State lưu phim đang mở ở Trang Chi Tiết Phim (null = đang ở sảnh chính)
  const [selectedMovie, setSelectedMovie] = useState(null);

  // State lưu lựa chọn Thành phố, Rạp, Ngày chiếu, Giờ chiếu từ Slide 3, 4, 5
  const [scheduleFilters, setScheduleFilters] = useState({
    cityId: null,
    cinemaId: null,
    date: null,
    time: null
  });

  // Mở trang chi tiết phim kèm các thông tin đã chọn (nếu có)
  const handleOpenMovieDetail = (movie, preselected = {}) => {
    if (!movie) return;
    setScheduleFilters(prev => ({
      cityId: preselected.cityId !== undefined ? preselected.cityId : prev.cityId,
      cinemaId: preselected.cinemaId !== undefined ? preselected.cinemaId : prev.cinemaId,
      date: preselected.date !== undefined && preselected.date !== null ? preselected.date : prev.date,
      time: preselected.time !== undefined ? preselected.time : null
    }));
    setSelectedMovie(movie);
  };

  // Khi click Logo về trang chủ (chuyển về slide 1 & đóng trang chi tiết)
  const handleNavigateHome = () => {
    setSelectedMovie(null);
    setActiveTab('booking');
    setActiveSlide(0);
  };

  // Khi click vào các mục trên Header
  const handleTabChange = (tabId) => {
    setSelectedMovie(null);
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
    if (!keyword) return;
    const found = moviesData.find(m =>
      m.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (m.originalTitle && m.originalTitle.toLowerCase().includes(keyword.toLowerCase()))
    );
    if (found) {
      handleOpenMovieDetail(found, scheduleFilters);
    }
  };

  /**
   * Xử lý chuyển slide — đồng bộ cả activeSlide lẫn activeTab trên Header.
   * - Slide 1 & Slide 2 cùng thuộc mục ĐẶT VÉ
   * - Slide 3, Slide 4 (phim sắp chiếu) & Slide 5 (phim Việt Nam) thuộc chức năng LỊCH CHIẾU
   */
  const handleSlideChange = (slideIndex) => {
    setActiveSlide(slideIndex);
    if (slideIndex === 0 || slideIndex === 1) setActiveTab('booking');
    else if (slideIndex === 2 || slideIndex === 3 || slideIndex === 4) setActiveTab('schedule');
    else setActiveTab(''); // Slide 6 (blank) — không có tab tương ứng
  };

  // Slide cuối cùng là Slide 6 (index 5)
  const isLastSlide = activeSlide === 5;

  return (
    <div className="app-container">
      {/* 1. HEADER CHÍNH */}
      <Header
        activeTab={selectedMovie ? '' : activeTab}
        onTabChange={handleTabChange}
        onNavigateHome={handleNavigateHome}
        onSearch={handleSearch}
      />

      {/* 2. NỘI DUNG: TRANG CHI TIẾT PHIM (CUỘN TỰ DO) HOẶC BODY SLIDER (6 SLIDES) */}
      {selectedMovie ? (
        <MovieDetailPage
          movie={selectedMovie}
          initialSelection={scheduleFilters}
          onBack={() => setSelectedMovie(null)}
        />
      ) : (
        <>
          <main className="main-content-slider">
            <BodySlider
              activeSlide={activeSlide}
              onSlideChange={handleSlideChange}
              onOpenMovieDetail={handleOpenMovieDetail}
              scheduleFilters={scheduleFilters}
              onScheduleFiltersChange={setScheduleFilters}
            />
          </main>

          {/* 3. FOOTER CHÍNH: Tự động hiển thị chèn lên body ở slide cuối (Slide 6), ẩn ở các slide trên */}
          <Footer isVisible={isLastSlide} />
        </>
      )}
    </div>
  );
};

export default App;
