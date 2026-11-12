import React, { useState } from 'react';
import Header from './components/Header/Header';
import BodySlider from './components/BodySlider/BodySlider';
import Footer from './components/Footer/Footer';
import MovieDetailPage from './pages/MovieDetailPage';
import AllMoviesPage from './pages/AllMoviesPage';
import CommunityPage from './pages/CommunityPage';
import { moviesData } from './data/moviesData';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('booking');
  // 0: Slide 1, 1: Slide 2, 2: Slide 3 (phim đang chiếu), 3: Slide 4 (phim sắp chiếu), 4: Slide 5 (phim Việt Nam), 5: Slide 6 (Giá vé + Footer)
  const [activeSlide, setActiveSlide] = useState(0);

  // Quản lý trang hiện tại: 'home' | 'detail' | 'all-movies' | 'community'
  const [currentView, setCurrentView] = useState('home');

  // State lưu phim đang mở ở Trang Chi Tiết Phim
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
      time: preselected.time !== undefined ? preselected.time : prev.time
    }));
    setSelectedMovie(movie);
    setCurrentView('detail');
  };

  // Mở trang Toàn bộ phim đang chiếu từ nút "xem tất cả->" ở Slide 3
  const handleOpenAllMovies = (preselected = {}) => {
    setScheduleFilters(prev => ({
      cityId: preselected.cityId !== undefined ? preselected.cityId : prev.cityId,
      cinemaId: preselected.cinemaId !== undefined ? preselected.cinemaId : prev.cinemaId,
      date: preselected.date !== undefined && preselected.date !== null ? preselected.date : prev.date,
      time: preselected.time !== undefined ? preselected.time : prev.time
    }));
    setSelectedMovie(null);
    setCurrentView('all-movies');
  };

  // Khi click Logo về trang chủ (chuyển về slide 1 & đóng các trang phụ)
  const handleNavigateHome = () => {
    setSelectedMovie(null);
    setCurrentView('home');
    setActiveTab('booking');
    setActiveSlide(0);
  };

  // Khi click vào các mục trên Header
  const handleTabChange = (tabId) => {
    if (tabId === 'community') {
      setSelectedMovie(null);
      setCurrentView('community');
      return;
    }

    setSelectedMovie(null);
    setCurrentView('home');
    setActiveTab(tabId);
    if (tabId === 'booking') {
      setActiveSlide(0);
    } else if (tabId === 'schedule') {
      setActiveSlide(2);
    } else if (tabId === 'pricing') {
      // Giá vé đã chuyển thành Slide 6 (index 5)
      setActiveSlide(5);
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
   * - Slide 3, Slide 4 & Slide 5 thuộc chức năng LỊCH CHIẾU
   * - Slide 6 thuộc chức năng GIÁ VÉ
   */
  const handleSlideChange = (slideIndex) => {
    setActiveSlide(slideIndex);
    if (slideIndex === 0 || slideIndex === 1) setActiveTab('booking');
    else if (slideIndex === 2 || slideIndex === 3 || slideIndex === 4) setActiveTab('schedule');
    else if (slideIndex === 5) setActiveTab('pricing');
    else setActiveTab('');
  };

  // Slide cuối cùng là Slide 6 (index 5)
  const isLastSlide = activeSlide === 5;

  // Khi đang ở trang Chi tiết phim, Toàn bộ phim, hoặc Cộng đồng: Header KHÔNG tô sáng chức năng nào
  const headerActiveTab = currentView === 'home' ? activeTab : '';

  return (
    <div className="app-container">
      {/* 1. HEADER CHÍNH */}
      <Header
        activeTab={headerActiveTab}
        onTabChange={handleTabChange}
        onNavigateHome={handleNavigateHome}
        onSearch={handleSearch}
      />

      {/* 2. NỘI DUNG THEO TRANG HIỆN TẠI */}
      {currentView === 'detail' && selectedMovie ? (
        <MovieDetailPage
          movie={selectedMovie}
          initialSelection={scheduleFilters}
          onBack={handleNavigateHome}
        />
      ) : currentView === 'all-movies' ? (
        <AllMoviesPage
          initialSelection={scheduleFilters}
          onSelectionChange={setScheduleFilters}
          onOpenMovieDetail={handleOpenMovieDetail}
          onBack={() => {
            setCurrentView('home');
            setActiveTab('schedule');
            setActiveSlide(2);
          }}
        />
      ) : currentView === 'community' ? (
        <CommunityPage
          onBackHome={handleNavigateHome}
          onOpenMovieDetail={(movie) => handleOpenMovieDetail(movie, scheduleFilters)}
        />
      ) : (
        <>
          <main className="main-content-slider">
            <BodySlider
              activeSlide={activeSlide}
              onSlideChange={handleSlideChange}
              onOpenMovieDetail={handleOpenMovieDetail}
              onOpenAllMovies={handleOpenAllMovies}
              scheduleFilters={scheduleFilters}
              onScheduleFiltersChange={setScheduleFilters}
            />
          </main>

          {/* 3. FOOTER CHÍNH: Tự động hiển thị ở slide cuối (Slide 6), ẩn ở các slide trên */}
          <Footer isVisible={isLastSlide} />
        </>
      )}
    </div>
  );
};

export default App;
