import React, { useState, useMemo } from 'react';
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
 *   + Có 2 thanh chọn Thành phố & Rạp bên phải tiêu đề
 *   + Có thanh chọn ngày chiếu
 *   + Thẻ phim hiển thị các khung giờ lịch chiếu (đặt cao hơn để không bị che)
 * - 'coming' (Slide 4 - Phim sắp chiếu):
 *   + Cùng vị trí tiêu đề với Slide 3, thay chấm đỏ bằng ký tự 🔜 nhấp nháy đỏ
 *   + Bỏ thanh chọn ngày, bỏ 2 thanh tìm thành phố & tìm rạp
 *   + Cho biết khi nào phim bắt đầu chiếu và phim chỉ chiếu ở khu vực nào ngay trên thẻ phim
 * - 'vietnam' (Slide 5 - Phim Việt Nam):
 *   + Hiển thị phim Việt Nam (kể cả phim đã có trên 2 slide trước vẫn chiếu tại slide này)
 *   + Ngôi sao nhấp nháy màu vàng bao quanh là nền đỏ cỡ 10x25px cạnh tiêu đề
 */
const ScheduleSlide = ({
  mode = 'now',
  onOpenMovieDetail = () => {},
  selectedCityId: externalCityId,
  onCityChange,
  selectedCinemaId: externalCinemaId,
  onCinemaChange,
  activeDate: externalDate,
  onDateChange
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
  };

  const handleCityClear = () => {
    if (onCityChange) onCityChange(null);
    else setInternalCityId(null);

    if (onCinemaChange) onCinemaChange(null);
    else setInternalCinemaId(null);

    setCurrentPage(0);
  };

  const handleCinemaSelect = (cinema) => {
    if (onCinemaChange) onCinemaChange(cinema.id);
    else setInternalCinemaId(cinema.id);

    setCurrentPage(0);
  };

  const handleCinemaClear = () => {
    if (onCinemaChange) onCinemaChange(null);
    else setInternalCinemaId(null);

    setCurrentPage(0);
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

  // Phân trang: 9 thẻ / trang
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

  const lastTapRef = React.useRef({ id: null, time: 0 });

  const triggerOpenDetail = (movie, timeSlot = null) => {
    onOpenMovieDetail(movie, {
      cityId: selectedCityId,
      cinemaId: selectedCinemaId,
      date: activeDate,
      time: timeSlot
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

        {/* 2 Chức năng chọn Thành phố & Rạp chỉ hiển thị ở Slide 3 */}
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

      {/* ===== TAB CHỌN NGÀY (CHỈ HIỂN THỊ Ở SLIDE 3) ===== */}
      {isNowMode && (
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
      )}

      {/* ===== KHU VỰC LƯỚI PHIM + NÚT PREV/NEXT ===== */}
      {filteredMovies.length > 0 ? (
        <div className="schedule-main-area">
          {/* NÚT PREV bên trái */}
          <button
            type="button"
            className="schedule-nav-btn prev-btn"
            onClick={handlePrev}
            aria-label="Xem trang trước"
          >
            <span className="nav-btn-arrow">◄</span>
            <span className="nav-btn-label">PREV</span>
          </button>

          {/* LƯỚI 9 THẺ PHIM (3x3) */}
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
                  {/* POSTER trái */}
                  <div className="sched-poster-wrap">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="sched-poster-img"
                      loading="lazy"
                      onError={(e) => handlePosterError(e, movie)}
                    />
                  </div>

                  {/* THÔNG TIN phải */}
                  <div className="sched-info">
                    {/* Dòng 1: thể loại + thời lượng + badge định dạng */}
                    <div className="sched-meta-top">
                      <span className="sched-genre-duration">
                        {movie.genre} &nbsp;•&nbsp; {movie.duration}
                      </span>
                      <span className="sched-format-badge">{movie.format}</span>
                    </div>

                    {/* Tên phim */}
                    <h3 className="sched-movie-title">{movie.title.toUpperCase()}</h3>

                    {/* Xuất xứ */}
                    <p className="sched-origin">Xuất xứ: {movie.origin}</p>

                    {/* Khởi chiếu */}
                    {showComingDetails ? (
                      <p className="sched-release sched-release-coming">
                        Bắt đầu chiếu: <strong>{movie.releaseDate}</strong>
                      </p>
                    ) : (
                      <p className="sched-release">Khởi chiếu: {movie.releaseDate || activeDate}</p>
                    )}

                    {/* Cảnh báo độ tuổi */}
                    <p className="sched-age-rating" style={getAgeRatingStyle(movie.ageRating)}>
                      {movie.ageRating}
                    </p>

                    {/* Khu vực chiếu (Slide 4 / phim sắp chiếu) HOẶC Lịch chiếu (Slide 3 / phim đang chiếu) */}
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

          {/* NÚT NEXT bên phải */}
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
