import React, { useState, useEffect, useMemo } from 'react';
import './AllMoviesPage.css';
import { moviesData } from '../data/moviesData';
import { citiesData } from '../data/cinemasData';
import SearchableSelect from '../components/ScheduleSlide/SearchableSelect';
import Footer from '../components/Footer/Footer';

/**
 * Trang Toàn Bộ Phim Đang Chiếu (AllMoviesPage) - PTIT Cine
 * - Mở từ nút "xem tất cả->" ở Slide 3
 * - Tự động chọn sẵn Thành phố, Rạp, Ngày chiếu, Giờ chiếu nếu người dùng đã chọn ở ngoài
 */
const AllMoviesPage = ({
  initialSelection = {},
  onSelectionChange = () => {},
  onOpenMovieDetail = () => {},
  onBack = () => {}
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Danh sách 6 ngày chiếu tính từ hôm nay
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

  const [selectedCityId, setSelectedCityId] = useState(() => initialSelection?.cityId || null);
  const [selectedCinemaId, setSelectedCinemaId] = useState(() => initialSelection?.cinemaId || null);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialSelection?.date && dateList.includes(initialSelection.date)) {
      return initialSelection.date;
    }
    return dateList[0];
  });
  const [selectedTime, setSelectedTime] = useState(() => initialSelection?.time || null);

  // Đồng bộ ngược lại state chung của App khi thay đổi bộ lọc
  const updateFilters = (patch) => {
    const next = {
      cityId: selectedCityId,
      cinemaId: selectedCinemaId,
      date: selectedDate,
      time: selectedTime,
      ...patch
    };
    onSelectionChange(next);
  };

  const citiesOptions = useMemo(() => {
    return citiesData.map(c => ({ id: c.id, name: c.name }));
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

  // Tất cả phim đang chiếu
  const allNowMovies = useMemo(() => {
    return moviesData.filter(m => m.status === 'now');
  }, []);

  // Danh sách toàn bộ khung giờ có trong các phim đang chiếu
  const availableTimes = useMemo(() => {
    const set = new Set();
    allNowMovies.forEach(m => {
      (m.screenings || []).forEach(t => set.add(t));
    });
    return Array.from(set).sort();
  }, [allNowMovies]);

  // Lọc phim theo Thành phố, Rạp và Giờ chiếu đã chọn
  const filteredMovies = useMemo(() => {
    let list = allNowMovies;

    if (selectedCinemaId) {
      list = list.filter(m => m.cinemas && m.cinemas.includes(selectedCinemaId));
    } else if (selectedCityId) {
      const city = citiesData.find(c => c.id === selectedCityId);
      const cityCinemaIds = city ? city.cinemas.map(cin => cin.id) : [];
      list = list.filter(m => m.cinemas && m.cinemas.some(cid => cityCinemaIds.includes(cid)));
    }

    if (selectedTime) {
      list = list.filter(m => m.screenings && m.screenings.includes(selectedTime));
    }

    return list;
  }, [allNowMovies, selectedCityId, selectedCinemaId, selectedTime]);

  const handleCitySelect = (city) => {
    setSelectedCityId(city.id);
    setSelectedCinemaId(null);
    updateFilters({ cityId: city.id, cinemaId: null });
  };

  const handleCityClear = () => {
    setSelectedCityId(null);
    setSelectedCinemaId(null);
    updateFilters({ cityId: null, cinemaId: null });
  };

  const handleCinemaSelect = (cinema) => {
    setSelectedCinemaId(cinema.id);
    updateFilters({ cinemaId: cinema.id });
  };

  const handleCinemaClear = () => {
    setSelectedCinemaId(null);
    updateFilters({ cinemaId: null });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    updateFilters({ date });
  };

  const handleTimeSelect = (time) => {
    const nextTime = selectedTime === time ? null : time;
    setSelectedTime(nextTime);
    updateFilters({ time: nextTime });
  };

  const handlePosterError = (e, movie) => {
    const fallback = movie.fallbackPoster || movie.youtubeThumbnail || movie.backdrop;
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  const getAgeRatingStyle = (ageRating) => {
    if (!ageRating) return {};
    if (ageRating.startsWith('T18') || ageRating.startsWith('T16')) return { color: '#ED1C24' };
    if (ageRating.startsWith('T13')) return { color: '#f97316' };
    return { color: '#9ca3af' };
  };

  return (
    <div className="all-movies-page">
      <div className="all-movies-container">
        {/* Thanh quay lại */}
        <div className="am-topbar">
          <button type="button" className="am-back-btn" onClick={onBack}>
            <span>←</span> Quay lại lịch chiếu
          </button>
          <span className="am-count-badge">
            Hiển thị <strong>{filteredMovies.length}</strong> phim đang chiếu
          </span>
        </div>

        {/* Tiêu đề & Bộ lọc Thành phố / Rạp */}
        <div className="am-header-row">
          <div className="am-title-group">
            <span className="am-dot">●</span>
            <h1 className="am-title">Toàn bộ phim đang chiếu</h1>
            {currentCinema && (
              <span className="am-cinema-tag">
                Tại: <strong>{currentCinema.name}</strong>
              </span>
            )}
          </div>

          <div className="am-filters-row">
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
        </div>

        {/* Bộ lọc Ngày chiếu & Giờ chiếu */}
        <div className="am-datetime-bar">
          <div className="am-date-group">
            <span className="am-filter-label">Ngày chiếu:</span>
            <div className="am-date-list">
              {dateList.map(date => (
                <button
                  key={date}
                  type="button"
                  className={`am-date-btn ${selectedDate === date ? 'active' : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          <div className="am-time-group">
            <span className="am-filter-label">Giờ chiếu:</span>
            <div className="am-time-list">
              <button
                type="button"
                className={`am-time-filter-btn ${!selectedTime ? 'active' : ''}`}
                onClick={() => handleTimeSelect(null)}
              >
                Tất cả
              </button>
              {availableTimes.map(time => (
                <button
                  key={time}
                  type="button"
                  className={`am-time-filter-btn ${selectedTime === time ? 'active' : ''}`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lưới danh sách toàn bộ phim đang chiếu */}
        {filteredMovies.length > 0 ? (
          <div className="am-movies-grid">
            {filteredMovies.map(movie => (
              <article
                key={movie.id}
                className="am-movie-card"
                onClick={() =>
                  onOpenMovieDetail(movie, {
                    cityId: selectedCityId,
                    cinemaId: selectedCinemaId,
                    date: selectedDate,
                    time: selectedTime
                  })
                }
              >
                <div className="am-poster-box">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="am-poster-img"
                    loading="lazy"
                    onError={(e) => handlePosterError(e, movie)}
                  />
                  <span className="am-rating-badge">★ {movie.rating.toFixed(1)}</span>
                </div>

                <div className="am-card-body">
                  <div className="am-meta-top">
                    <span className="am-genre">{movie.genre} • {movie.duration}</span>
                    <span className="am-format">{movie.format}</span>
                  </div>

                  <h2 className="am-movie-title">{movie.title}</h2>
                  <p className="am-origin">Xuất xứ: {movie.origin} • Khởi chiếu: {movie.releaseDate}</p>
                  <p className="am-age" style={getAgeRatingStyle(movie.ageRating)}>
                    {movie.ageRating}
                  </p>

                  <div className="am-screenings">
                    <span className="am-screenings-label">Chọn giờ chiếu ({selectedDate}):</span>
                    <div className="am-slots">
                      {(movie.screenings || []).map(time => (
                        <button
                          key={time}
                          type="button"
                          className={`am-slot-btn ${selectedTime === time ? 'is-preselected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMovieDetail(movie, {
                              cityId: selectedCityId,
                              cinemaId: selectedCinemaId,
                              date: selectedDate,
                              time
                            });
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="am-empty">
            <h3>Không tìm thấy phim phù hợp với bộ lọc đã chọn</h3>
            <button
              type="button"
              className="am-reset-btn"
              onClick={() => {
                setSelectedCityId(null);
                setSelectedCinemaId(null);
                setSelectedTime(null);
                updateFilters({ cityId: null, cinemaId: null, time: null });
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <Footer isVisible={true} isStatic={true} />
    </div>
  );
};

export default AllMoviesPage;
