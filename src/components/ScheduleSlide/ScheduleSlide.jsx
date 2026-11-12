import React, { useState, useMemo, useRef, useEffect } from 'react';
import './ScheduleSlide.css';
import { moviesData } from '../../data/moviesData';
import { upcomingMovies, vietnamMovies } from '../../data/movieSelectors';
import { citiesData } from '../../data/cinemasData';
import SearchableSelect from './SearchableSelect';

/**
 * ScheduleSlide Component - PTIT Cine
 * Hỗ trợ 3 chế độ (`mode`):
 * - 'now' (Slide 3 - Phim đang chiếu):
 *   + Có chấm đỏ nhấp nháy ● cạnh tiêu đề "PHIM ĐANG CHIẾU"
 *   + Có 2 thanh chọn Thành phố & Rạp (bản mobile nằm cùng 1 dòng)
 *   + Có thanh chọn ngày chiếu + nút "xem tất cả->" dẫn tới trang toàn bộ phim đang chiếu
 *   + Bản Mobile: hiển thị 1 thẻ phim chính + 2 nửa thẻ phim bên cạnh nghiêng 10 độ so với mặt phẳng Oyz,
 *     đứng trên sàn bóng loáng, dưới là tên phim và chỉ thị [k/n] cỡ 0.5em, bỏ nút prev/next
 * - 'coming' (Slide 4 - Phim sắp chiếu):
 *   + Làm như Slide 3 nhưng không có nút "xem tất cả", 2 nửa thẻ phim đằng sau không bị nghiêng,
 *     background bỏ circle at top
 * - 'vietnam' (Slide 5 - Phim Việt Nam):
 *   + Như Slide 4, background bỏ circle at top và sửa thành circle at bottom (down)
 */
const ScheduleSlide = ({
  mode = 'now',
  onOpenMovieDetail = () => {},
  onOpenAllMovies = () => {},
  selectedCityId: externalCityId,
  onCityChange,
  selectedCinemaId: externalCinemaId,
  onCinemaChange,
  activeDate: externalDate,
  onDateChange,
  selectedTime: externalTime,
  onTimeChange
}) => {
  const isNowMode = mode === 'now';
  const isComingMode = mode === 'coming';
  const isVietnamMode = mode === 'vietnam';

  // ===================== DỮ LIỆU NGÀY CHIẾU (DÙNG CHO SLIDE 3) =====================
  const dateList = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      days.push(`${dd}-${mm}-${yyyy}`);
    }
    return days;
  }, []);

  const [internalDate, setInternalDate] = useState(dateList[0]);
  const activeDate = externalDate !== undefined && externalDate !== null ? externalDate : internalDate;
  const [currentPage, setCurrentPage] = useState(0);

  // Chỉ số phim đang chọn trên carousel Mobile (0..n-1)
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartXRef = useRef(null);

  // ===================== BỘ LỌC THÀNH PHỐ & RẠP (DÙNG CHO SLIDE 3) =====================
  const [internalCityId, setInternalCityId] = useState(null);
  const [internalCinemaId, setInternalCinemaId] = useState(null);

  const selectedCityId = externalCityId !== undefined ? externalCityId : internalCityId;
  const selectedCinemaId = externalCinemaId !== undefined ? externalCinemaId : internalCinemaId;

  const citiesOptions = useMemo(() => {
    return citiesData.map(c => ({
      id: c.id,
      name: c.name
    }));
  }, []);

  const cinemasOptions = useMemo(() => {
    if (!selectedCityId) return [];
    const city = citiesData.find(c => c.id === selectedCityId);
    return city ? city.cinemas : [];
  }, [selectedCityId]);

  const currentCinema = useMemo(() => {
    if (!selectedCinemaId) return null;
    for (const city of citiesData) {
      const found = city.cinemas.find(cin => cin.id === selectedCinemaId);
      if (found) return found;
    }
    return null;
  }, [selectedCinemaId]);

  const handleCitySelect = (city) => {
    if (onCityChange) onCityChange(city.id);
    else setInternalCityId(city.id);

    if (onCinemaChange) onCinemaChange(null);
    else setInternalCinemaId(null);

    setCurrentPage(0);
    setMobileIndex(0);
  };

  const handleCityClear = () => {
    if (onCityChange) onCityChange(null);
    else setInternalCityId(null);

    if (onCinemaChange) onCinemaChange(null);
    else setInternalCinemaId(null);

    setCurrentPage(0);
    setMobileIndex(0);
  };

  const handleCinemaSelect = (cinema) => {
    if (onCinemaChange) onCinemaChange(cinema.id);
    else setInternalCinemaId(cinema.id);

    setCurrentPage(0);
    setMobileIndex(0);
  };

  const handleCinemaClear = () => {
    if (onCinemaChange) onCinemaChange(null);
    else setInternalCinemaId(null);

    setCurrentPage(0);
    setMobileIndex(0);
  };

  // Helper: lấy danh sách khu vực (thành phố) mà phim được chiếu dựa vào movie.cinemas
  const getMovieRegions = (movie) => {
    if (!movie.cinemas || movie.cinemas.length === 0) {
      return ['Hà Nội', 'TP. Hồ Chí Minh'];
    }
    const cityNames = [];
    for (const city of citiesData) {
      const hasCinemaInCity = city.cinemas.some(cin => movie.cinemas.includes(cin.id));
      if (hasCinemaInCity) {
        cityNames.push(city.name);
      }
    }
    return cityNames.length > 0 ? cityNames : ['Hà Nội', 'TP. Hồ Chí Minh'];
  };

  // ===================== DANH SÁCH PHIM THEO CHẾ ĐỘ SLIDE =====================
  const filteredMovies = useMemo(() => {
    if (isComingMode) {
      return upcomingMovies;
    }

    if (isVietnamMode) {
      return vietnamMovies;
    }

    // Slide 3 (mode === 'now'): Lọc phim đang chiếu có tag '#schedule'
    let list = moviesData.filter(
      m => m.status === 'now' && m.tags && m.tags.includes('#schedule')
    );

    if (selectedCinemaId) {
      list = list.filter(m => m.cinemas && m.cinemas.includes(selectedCinemaId));
    } else if (selectedCityId) {
      const city = citiesData.find(c => c.id === selectedCityId);
      const cityCinemaIds = city ? city.cinemas.map(cin => cin.id) : [];
      list = list.filter(m => m.cinemas && m.cinemas.some(cid => cityCinemaIds.includes(cid)));
    }

    return list;
  }, [isComingMode, isVietnamMode, selectedCityId, selectedCinemaId]);

  useEffect(() => {
    if (mobileIndex >= filteredMovies.length) {
      setMobileIndex(0);
    }
  }, [filteredMovies.length, mobileIndex]);

  // Phân trang PC: 9 thẻ / trang
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));

  const displayedMovies = filteredMovies.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage(p => (p - 1 + totalPages) % totalPages);
  const handleNext = () => setCurrentPage(p => (p + 1) % totalPages);

  const handleDateChange = (date) => {
    if (onDateChange) onDateChange(date);
    else setInternalDate(date);
    setCurrentPage(0);
  };

  const lastTapRef = useRef({ id: null, time: 0 });

  const triggerOpenDetail = (movie, timeSlot = null) => {
    if (timeSlot && onTimeChange) {
      onTimeChange(timeSlot);
    }
    onOpenMovieDetail(movie, {
      cityId: selectedCityId,
      cinemaId: selectedCinemaId,
      date: activeDate,
      time: timeSlot !== null ? timeSlot : (externalTime || null)
    });
  };

  const handleCardTouchEnd = (movie) => {
    const now = Date.now();
    if (lastTapRef.current.id === movie.id && now - lastTapRef.current.time < 320) {
      triggerOpenDetail(movie, null);
      lastTapRef.current = { id: null, time: 0 };
    } else {
      lastTapRef.current = { id: movie.id, time: now };
    }
  };

  const getAgeRatingStyle = (ageRating) => {
    if (!ageRating) return {};
    if (ageRating.startsWith('T18')) return { color: '#ED1C24' };
    if (ageRating.startsWith('T16')) return { color: '#ED1C24' };
    if (ageRating.startsWith('T13')) return { color: '#f97316' };
    return { color: '#6b7280' };
  };

  const handlePosterError = (e, movie) => {
    const fallback = movie.fallbackPoster || movie.youtubeThumbnail || movie.backdrop;
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  // ===================== ĐIỀU KHIỂN CAROUSEL 3D TRÊN MOBILE =====================
  const totalMobileMovies = filteredMovies.length;
  const safeMobileIdx = totalMobileMovies > 0 ? mobileIndex % totalMobileMovies : 0;
  const centerMovie = totalMobileMovies > 0 ? filteredMovies[safeMobileIdx] : null;
  const leftMovie =
    totalMobileMovies > 1
      ? filteredMovies[(safeMobileIdx - 1 + totalMobileMovies) % totalMobileMovies]
      : null;
  const rightMovie =
    totalMobileMovies > 1
      ? filteredMovies[(safeMobileIdx + 1) % totalMobileMovies]
      : null;

  const goMobilePrev = () => {
    if (totalMobileMovies <= 1) return;
    setMobileIndex(i => (i - 1 + totalMobileMovies) % totalMobileMovies);
  };

  const goMobileNext = () => {
    if (totalMobileMovies <= 1) return;
    setMobileIndex(i => (i + 1) % totalMobileMovies);
  };

  const handleShowcaseTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleShowcaseTouchEnd = (e) => {
    if (touchStartXRef.current === null || !e.changedTouches || e.changedTouches.length === 0) {
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 36) {
      if (deltaX < 0) goMobileNext();
      else goMobilePrev();
    }
  };

  const handleOpenAllClick = () => {
    onOpenAllMovies({
      cityId: selectedCityId,
      cinemaId: selectedCinemaId,
      date: activeDate,
      time: externalTime || null
    });
  };

  return (
    <div className={`schedule-slide-container mode-${mode}`}>
      {/* ===== TIÊU ĐỀ (CÙNG VỊ TRÍ CHO CẢ SLIDE 3, SLIDE 4, SLIDE 5) ===== */}
      <div className="schedule-heading">
        <div className="schedule-heading-left">
          {isNowMode && (
            <>
              <span className="schedule-dot" aria-hidden="true">●</span>
              <h2 className="schedule-title">Phim đang chiếu</h2>
              {currentCinema && (
                <span className="current-cinema-badge" title={currentCinema.address}>
                  Tại: <strong>{currentCinema.name}</strong>
                </span>
              )}
            </>
          )}

          {isComingMode && (
            <>
              <span className="schedule-soon-indicator" aria-hidden="true" title="Sắp chiếu">
                🔜
              </span>
              <h2 className="schedule-title">Phim sắp chiếu</h2>
            </>
          )}

          {isVietnamMode && (
            <>
              <span className="vn-star-badge" aria-hidden="true" title="Phim Việt Nam">
                <span className="vn-star-icon">★</span>
              </span>
              <h2 className="schedule-title">Phim Việt Nam</h2>
            </>
          )}
        </div>

        {/* 2 Chức năng chọn Thành phố & Rạp chỉ hiển thị ở Slide 3 (trên mobile nằm cùng 1 dòng) */}
        {isNowMode && (
          <div className="schedule-heading-filters">
            <SearchableSelect
              label="Thành phố"
              placeholder="Chọn thành phố..."
              options={citiesOptions}
              selectedId={selectedCityId}
              onSelect={handleCitySelect}
              onClear={handleCityClear}
            />

            <SearchableSelect
              label="Rạp chiếu"
              placeholder={selectedCityId ? "Chọn rạp..." : "Chọn thành phố trước"}
              disabledPlaceholder="Chọn thành phố trước"
              options={cinemasOptions}
              selectedId={selectedCinemaId}
              onSelect={handleCinemaSelect}
              onClear={handleCinemaClear}
              disabled={!selectedCityId}
            />
          </div>
        )}
      </div>

      {/* ===== TAB CHỌN NGÀY + NÚT "xem tất cả->" (CHỈ HIỂN THỊ Ở SLIDE 3) ===== */}
      {isNowMode && (
        <div className="schedule-date-bar">
          <div className="schedule-date-tabs">
            {dateList.map(date => (
              <button
                key={date}
                type="button"
                className={`date-tab-btn ${activeDate === date ? 'active' : ''}`}
                onClick={() => handleDateChange(date)}
              >
                {date}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="view-all-movies-btn"
            onClick={handleOpenAllClick}
          >
            xem tất cả-&gt;
          </button>
        </div>
      )}

      {/* ===== KHU VỰC HIỂN THỊ PHIM ===== */}
      {filteredMovies.length > 0 ? (
        <>
          {/* 1. GIAO DIỆN MÁY TÍNH (PC): LƯỚI 9 THẺ PHIM (3x3) */}
          <div className="schedule-main-area desktop-schedule-view">
            <button
              type="button"
              className="schedule-nav-btn prev-btn"
              onClick={handlePrev}
              aria-label="Xem trang trước"
            >
              <span className="nav-btn-arrow">◄</span>
              <span className="nav-btn-label">PREV</span>
            </button>

            <div className="schedule-movies-grid">
              {displayedMovies.map(movie => {
                const regions = getMovieRegions(movie);
                const showComingDetails = isComingMode || movie.status === 'coming';

                return (
                  <div
                    key={movie.id}
                    className="schedule-movie-card"
                    title="Nhấp đúp vào thẻ phim hoặc chọn giờ chiếu để xem chi tiết & đặt vé"
                    onDoubleClick={() => triggerOpenDetail(movie, null)}
                    onTouchEnd={() => handleCardTouchEnd(movie)}
                  >
                    <div className="sched-poster-wrap">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="sched-poster-img"
                        loading="lazy"
                        onError={(e) => handlePosterError(e, movie)}
                      />
                    </div>

                    <div className="sched-info">
                      <div className="sched-meta-top">
                        <span className="sched-genre-duration">
                          {movie.genre} &nbsp;•&nbsp; {movie.duration}
                        </span>
                        <span className="sched-format-badge">{movie.format}</span>
                      </div>

                      <h3 className="sched-movie-title">{movie.title.toUpperCase()}</h3>

                      <p className="sched-origin">Xuất xứ: {movie.origin}</p>

                      {showComingDetails ? (
                        <p className="sched-release sched-release-coming">
                          Bắt đầu chiếu: <strong>{movie.releaseDate}</strong>
                        </p>
                      ) : (
                        <p className="sched-release">Khởi chiếu: {movie.releaseDate || activeDate}</p>
                      )}

                      <p className="sched-age-rating" style={getAgeRatingStyle(movie.ageRating)}>
                        {movie.ageRating}
                      </p>

                      {showComingDetails ? (
                        <div className="sched-screenings sched-regions-row">
                          <span className="sched-screenings-label">Chỉ chiếu tại:</span>
                          <div className="sched-region-tags">
                            {regions.map(regionName => (
                              <span key={regionName} className="region-badge">
                                {regionName}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="sched-screenings">
                          <span className="sched-screenings-label">Lịch chiếu:</span>
                          <div className="sched-time-slots">
                            {movie.screenings.map(time => (
                              <button
                                key={time}
                                type="button"
                                className="time-slot-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerOpenDetail(movie, time);
                                }}
                                title={`Đặt vé ${movie.title} lúc ${time}`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="schedule-nav-btn next-btn"
              onClick={handleNext}
              aria-label="Xem trang sau"
            >
              <span className="nav-btn-label">NEXT</span>
              <span className="nav-btn-arrow">►</span>
            </button>
          </div>

          {/* 2. GIAO DIỆN MOBILE: 1 THẺ PHIM CHÍNH + 2 NỬA THẺ PHIM BÊN CẠNH + SÀN BÓNG LOÁNG + TÊN PHIM + [k/n] */}
          <div
            className={`mobile-poster-showcase ${isNowMode ? 'has-3d-tilt' : 'no-3d-tilt'}`}
            onTouchStart={handleShowcaseTouchStart}
            onTouchEnd={handleShowcaseTouchEnd}
          >
            <div className="mobile-showcase-stage">
              {/* Nửa thẻ phim bên trái (đằng sau) */}
              {leftMovie && (
                <div
                  className="mobile-showcase-item is-side is-left"
                  onClick={goMobilePrev}
                  role="button"
                  tabIndex={0}
                  aria-label={`Phim trước: ${leftMovie.title}`}
                >
                  <div className="mobile-card-frame">
                    <img
                      src={leftMovie.poster}
                      alt={leftMovie.title}
                      className="mobile-card-img"
                      onError={(e) => handlePosterError(e, leftMovie)}
                    />
                  </div>
                  {/* Phản chiếu xuống sàn bóng loáng */}
                  <div className="mobile-card-reflection" aria-hidden="true">
                    <img
                      src={leftMovie.poster}
                      alt=""
                      className="mobile-reflection-img"
                      onError={(e) => handlePosterError(e, leftMovie)}
                    />
                  </div>
                </div>
              )}

              {/* Thẻ phim chính ở giữa */}
              {centerMovie && (
                <div
                  className="mobile-showcase-item is-center"
                  onClick={() => triggerOpenDetail(centerMovie, null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết phim ${centerMovie.title}`}
                >
                  <div className="mobile-card-frame">
                    <img
                      src={centerMovie.poster}
                      alt={centerMovie.title}
                      className="mobile-card-img"
                      onError={(e) => handlePosterError(e, centerMovie)}
                    />
                    <span className="mobile-card-format">{centerMovie.format}</span>
                  </div>
                  {/* Phản chiếu xuống sàn bóng loáng */}
                  <div className="mobile-card-reflection" aria-hidden="true">
                    <img
                      src={centerMovie.poster}
                      alt=""
                      className="mobile-reflection-img"
                      onError={(e) => handlePosterError(e, centerMovie)}
                    />
                  </div>
                </div>
              )}

              {/* Nửa thẻ phim bên phải (đằng sau) */}
              {rightMovie && (
                <div
                  className="mobile-showcase-item is-side is-right"
                  onClick={goMobileNext}
                  role="button"
                  tabIndex={0}
                  aria-label={`Phim tiếp theo: ${rightMovie.title}`}
                >
                  <div className="mobile-card-frame">
                    <img
                      src={rightMovie.poster}
                      alt={rightMovie.title}
                      className="mobile-card-img"
                      onError={(e) => handlePosterError(e, rightMovie)}
                    />
                  </div>
                  {/* Phản chiếu xuống sàn bóng loáng */}
                  <div className="mobile-card-reflection" aria-hidden="true">
                    <img
                      src={rightMovie.poster}
                      alt=""
                      className="mobile-reflection-img"
                      onError={(e) => handlePosterError(e, rightMovie)}
                    />
                  </div>
                </div>
              )}

              {/* Bề mặt ánh sáng sàn nhà bóng loáng */}
              <div className="mobile-glossy-floor" aria-hidden="true"></div>
            </div>

            {/* Dưới sàn bóng loáng: Tên phim + Chỉ thị [k/n] cỡ 0.5em không bôi đen + Nút xem tất cả (Slide 3) */}
            {centerMovie && (
              <div className="mobile-showcase-caption">
                <h3
                  className="mobile-showcase-title"
                  onClick={() => triggerOpenDetail(centerMovie, null)}
                >
                  {centerMovie.title}
                </h3>
                <div className="mobile-showcase-index">
                  [{safeMobileIdx + 1}/{totalMobileMovies}]
                </div>
                {isNowMode && (
                  <button
                    type="button"
                    className="mobile-view-all-btn"
                    onClick={handleOpenAllClick}
                  >
                    xem tất cả-&gt;
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="schedule-empty-state">
          <div className="empty-icon">🎬</div>
          <h3 className="empty-title">Không tìm thấy suất chiếu phù hợp</h3>
          <p className="empty-desc">
            Rạp <strong>{currentCinema?.name}</strong> hiện chưa có lịch chiếu cho ngày {activeDate}.
          </p>
          <button
            type="button"
            className="empty-reset-btn"
            onClick={handleCinemaClear}
          >
            Xem tất cả rạp khác
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleSlide;
