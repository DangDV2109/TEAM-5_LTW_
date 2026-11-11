import React, { useState, useEffect, useMemo } from 'react';
import './MovieDetailPage.css';
import { citiesData } from '../data/cinemasData';
import SearchableSelect from '../components/ScheduleSlide/SearchableSelect';
import Footer from '../components/Footer/Footer';

/**
 * Trang Chi Tiết Phim (MovieDetailPage) - PTIT Cine
 * Tham khảo bố cục Moveek:
 * - Tự do cuộn lên xuống như trang web truyền thống
 * - Phần thông tin trên nền màu xám:
 *   + Thẻ phim (poster) đặt bên trái
 *   + Bên cạnh là: Tên phim, Tên gốc, Nút Yêu thích, Nút Đánh giá, Nút Trailer (dẫn đến YouTube),
 *     Giới thiệu nội dung phim, Đạo diễn, Diễn viên chính, Khởi chiếu, Thời lượng, Giới hạn độ tuổi
 * - Lề dưới màu đen:
 *   + Thanh chọn Thành phố, chọn Rạp, chọn Định dạng (2D, 3D, IMAX...), chọn Ngày chiếu
 *   + Tự động chọn sẵn Thành phố, Rạp, Ngày chiếu, Giờ chiếu nếu người dùng đã chọn từ Slide 3, 4, 5
 * - Dưới nữa là danh sách cụm rạp & các khung giờ chiếu tương ứng
 * - Dưới cùng là thẻ Footer
 */
const MovieDetailPage = ({
  movie,
  initialSelection = {},
  onBack = () => {}
}) => {
  // Cuộn lên đầu trang khi mở trang chi tiết phim
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movie?.id]);

  // Danh sách 6 ngày chiếu tính từ hôm nay
  const dateList = useMemo(() => {
    const days = [];
    const today = new Date();
    const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      days.push({
        value: `${dd}-${mm}-${yyyy}`,
        shortDate: `${dd}/${mm}`,
        dayLabel: i === 0 ? 'Hôm nay' : dayNames[d.getDay()]
      });
    }
    return days;
  }, []);

  // Danh sách các định dạng chiếu có sẵn cho phim
  const availableFormats = useMemo(() => {
    const baseFormat = movie?.format || '2D';
    const set = new Set([baseFormat, '2D', '3D']);
    if (baseFormat === 'IMAX') set.add('IMAX');
    return ['ALL', ...Array.from(set)];
  }, [movie]);

  // Khởi tạo state từ lựa chọn ở Slide 3, 4, 5 (nếu có)
  const [selectedCityId, setSelectedCityId] = useState(() => {
    if (initialSelection?.cityId) return initialSelection.cityId;
    if (initialSelection?.cinemaId) {
      const foundCity = citiesData.find(c =>
        c.cinemas.some(cin => cin.id === initialSelection.cinemaId)
      );
      if (foundCity) return foundCity.id;
    }
    return null;
  });

  const [selectedCinemaId, setSelectedCinemaId] = useState(
    () => initialSelection?.cinemaId || null
  );

  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialSelection?.date && dateList.some(d => d.value === initialSelection.date)) {
      return initialSelection.date;
    }
    return dateList[0]?.value || '';
  });

  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedTime, setSelectedTime] = useState(() => initialSelection?.time || null);

  // State cho nút Yêu thích & Đánh giá
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [bookingNotice, setBookingNotice] = useState(null);

  // Đồng bộ khi initialSelection hoặc movie thay đổi
  useEffect(() => {
    if (initialSelection?.cityId !== undefined) {
      setSelectedCityId(initialSelection.cityId);
    } else if (initialSelection?.cinemaId) {
      const foundCity = citiesData.find(c =>
        c.cinemas.some(cin => cin.id === initialSelection.cinemaId)
      );
      if (foundCity) setSelectedCityId(foundCity.id);
    }
    if (initialSelection?.cinemaId !== undefined) {
      setSelectedCinemaId(initialSelection.cinemaId);
    }
    if (initialSelection?.date) {
      setSelectedDate(initialSelection.date);
    }
    if (initialSelection?.time !== undefined) {
      setSelectedTime(initialSelection.time);
    }
  }, [initialSelection, movie?.id]);

  // Options cho combobox Thành phố
  const citiesOptions = useMemo(() => {
    return citiesData.map(c => ({ id: c.id, name: c.name }));
  }, []);

  // Options cho combobox Rạp (lọc theo Thành phố nếu đã chọn, hoặc hiển thị tất cả rạp)
  const cinemasOptions = useMemo(() => {
    if (selectedCityId) {
      const city = citiesData.find(c => c.id === selectedCityId);
      return city ? city.cinemas : [];
    }
    return citiesData.flatMap(c => c.cinemas);
  }, [selectedCityId]);

  const handleCitySelect = (city) => {
    setSelectedCityId(city.id);
    setSelectedCinemaId(null);
  };

  const handleCityClear = () => {
    setSelectedCityId(null);
    setSelectedCinemaId(null);
  };

  const handleCinemaSelect = (cinema) => {
    setSelectedCinemaId(cinema.id);
    // Nếu chưa chọn thành phố, tự động gán thành phố của rạp đó
    if (!selectedCityId) {
      const parentCity = citiesData.find(c => c.cinemas.some(cin => cin.id === cinema.id));
      if (parentCity) setSelectedCityId(parentCity.id);
    }
  };

  const handleCinemaClear = () => {
    setSelectedCinemaId(null);
  };

  // Danh sách các rạp đang chiếu phim này (đã lọc theo Thành phố & Rạp được chọn)
  const matchingCinemas = useMemo(() => {
    if (!movie) return [];
    const movieCinemaIds = movie.cinemas || [];

    const result = [];
    for (const city of citiesData) {
      if (selectedCityId && city.id !== selectedCityId) continue;

      for (const cinema of city.cinemas) {
        if (selectedCinemaId && cinema.id !== selectedCinemaId) continue;
        if (movieCinemaIds.length === 0 || movieCinemaIds.includes(cinema.id)) {
          result.push({
            ...cinema,
            cityName: city.name
          });
        }
      }
    }
    return result;
  }, [movie, selectedCityId, selectedCinemaId]);

  // Danh sách định dạng hiển thị trong phần lịch chiếu của từng rạp
  const formatsToDisplay = useMemo(() => {
    const primary = movie?.format || '2D';
    const allFormats = primary === 'IMAX' ? ['2D', '3D', 'IMAX'] : ['2D', '3D'];
    if (selectedFormat === 'ALL') return allFormats;
    return allFormats.filter(f => f === selectedFormat);
  }, [movie, selectedFormat]);

  // Khung giờ chiếu theo từng định dạng
  const getScreeningsForFormat = (fmt) => {
    const baseTimes =
      movie?.screenings && movie.screenings.length > 0
        ? movie.screenings
        : ['09:30', '12:15', '15:00', '18:30', '21:15'];

    if (fmt === '3D') {
      // Tạo các khung giờ 3D đan xen hoặc giữ giờ đã chọn nếu trùng
      const subset = baseTimes.filter((_, idx) => idx % 2 === 1);
      const list = subset.length > 0 ? subset : ['14:00', '19:30', '22:00'];
      if (selectedTime && !list.includes(selectedTime) && selectedFormat === '3D') {
        return [selectedTime, ...list];
      }
      return list;
    }
    if (fmt === 'IMAX') {
      return baseTimes;
    }
    return baseTimes;
  };

  const handlePosterError = (e) => {
    const fallback = movie?.fallbackPoster || movie?.youtubeThumbnail || movie?.backdrop;
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  // Mở link YouTube Trailer
  const getYoutubeTrailerUrl = () => {
    if (movie?.trailerUrl) return movie.trailerUrl;
    const query = encodeURIComponent(`${movie?.title || ''} official trailer`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  // Xử lý khi chọn 1 suất chiếu cụ thể
  const handleSelectShowtime = (cinema, fmt, time) => {
    setSelectedTime(time);
    setBookingNotice({
      movieTitle: movie.title,
      cinemaName: cinema.name,
      cinemaAddress: cinema.address,
      date: selectedDate,
      format: fmt,
      time
    });
  };

  if (!movie) return null;

  const ageCode = movie.ageRating ? movie.ageRating.split(' - ')[0] : 'P';

  return (
    <div className="movie-detail-page">
      {/* ========================================================
          PHẦN 1: BANNER THÔNG TIN PHIM TRÊN NỀN MÀU XÁM (PHONG CÁCH MOVEEK)
          ======================================================== */}
      <section className="movie-detail-grey-banner">
        <div
          className="movie-detail-backdrop-blur"
          style={{
            backgroundImage: `url(${movie.backdrop || movie.youtubeThumbnail || movie.poster})`
          }}
        />
        <div className="movie-detail-grey-overlay" />

        <div className="movie-detail-container">
          {/* Thanh điều hướng quay lại */}
          <div className="movie-detail-topbar">
            <button type="button" className="detail-back-btn" onClick={onBack}>
              <span>←</span> Quay lại sảnh chiếu
            </button>
            <div className="detail-breadcrumb">
              <span onClick={onBack} className="breadcrumb-link">Trang chủ</span>
              <span className="breadcrumb-sep">/</span>
              <span>Phim</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{movie.title}</span>
            </div>
          </div>

          {/* Khối chính: Thẻ phim bên trái + Thông tin bên phải */}
          <div className="movie-detail-hero-grid">
            {/* THẺ PHIM (POSTER) */}
            <div className="movie-detail-poster-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="movie-detail-poster-img"
                onError={handlePosterError}
              />
              <span className={`detail-age-badge age-${ageCode.toLowerCase()}`}>
                {ageCode}
              </span>
            </div>

            {/* THÔNG TIN CHI TIẾT PHIM BÊN CẠNH */}
            <div className="movie-detail-info-col">
              <div className="detail-title-block">
                <h1 className="detail-movie-title">{movie.title}</h1>
                <p className="detail-original-title">
                  {movie.originalTitle || movie.title} ({movie.year}) &nbsp;•&nbsp; {movie.genre}
                </p>
              </div>

              {/* Cụm nút hành động: Trailer (YouTube), Đánh giá, Yêu thích */}
              <div className="detail-action-buttons">
                <a
                  href={getYoutubeTrailerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-btn detail-btn-trailer"
                  title="Xem trailer trên YouTube"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Trailer</span>
                </a>

                <button
                  type="button"
                  className={`detail-btn detail-btn-rate ${userRating ? 'is-rated' : ''}`}
                  onClick={() => setIsRatingOpen(prev => !prev)}
                >
                  <span>★</span>
                  <span>
                    {userRating
                      ? `Đã đánh giá (${userRating}/10)`
                      : `Đánh giá (${movie.rating.toFixed(1)})`}
                  </span>
                </button>

                <button
                  type="button"
                  className={`detail-btn detail-btn-fav ${isFavorite ? 'is-active' : ''}`}
                  onClick={() => setIsFavorite(prev => !prev)}
                >
                  <span>{isFavorite ? '♥' : '♡'}</span>
                  <span>{isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
                </button>
              </div>

              {/* Khung chọn số sao khi người dùng bấm nút Đánh giá */}
              {isRatingOpen && (
                <div className="detail-rating-popover">
                  <span className="rating-popover-label">Chọn điểm đánh giá của bạn:</span>
                  <div className="rating-stars-row">
                    {[6, 7, 8, 9, 10].map(score => (
                      <button
                        key={score}
                        type="button"
                        className={`rating-score-pill ${userRating === score ? 'active' : ''}`}
                        onClick={() => {
                          setUserRating(score);
                          setIsRatingOpen(false);
                        }}
                      >
                        ★ {score}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Đoạn giới thiệu nội dung phim */}
              <p className="detail-synopsis">
                {movie.description ||
                  `Bộ phim "${movie.title}" (${movie.year}) thuộc thể loại ${movie.genre.toLowerCase()}, sản xuất tại ${movie.origin}. Một tác phẩm điện ảnh đặc sắc hiện đang được công chiếu tại hệ thống rạp PTIT Cine trên toàn quốc.`}
              </p>

              {/* Hàng thông số kỹ thuật: Khởi chiếu, Thời lượng, Giới hạn tuổi */}
              <div className="detail-meta-strip">
                <div className="detail-meta-box">
                  <span className="meta-label">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Khởi chiếu
                  </span>
                  <strong className="meta-value">{movie.releaseDate}</strong>
                </div>

                <div className="detail-meta-box">
                  <span className="meta-label">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thời lượng
                  </span>
                  <strong className="meta-value">{movie.duration}</strong>
                </div>

                <div className="detail-meta-box">
                  <span className="meta-label">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Giới hạn tuổi
                  </span>
                  <strong className="meta-value">{movie.ageRating}</strong>
                </div>
              </div>

              {/* Thông tin Đạo diễn & Diễn viên chính */}
              <div className="detail-credits">
                <div className="credit-row">
                  <span className="credit-label">Đạo diễn:</span>
                  <span className="credit-value">{movie.director || 'Đang cập nhật'}</span>
                </div>
                <div className="credit-row">
                  <span className="credit-label">Diễn viên chính:</span>
                  <span className="credit-value">{movie.cast || 'Đang cập nhật'}</span>
                </div>
                <div className="credit-row">
                  <span className="credit-label">Xuất xứ:</span>
                  <span className="credit-value">{movie.origin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          PHẦN 2: LỀ DƯỚI MÀU ĐEN - THANH CHỌN THÀNH PHỐ, RẠP, ĐỊNH DẠNG & NGÀY CHIẾU
          ======================================================== */}
      <section className="movie-detail-black-filter-bar">
        <div className="movie-detail-container">
          <div className="filter-bar-top">
            <div className="filter-bar-heading">
              <span className="filter-bar-dot">●</span>
              <h2>Lịch chiếu & Đặt vé</h2>
            </div>

            <div className="filter-controls-group">
              {/* Chọn Thành phố */}
              <div className="filter-control-item">
                <span className="filter-control-label">Thành phố</span>
                <SearchableSelect
                  placeholder="Tất cả thành phố..."
                  options={citiesOptions}
                  selectedId={selectedCityId}
                  onSelect={handleCitySelect}
                  onClear={handleCityClear}
                />
              </div>

              {/* Chọn Rạp */}
              <div className="filter-control-item">
                <span className="filter-control-label">Rạp chiếu</span>
                <SearchableSelect
                  placeholder="Tất cả rạp..."
                  options={cinemasOptions}
                  selectedId={selectedCinemaId}
                  onSelect={handleCinemaSelect}
                  onClear={handleCinemaClear}
                />
              </div>

              {/* Chọn Định dạng (2D / 3D / IMAX...) */}
              <div className="filter-control-item">
                <span className="filter-control-label">Định dạng</span>
                <div className="format-pills-group">
                  {availableFormats.map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      className={`format-pill-btn ${selectedFormat === fmt ? 'active' : ''}`}
                      onClick={() => setSelectedFormat(fmt)}
                    >
                      {fmt === 'ALL' ? 'Tất cả' : fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Thanh chọn Ngày chiếu */}
          <div className="detail-date-strip">
            {dateList.map(d => (
              <button
                key={d.value}
                type="button"
                className={`detail-date-card ${selectedDate === d.value ? 'active' : ''}`}
                onClick={() => setSelectedDate(d.value)}
              >
                <span className="detail-date-day">{d.dayLabel}</span>
                <strong className="detail-date-num">{d.shortDate}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          PHẦN 3: DANH SÁCH RẠP & GIỜ CHIẾU BÊN DƯỚI
          ======================================================== */}
      <section className="movie-detail-showtimes-section">
        <div className="movie-detail-container">
          {/* Hộp thông báo xác nhận khi người dùng chọn giờ chiếu */}
          {bookingNotice && (
            <div className="selected-showtime-banner">
              <div className="selected-showtime-info">
                <span className="selected-badge">Suất chiếu đang chọn</span>
                <h3>
                  {bookingNotice.movieTitle} — <span>{bookingNotice.format}</span>
                </h3>
                <p>
                  Rạp: <strong>{bookingNotice.cinemaName}</strong> ({bookingNotice.cinemaAddress})
                  &nbsp;•&nbsp; Ngày: <strong>{bookingNotice.date}</strong>
                  &nbsp;•&nbsp; Giờ chiếu: <strong className="highlight-time">{bookingNotice.time}</strong>
                </p>
              </div>
              <div className="selected-showtime-actions">
                <button
                  type="button"
                  className="confirm-seat-btn"
                  onClick={() =>
                    alert(
                      `Xác nhận đặt vé:\n- Phim: ${bookingNotice.movieTitle}\n- Rạp: ${bookingNotice.cinemaName}\n- Định dạng: ${bookingNotice.format}\n- Ngày: ${bookingNotice.date}\n- Suất chiếu: ${bookingNotice.time}`
                    )
                  }
                >
                  Tiếp tục chọn ghế →
                </button>
              </div>
            </div>
          )}

          {movie.status === 'coming' && (!movie.screenings || movie.screenings.length === 0) ? (
            <div className="detail-empty-showtimes">
              <div className="empty-icon">🗓️</div>
              <h3>Phim sắp khởi chiếu vào ngày {movie.releaseDate}</h3>
              <p>
                Các suất chiếu sớm đang được cập nhật cho các cụm rạp bên dưới. Bạn có thể chọn
                trước giờ chiếu dự kiến để xem thông tin rạp.
              </p>
            </div>
          ) : null}

          {matchingCinemas.length > 0 ? (
            <div className="cinema-showtimes-list">
              {matchingCinemas.map(cinema => (
                <div key={cinema.id} className="cinema-showtime-card">
                  <div className="cinema-card-header">
                    <div className="cinema-brand-avatar">PTIT</div>
                    <div className="cinema-card-meta">
                      <div className="cinema-name-row">
                        <h3 className="cinema-card-name">{cinema.name}</h3>
                        <span className="cinema-city-tag">{cinema.cityName}</span>
                      </div>
                      <p className="cinema-card-address">{cinema.address}</p>
                    </div>
                  </div>

                  <div className="cinema-formats-body">
                    {formatsToDisplay.map(fmt => {
                      const times = getScreeningsForFormat(fmt);
                      return (
                        <div key={fmt} className="format-row">
                          <div className="format-label-col">
                            <span className="format-tag">{fmt}</span>
                            <span className="format-sub">Phụ đề / Lồng tiếng</span>
                          </div>

                          <div className="showtime-buttons-wrap">
                            {times.map(time => {
                              const isPreselected =
                                selectedTime === time &&
                                (!selectedCinemaId || selectedCinemaId === cinema.id);

                              return (
                                <button
                                  key={`${cinema.id}-${fmt}-${time}`}
                                  type="button"
                                  className={`detail-time-btn ${isPreselected ? 'active' : ''}`}
                                  onClick={() => handleSelectShowtime(cinema, fmt, time)}
                                >
                                  <span className="time-main">{time}</span>
                                  <span className="time-price">75K</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="detail-empty-showtimes">
              <div className="empty-icon">🎬</div>
              <h3>Không tìm thấy cụm rạp phù hợp</h3>
              <p>
                Hiện chưa có lịch chiếu phim <strong>{movie.title}</strong> tại khu vực bạn đang lọc.
              </p>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSelectedCityId(null);
                  setSelectedCinemaId(null);
                  setSelectedFormat('ALL');
                }}
              >
                Xem tất cả rạp chiếu
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          PHẦN 4: FOOTER ĐẶT CUỐI TRANG
          ======================================================== */}
      <Footer isVisible={true} isStatic={true} />
    </div>
  );
};

export default MovieDetailPage;
