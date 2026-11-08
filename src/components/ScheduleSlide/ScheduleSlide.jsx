import React, { useState, useMemo } from 'react';
import './ScheduleSlide.css';
import { moviesData } from '../../data/moviesData';
import { citiesData } from '../../data/cinemasData';
import SearchableSelect from './SearchableSelect';

/**
 * ScheduleSlide Component - PTIT Cine
 * - Hiển thị lịch chiếu phim theo ngày (tab ngày, active nền đỏ)
 * - Chọn Thành phố & Chọn Rạp (dạng list, hỗ trợ cả click và gõ phím) đặt lề phải cùng dòng với title "PHIM ĐANG CHIẾU"
 * - Khi đã chọn rạp: Tự động chỉ hiển thị những phim được chiếu tại rạp đó
 * - Phân trang: 9 thẻ / trang, nút PREV / NEXT đặt hai bên lưới
 */
const ScheduleSlide = () => {
  // ===================== DỮ LIỆU NGÀY CHIẾU =====================
  // Tạo 6 ngày bắt đầu từ hôm nay
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

  const [activeDate, setActiveDate] = useState(dateList[0]);
  const [currentPage, setCurrentPage] = useState(0);

  // ===================== BỘ LỌC THÀNH PHỐ & RẠP =====================
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);

  // Danh sách các thành phố
  const citiesOptions = useMemo(() => {
    return citiesData.map(c => ({
      id: c.id,
      name: c.name
    }));
  }, []);

  // Danh sách các rạp thuộc thành phố đã chọn
  const cinemasOptions = useMemo(() => {
    if (!selectedCityId) return [];
    const city = citiesData.find(c => c.id === selectedCityId);
    return city ? city.cinemas : [];
  }, [selectedCityId]);

  // Thông tin rạp đang chọn (nếu có)
  const currentCinema = useMemo(() => {
    if (!selectedCinemaId) return null;
    for (const city of citiesData) {
      const found = city.cinemas.find(cin => cin.id === selectedCinemaId);
      if (found) return found;
    }
    return null;
  }, [selectedCinemaId]);

  // Xử lý khi chọn thành phố
  const handleCitySelect = (city) => {
    setSelectedCityId(city.id);
    setSelectedCinemaId(null); // Reset rạp khi đổi thành phố
    setCurrentPage(0);
  };

  // Xử lý khi xóa chọn thành phố
  const handleCityClear = () => {
    setSelectedCityId(null);
    setSelectedCinemaId(null);
    setCurrentPage(0);
  };

  // Xử lý khi chọn rạp
  const handleCinemaSelect = (cinema) => {
    setSelectedCinemaId(cinema.id);
    setCurrentPage(0);
  };

  // Xử lý khi xóa chọn rạp
  const handleCinemaClear = () => {
    setSelectedCinemaId(null);
    setCurrentPage(0);
  };

  // ===================== LỌC PHIM THEO RẠP =====================
  const filteredMovies = useMemo(() => {
    // 1. Lọc phim có tag '#schedule'
    let list = moviesData.filter(m => m.tags && m.tags.includes('#schedule'));

    // 2. Nếu đã chọn rạp -> Chỉ hiển thị phim được chiếu tại rạp đó
    if (selectedCinemaId) {
      list = list.filter(m => m.cinemas && m.cinemas.includes(selectedCinemaId));
    }
    // 3. Nếu mới chọn thành phố mà chưa chọn rạp -> hiển thị phim có chiếu ở bất kỳ rạp nào trong thành phố đó
    else if (selectedCityId) {
      const city = citiesData.find(c => c.id === selectedCityId);
      const cityCinemaIds = city ? city.cinemas.map(cin => cin.id) : [];
      list = list.filter(m => m.cinemas && m.cinemas.some(cid => cityCinemaIds.includes(cid)));
    }

    return list;
  }, [selectedCityId, selectedCinemaId]);

  // Phân trang: 9 thẻ / trang
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));

  const displayedMovies = filteredMovies.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Chuyển trang quay vòng: trang cuối bấm NEXT -> về trang đầu, trang đầu bấm PREV -> tới trang cuối
  const handlePrev = () => setCurrentPage(p => (p - 1 + totalPages) % totalPages);
  const handleNext = () => setCurrentPage(p => (p + 1) % totalPages);

  const handleDateChange = (date) => {
    setActiveDate(date);
    setCurrentPage(0);
  };

  // Helper: màu sắc cho cảnh báo độ tuổi
  const getAgeRatingStyle = (ageRating) => {
    if (!ageRating) return {};
    if (ageRating.startsWith('T18')) return { color: '#ED1C24' };
    if (ageRating.startsWith('T16')) return { color: '#ED1C24' };
    if (ageRating.startsWith('T13')) return { color: '#f97316' };
    return { color: '#6b7280' };
  };

  return (
    <div className="schedule-slide-container">
      {/* ===== TIÊU ĐỀ + 2 CHỨC NĂNG DẠNG LIST ĐẶT LỀ PHẢI ===== */}
      <div className="schedule-heading">
        <div className="schedule-heading-left">
          <span className="schedule-dot">●</span>
          <h2 className="schedule-title">Phim đang chiếu</h2>
          {currentCinema && (
            <span className="current-cinema-badge" title={currentCinema.address}>
              Tại: <strong>{currentCinema.name}</strong>
            </span>
          )}
        </div>

        {/* 2 Chức năng dạng list (dropdown/combobox) đặt lề phải */}
        <div className="schedule-heading-filters">
          {/* 1. Chọn Thành Phố */}
          <SearchableSelect
            label="Thành phố"
            placeholder="Chọn thành phố..."
            options={citiesOptions}
            selectedId={selectedCityId}
            onSelect={handleCitySelect}
            onClear={handleCityClear}
          />

          {/* 2. Chọn Rạp */}
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
      </div>

      {/* ===== TAB CHỌN NGÀY ===== */}
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
            {displayedMovies.map(movie => (
              <div key={movie.id} className="schedule-movie-card">
                {/* POSTER trái */}
                <div className="sched-poster-wrap">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="sched-poster-img"
                    loading="lazy"
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
                  <p className="sched-release">Khởi chiếu: {activeDate}</p>

                  {/* Cảnh báo độ tuổi */}
                  <p className="sched-age-rating" style={getAgeRatingStyle(movie.ageRating)}>
                    {movie.ageRating}
                  </p>

                  {/* Lịch chiếu - các nút giờ */}
                  <div className="sched-screenings">
                    <span className="sched-screenings-label">Lịch chiếu:</span>
                    <div className="sched-time-slots">
                      {movie.screenings.map(time => (
                        <button
                          key={time}
                          type="button"
                          className="time-slot-btn"
                          onClick={() => alert(`Đặt vé: ${movie.title}\nRạp: ${currentCinema ? currentCinema.name : 'Tất cả rạp'}\nNgày: ${activeDate} - Suất: ${time}`)}
                          title={`Đặt vé ${movie.title} lúc ${time}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
        /* Trạng thái khi không có phim nào phù hợp */
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

      {/* Chỉ báo trang */}
      {/*{filteredMovies.length > 0 && (
        <div className="schedule-page-indicator">
          Trang <strong>{currentPage + 1}</strong> / {totalPages} (Tổng cộng <strong>{filteredMovies.length}</strong> phim)
        </div>
      )}*/}
    </div>
  );
};

export default ScheduleSlide;
