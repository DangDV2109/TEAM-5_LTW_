import React, { useState, useEffect, useRef, useMemo } from 'react';
import './BodySlider.css';
import { featuredMovies, heroMovies, remainingMovies } from '../../data/movieSelectors';
import MovieCard from '../MovieCard/MovieCard';
import ScheduleSlide from '../ScheduleSlide/ScheduleSlide';
import TicketPricePage from '../../pages/TicketPricePage';

/**
 * BodySlider Component - PTIT Cine
 * Tổng cộng 6 Slide (n = 6):
 * - Slide 1: ĐẶT VÉ - 3/4 trên: poster wallpaper 16:9 tự động chuyển mỗi 5s (bỏ tiêu đề "PHIM NỔI BẬT ĐANG CHIẾU")
 *                     1/4 dưới: các thẻ phim hot (đã bỏ bớt phim hot), không cho bôi đen trừ tên phim
 * - Slide 2: ĐẶT VÉ (tiếp) - Trục tọa độ Oxy, bản mobile thu nhỏ thẻ phim không bị che đầu/cuối
 * - Slide 3: LỊCH CHIẾU - Phim đang chiếu (có nút "xem tất cả->")
 * - Slide 4: LỊCH CHIẾU - Phim sắp chiếu (không có nút "xem tất cả", không nghiêng 2 nửa thẻ sau, bỏ circle at top)
 * - Slide 5: PHIM VIỆT NAM (như Slide 4, sửa thành circle at bottom)
 * - Slide 6: GIÁ VÉ (nền xám hoàn toàn không circle at, 4 vùng 2D / 3D / Phụ thu / Ưu đãi + CCCD online, nút [vie/eng])
 */

const wrapIndex = (index, total) => (total > 0 ? (index + total) % total : 0);

const SLOT_HEIGHT = 16;
const DOT_SIZE = 4;
const ITEM_GAP = 8;
const SLOT_STEP = SLOT_HEIGHT + ITEM_GAP + DOT_SIZE + ITEM_GAP;
const VISIBLE_TICKS = 5;
const VIEWPORT_HEIGHT = VISIBLE_TICKS * SLOT_STEP + DOT_SIZE;

const BodySlider = ({
  activeSlide = 0,
  onSlideChange = () => {},
  onOpenMovieDetail = () => {},
  onOpenAllMovies = () => {},
  scheduleFilters = {},
  onScheduleFiltersChange = () => {}
}) => {
  // ===================== SLIDE 1: POSTER LỚN (TỰ ĐỘNG CHUYỂN MỖI 5 GIÂY) =====================
  const [heroIndex, setHeroIndex] = useState(0);
  const heroCount = heroMovies.length;
  const currentHero = heroMovies[heroIndex];

  const handleHeroPrev = () => setHeroIndex(i => wrapIndex(i - 1, heroCount));
  const handleHeroNext = () => setHeroIndex(i => wrapIndex(i + 1, heroCount));

  // Tự động chuyển poster mỗi 5 giây (5000ms)
  useEffect(() => {
    if (heroCount <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(i => wrapIndex(i + 1, heroCount));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroCount, heroIndex]);

  const handleHeroImgError = (e, movie) => {
    if (movie.youtubeThumbnail && e.currentTarget.src !== movie.youtubeThumbnail) {
      e.currentTarget.src = movie.youtubeThumbnail;
    }
  };

  // ===================== SLIDE 2: PHIM CÒN LẠI (TRỤC TỌA ĐỘ OXY) =====================
  const [moreShift, setMoreShift] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');

  const slide2Columns = useMemo(() => {
    const first12 = remainingMovies.slice(0, 12);
    const hidden = remainingMovies.slice(12);

    const initialCols = [];
    for (let col = 0; col < 6; col++) {
      const colItems = [];
      if (first12[col]) colItems.push(first12[col]);
      if (first12[col + 6]) colItems.push(first12[col + 6]);
      if (colItems.length > 0) initialCols.push(colItems);
    }

    const hiddenCols = [];
    for (let i = 0; i < hidden.length; i += 2) {
      hiddenCols.push(hidden.slice(i, i + 2));
    }

    return {
      initialCols,
      rightRegionCols: initialCols.slice(3, 6),
      hiddenCols
    };
  }, []);

  const hasHiddenMovies = slide2Columns.hiddenCols.length > 0;
  const totalMoreStates = hasHiddenMovies ? 2 : 1;

  const handleMorePrev = () => {
    setSlideDirection('prev');
    setMoreShift(s => wrapIndex(s - 1, totalMoreStates));
  };

  const handleMoreNext = () => {
    setSlideDirection('next');
    setMoreShift(s => wrapIndex(s + 1, totalMoreStates));
  };

  const visibleSlide2Cols =
    moreShift === 0
      ? slide2Columns.initialCols
      : [...slide2Columns.rightRegionCols, ...slide2Columns.hiddenCols];

  // ===================== TỔNG SỐ SLIDE (n = 6) =====================
  const TOTAL_SLIDES = 6;
  const slides = useMemo(() => Array.from({ length: TOTAL_SLIDES }, (_, i) => i), [TOTAL_SLIDES]);

  const isWheelingRef = useRef(false);
  const touchStartYRef = useRef(null);
  const touchStartXRef = useRef(null);

  // Lắng nghe sự kiện bàn phím (Mũi tên lên/xuống), con lăn chuột / touchpad, và vuốt dọc trên mobile
  useEffect(() => {
    const isReceivingKeyboardInput = () => {
      const activeEl = document.activeElement;
      if (!activeEl) return false;
      if (['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) return true;
      if (activeEl.closest?.('.search-wrapper, .searchable-select-wrap.is-open')) return true;
      return false;
    };

    const isBlockedByHeaderOrInputs = (e) => {
      if (isReceivingKeyboardInput()) return true;
      if (document.querySelector('.searchable-select-wrap.is-open')) return true;

      const targetEl = e?.target instanceof Element ? e.target : null;
      const headerInteractiveSelector =
        '.brand-logo, .header-nav-desktop, .nav-item-btn, .header-right, .search-wrapper, .map-btn, .header-action-btn, .hamburger-btn, .mobile-menu-drawer, .ptit-header';

      if (targetEl && targetEl.closest(headerInteractiveSelector)) {
        return true;
      }
      if (document.querySelector('.ptit-header:hover')) {
        return true;
      }

      if (targetEl && targetEl.closest('.searchable-select-wrap')) {
        return true;
      }
      if (document.querySelector('.searchable-select-wrap:hover')) {
        return true;
      }

      // Nếu vùng nội dung ở Slide 6 có thanh cuộn dọc nội bộ và chưa chạm biên
      const scrollableZone = targetEl ? targetEl.closest('.tp-zone-content') : null;
      if (scrollableZone && scrollableZone.scrollHeight > scrollableZone.clientHeight + 2) {
        if (e.deltaY > 0 && scrollableZone.scrollTop + scrollableZone.clientHeight < scrollableZone.scrollHeight - 2) {
          return true;
        }
        if (e.deltaY < 0 && scrollableZone.scrollTop > 2) {
          return true;
        }
      }

      return false;
    };

    const handleKeyDown = (e) => {
      if (isReceivingKeyboardInput()) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeSlide < TOTAL_SLIDES - 1) {
          onSlideChange(activeSlide + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeSlide > 0) {
          onSlideChange(activeSlide - 1);
        }
      }
    };

    const handleWheel = (e) => {
      if (isBlockedByHeaderOrInputs(e)) return;
      if (isWheelingRef.current) return;
      if (Math.abs(e.deltaY) < 25) return;

      if (e.deltaY > 0) {
        if (activeSlide < TOTAL_SLIDES - 1) {
          isWheelingRef.current = true;
          onSlideChange(activeSlide + 1);
          setTimeout(() => {
            isWheelingRef.current = false;
          }, 750);
        }
      } else if (e.deltaY < 0) {
        if (activeSlide > 0) {
          isWheelingRef.current = true;
          onSlideChange(activeSlide - 1);
          setTimeout(() => {
            isWheelingRef.current = false;
          }, 750);
        }
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
        touchStartXRef.current = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartYRef.current === null || !e.changedTouches || e.changedTouches.length === 0) return;
      const targetEl = e.target instanceof Element ? e.target : null;
      if (targetEl && targetEl.closest('.ptit-header, .searchable-select-wrap, .tp-zone-content')) {
        touchStartYRef.current = null;
        return;
      }
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      const deltaX = Math.abs((touchStartXRef.current || 0) - e.changedTouches[0].clientX);
      touchStartYRef.current = null;
      touchStartXRef.current = null;

      // Chỉ chuyển slide dọc khi vuốt dọc rõ rệt hơn vuốt ngang
      if (Math.abs(deltaY) > 55 && Math.abs(deltaY) > deltaX * 1.3) {
        if (deltaY > 0 && activeSlide < TOTAL_SLIDES - 1) {
          onSlideChange(activeSlide + 1);
        } else if (deltaY < 0 && activeSlide > 0) {
          onSlideChange(activeSlide - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeSlide, onSlideChange, TOTAL_SLIDES]);

  const maxWindowStart = Math.max(0, TOTAL_SLIDES - VISIBLE_TICKS);
  const windowStart = Math.min(Math.max(0, activeSlide - 2), maxWindowStart);
  const flagSlotIndex = activeSlide - windowStart;
  const flagTop = DOT_SIZE + ITEM_GAP + flagSlotIndex * SLOT_STEP + SLOT_HEIGHT / 2;

  return (
    <div className="body-slider-wrapper">
      <div
        className="slides-track"
        style={{ transform: `translateY(-${activeSlide * 100}%)` }}
      >
        {/* ========================================================
            SLIDE 1: ĐẶT VÉ
            - Bỏ tiêu đề "PHIM NỔI BẬT ĐANG CHIẾU"
            - Mỗi 5 giây chuyển poster
            - Không cho người dùng bôi đen nội dung trừ tên phim
            - Bỏ bớt phim có tag hot
            - Bản mobile sửa lỗi các thẻ phim đè lên nhau
            ======================================================== */}
        <section className="slide-section slide-home" id="slide-1">
          <div className="home-hero">
            {heroMovies.map((movie, idx) => (
              <div
                key={movie.id}
                className={`hero-slide ${idx === heroIndex ? 'active' : ''}`}
                aria-hidden={idx !== heroIndex}
              >
                <img
                  src={movie.backdrop || movie.youtubeThumbnail}
                  alt={movie.title}
                  className="hero-slide-img"
                  onError={(e) => handleHeroImgError(e, movie)}
                />
              </div>
            ))}
            <div className="hero-shade"></div>

            {/* Thông tin phim của poster hiện tại (chỉ cho phép bôi đen tên phim) */}
            {currentHero && (
              <div className="hero-movie-meta" key={currentHero.id}>
                <h3 className="hero-movie-title">{currentHero.title}</h3>
                <p className="hero-movie-sub">
                  {currentHero.genre} &nbsp;•&nbsp; {currentHero.duration} &nbsp;•&nbsp; ★ {currentHero.rating.toFixed(1)}
                </p>
                <button
                  type="button"
                  className="hero-book-btn"
                  onClick={() => onOpenMovieDetail(currentHero, scheduleFilters)}
                >
                  Đặt vé ngay
                </button>
              </div>
            )}

            {heroCount > 1 && (
              <>
                <button
                  type="button"
                  className="edge-arrow-btn edge-arrow-prev"
                  onClick={handleHeroPrev}
                  title="Poster trước"
                  aria-label="Previous poster"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="edge-arrow-btn edge-arrow-next"
                  onClick={handleHeroNext}
                  title="Poster tiếp theo"
                  aria-label="Next poster"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* PHẦN DƯỚI: CÁC THẺ PHIM HOT */}
          <div className="home-bottom">
            <div className="home-cards-row">
              {featuredMovies.map((movie) => {
                const isCurrentPoster = currentHero && currentHero.id === movie.id;
                const heroIdxOfCard = heroMovies.findIndex(h => h.id === movie.id);
                return (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isHighlighted={isCurrentPoster}
                    isDimmed={Boolean(currentHero && !isCurrentPoster)}
                    onCardClick={() => {
                      if (heroIdxOfCard !== -1) {
                        setHeroIndex(heroIdxOfCard);
                      }
                    }}
                    onOpenDetail={(m) => onOpenMovieDetail(m, scheduleFilters)}
                  />
                );
              })}
            </div>

            <button
              type="button"
              className="scroll-down-hint"
              onClick={() => onSlideChange(1)}
              title="Kéo xuống để xem thêm phim"
              aria-label="Scroll down"
            >
              <span className="scroll-chevron"></span>
              <span className="scroll-chevron"></span>
              <span className="scroll-chevron"></span>
            </button>
          </div>
        </section>

        {/* ========================================================
            SLIDE 2: ĐẶT VÉ (tiếp)
            - Bản mobile làm nhỏ thẻ phim lại, không bị che 2 thẻ đầu và 2 thẻ dưới cuối
            ======================================================== */}
        <section className="slide-section slide-more" id="slide-2">
          <div className="more-movies-area">
            {totalMoreStates > 1 && (
              <button
                type="button"
                className="edge-arrow-btn edge-arrow-prev"
                onClick={handleMorePrev}
                title="Chuyển 6 thẻ vùng x > 0 cùng phim đang ẩn"
                aria-label="Previous page"
              >
                ‹
              </button>
            )}

            <div
              className={`more-movies-columns-track dir-${slideDirection}`}
              key={moreShift}
            >
              {visibleSlide2Cols.map((colMovies) => (
                <div className="more-movies-col" key={colMovies.map(m => m.id).join('-')}>
                  {colMovies.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onOpenDetail={(m) => onOpenMovieDetail(m, scheduleFilters)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {totalMoreStates > 1 && (
              <button
                type="button"
                className="edge-arrow-btn edge-arrow-next"
                onClick={handleMoreNext}
                title="Chuyển 6 thẻ vùng x > 0 cùng phim đang ẩn"
                aria-label="Next page"
              >
                ›
              </button>
            )}
          </div>
        </section>

        {/* ========================================================
            SLIDE 3: LỊCH CHIẾU - PHIM ĐANG CHIẾU
            ======================================================== */}
        <section className="slide-section slide-schedule" id="slide-3">
          <ScheduleSlide
            mode="now"
            selectedCityId={scheduleFilters.cityId}
            onCityChange={(cityId) =>
              onScheduleFiltersChange(prev => ({ ...prev, cityId, cinemaId: null }))
            }
            selectedCinemaId={scheduleFilters.cinemaId}
            onCinemaChange={(cinemaId) =>
              onScheduleFiltersChange(prev => ({ ...prev, cinemaId }))
            }
            activeDate={scheduleFilters.date}
            onDateChange={(date) =>
              onScheduleFiltersChange(prev => ({ ...prev, date }))
            }
            selectedTime={scheduleFilters.time}
            onTimeChange={(time) =>
              onScheduleFiltersChange(prev => ({ ...prev, time }))
            }
            onOpenMovieDetail={onOpenMovieDetail}
            onOpenAllMovies={onOpenAllMovies}
          />
        </section>

        {/* ========================================================
            SLIDE 4: LỊCH CHIẾU - PHIM SẮP CHIẾU
            ======================================================== */}
        <section className="slide-section slide-schedule" id="slide-4">
          <ScheduleSlide
            mode="coming"
            selectedCityId={scheduleFilters.cityId}
            selectedCinemaId={scheduleFilters.cinemaId}
            activeDate={scheduleFilters.date}
            onOpenMovieDetail={onOpenMovieDetail}
          />
        </section>

        {/* ========================================================
            SLIDE 5: PHIM VIỆT NAM
            ======================================================== */}
        <section className="slide-section slide-schedule" id="slide-5">
          <ScheduleSlide
            mode="vietnam"
            selectedCityId={scheduleFilters.cityId}
            selectedCinemaId={scheduleFilters.cinemaId}
            activeDate={scheduleFilters.date}
            onOpenMovieDetail={onOpenMovieDetail}
          />
        </section>

        {/* ========================================================
            SLIDE 6: GIÁ VÉ (Chuyển từ trang Giá vé thành Slide 6)
            ======================================================== */}
        <section className="slide-section slide-pricing" id="slide-6">
          <TicketPricePage />
        </section>
      </div>

      {/* THANH ĐIỀU HƯỚNG SLIDE DỌC BÊN PHẢI */}
      <aside className="right-slide-nav" aria-label="Slide Navigation">
        <div
          className="nav-rail-viewport"
          style={{ height: `${VIEWPORT_HEIGHT}px` }}
        >
          <div
            className="nav-rail-track"
            style={{
              transform: `translate3d(0, -${windowStart * SLOT_STEP}px, 0)`
            }}
          >
            {(() => {
              const dotRelPos = 0 - windowStart;
              const dotDistFromCenter = dotRelPos - 2.5;
              const isDotVisible = dotRelPos >= 0 && dotRelPos <= VISIBLE_TICKS;
              const dotRotateX = Math.max(-65, Math.min(65, dotDistFromCenter * -18));
              return (
                <div
                  className={`nav-dot ${isDotVisible ? 'is-visible' : 'is-out'}`}
                  style={{
                    transform: `rotateX(${dotRotateX}deg)`
                  }}
                ></div>
              );
            })()}

            {slides.map(idx => {
              const relPos = idx - windowStart;
              const distFromCenter = relPos - 2;
              const isVisibleInWindow = relPos >= 0 && relPos < VISIBLE_TICKS;
              const rotateXDeg = Math.max(-65, Math.min(65, distFromCenter * -22));
              const scaleVal = isVisibleInWindow
                ? 1 - Math.abs(distFromCenter) * 0.05
                : 0.72;

              const dotIdx = idx + 1;
              const dotRelPos = dotIdx - windowStart;
              const dotDistFromCenter = dotRelPos - 2.5;
              const isDotVisible = dotRelPos >= 0 && dotRelPos <= VISIBLE_TICKS;
              const dotRotateX = Math.max(-65, Math.min(65, dotDistFromCenter * -18));

              return (
                <React.Fragment key={idx}>
                  <div
                    className={`nav-slot ${activeSlide === idx ? 'is-active' : ''} ${
                      isVisibleInWindow ? 'is-visible' : 'is-out'
                    }`}
                    style={{
                      transform: `rotateX(${rotateXDeg}deg) scale(${scaleVal})`
                    }}
                    title={
                      activeSlide === idx
                        ? `Đang xem Slide ${idx + 1}`
                        : `Chuyển đến Slide ${idx + 1}`
                    }
                    onClick={() => onSlideChange(idx)}
                  >
                    <div className="nav-slide-tick"></div>
                  </div>

                  <div
                    className={`nav-dot ${isDotVisible ? 'is-visible' : 'is-out'}`}
                    style={{
                      transform: `rotateX(${dotRotateX}deg)`
                    }}
                  ></div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div
          className="nav-active-flag"
          style={{ top: `${flagTop}px` }}
          onClick={() => onSlideChange(activeSlide)}
          aria-hidden="true"
        >
          <span className="nav-active-num" key={activeSlide}>
            {activeSlide + 1}
          </span>
        </div>
      </aside>
    </div>
  );
};

export default BodySlider;
