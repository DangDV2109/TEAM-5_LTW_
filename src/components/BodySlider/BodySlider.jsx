import React, { useState, useEffect, useRef, useMemo } from 'react';
import './BodySlider.css';
import { featuredMovies, heroMovies, remainingMovies } from '../../data/movieSelectors';
import MovieCard from '../MovieCard/MovieCard';
import ScheduleSlide from '../ScheduleSlide/ScheduleSlide';

/**
 * BodySlider Component - PTIT Cine
 * Tổng cộng 6 Slide (n = 6):
 * - Slide 1: ĐẶT VÉ - 3/4 trên: poster wallpaper 16:9 tự động chuyển mỗi 2s (hỗ trợ thumbnail 16:9 từ YouTube)
 *                     1/4 dưới: 8 thẻ phim hot, tô sáng thẻ phim nào đang được trình chiếu poster
 * - Slide 2: ĐẶT VÉ (tiếp) - Khi chưa bấm '>' hoặc '<' hiển thị 12 thẻ phim như cũ;
 *            Khi click '>' hoặc '<', chuyển 6 thẻ phim ở vùng x > 0 sang bên cạnh cùng với phim đang bị ẩn
 * - Slide 3: LỊCH CHIẾU - Phim đang chiếu
 * - Slide 4: LỊCH CHIẾU - Phim sắp chiếu
 * - Slide 5: PHIM VIỆT NAM - Hiển thị phim Việt Nam (kể cả đã có trên 2 slide trước)
 * - Slide 6: Blank màu đen (Footer hiện đè lên)
 */

// Chuyển trang quay vòng
const wrapIndex = (index, total) => (total > 0 ? (index + total) % total : 0);

const SLOT_HEIGHT = 16;
const SLOT_GAP = 14;
const SLOT_STEP = SLOT_HEIGHT + SLOT_GAP; // 30px mỗi nấc trên thanh ray
const VISIBLE_TICKS = 5; // Chỉ hiển thị 5 gạch trắng

const BodySlider = ({ activeSlide = 0, onSlideChange = () => {} }) => {
  // ===================== SLIDE 1: POSTER LỚN (TỰ ĐỘNG CHUYỂN MỖI 2 GIÂY) =====================
  const [heroIndex, setHeroIndex] = useState(0);
  const heroCount = heroMovies.length;
  const currentHero = heroMovies[heroIndex];

  const handleHeroPrev = () => setHeroIndex(i => wrapIndex(i - 1, heroCount));
  const handleHeroNext = () => setHeroIndex(i => wrapIndex(i + 1, heroCount));

  // Tự động chuyển poster mỗi 2 giây (2000ms)
  useEffect(() => {
    if (heroCount <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(i => wrapIndex(i + 1, heroCount));
    }, 2000);
    return () => clearInterval(timer);
  }, [heroCount, heroIndex]);

  const handleHeroImgError = (e, movie) => {
    if (movie.youtubeThumbnail && e.currentTarget.src !== movie.youtubeThumbnail) {
      e.currentTarget.src = movie.youtubeThumbnail;
    }
  };

  // ===================== SLIDE 2: PHIM CÒN LẠI (TRỤC TỌA ĐỘ OXY) =====================
  // Khi chưa bấm '>' hoặc '<' (moreShift = 0): hiển thị 12 thẻ phim như cũ (6 thẻ vùng x < 0, 6 thẻ vùng x > 0).
  // Trong lưới 6 cột x 2 hàng:
  // - Vùng x < 0 (3 cột bên trái: cột 1, 2, 3) gồm 6 thẻ: hàng trên [0, 1, 2] và hàng dưới [6, 7, 8]
  // - Vùng x > 0 (3 cột bên phải: cột 4, 5, 6) gồm 6 thẻ: hàng trên [3, 4, 5] và hàng dưới [9, 10, 11]
  // - Phim đang bị ẩn: từ vị trí 12 trở đi (ví dụ: Inception)
  // Khi click '>' hoặc '<': chuyển 6 thẻ phim ở vùng x > 0 sang bên cạnh (vùng x < 0) cùng với phim đang bị ẩn.
  const [moreShift, setMoreShift] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');

  // Chia thành các cột 2 hàng để vùng x < 0 (3 cột đầu) và vùng x > 0 (3 cột sau) đúng vị trí hình học Oxy
  const slide2Columns = useMemo(() => {
    const first12 = remainingMovies.slice(0, 12);
    const hidden = remainingMovies.slice(12);

    // 6 cột đầu (12 thẻ ban đầu: hàng 1 là 0..5, hàng 2 là 6..11)
    const initialCols = [];
    for (let col = 0; col < 6; col++) {
      const colItems = [];
      if (first12[col]) colItems.push(first12[col]);
      if (first12[col + 6]) colItems.push(first12[col + 6]);
      if (colItems.length > 0) initialCols.push(colItems);
    }

    // Các cột chứa phim đang bị ẩn (mỗi cột tối đa 2 phim)
    const hiddenCols = [];
    for (let i = 0; i < hidden.length; i += 2) {
      hiddenCols.push(hidden.slice(i, i + 2));
    }

    return {
      initialCols, // 6 cột: 3 cột vùng x < 0 (cols 0,1,2) + 3 cột vùng x > 0 (cols 3,4,5)
      rightRegionCols: initialCols.slice(3, 6), // 3 cột vùng x > 0 (6 thẻ phim)
      hiddenCols // các cột phim đang bị ẩn
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

  // Các cột hiển thị ở Slide 2 tùy theo trạng thái
  const visibleSlide2Cols =
    moreShift === 0
      ? slide2Columns.initialCols
      : [...slide2Columns.rightRegionCols, ...slide2Columns.hiddenCols];

  // ===================== TỔNG SỐ SLIDE (n = 6) =====================
  const TOTAL_SLIDES = 6;
  const slides = useMemo(() => Array.from({ length: TOTAL_SLIDES }, (_, i) => i), [TOTAL_SLIDES]);

  // Ref chống spam cuộn chuột (throttle 750ms để khớp với thời gian chuyển động của slide)
  const isWheelingRef = useRef(false);

  // Lắng nghe sự kiện bàn phím (Mũi tên lên/xuống) và con lăn chuột / touchpad (Wheel)
  useEffect(() => {
    // Kiểm tra xem có đang nhận ký tự từ bàn phím cho thanh tìm kiếm, thanh tìm thành phố, tìm rạp hay không
    const isReceivingKeyboardInput = () => {
      const activeEl = document.activeElement;
      if (!activeEl) return false;
      if (['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) return true;
      if (activeEl.closest?.('.search-wrapper, .searchable-select-wrap.is-open')) return true;
      return false;
    };

    // Kiểm tra xem chuột có đang hover trên các chức năng của Header hoặc đang mở/tương tác thanh tìm thành phố & rạp không
    const isBlockedByHeaderOrInputs = (e) => {
      if (isReceivingKeyboardInput()) return true;

      // Nếu dropdown tìm thành phố hoặc tìm rạp đang mở
      if (document.querySelector('.searchable-select-wrap.is-open')) return true;

      // Kiểm tra nếu đang hover ở các chức năng trên Header
      const targetEl = e?.target instanceof Element ? e.target : null;
      const headerInteractiveSelector =
        '.brand-logo, .header-nav-desktop, .nav-item-btn, .header-right, .search-wrapper, .map-btn, .header-action-btn, .hamburger-btn, .mobile-menu-drawer, .ptit-header';

      if (targetEl && targetEl.closest(headerInteractiveSelector)) {
        return true;
      }
      if (document.querySelector('.ptit-header:hover')) {
        return true;
      }

      // Kiểm tra nếu đang hover/cuộn trên thanh tìm thành phố hoặc tìm rạp
      if (targetEl && targetEl.closest('.searchable-select-wrap')) {
        return true;
      }
      if (document.querySelector('.searchable-select-wrap:hover')) {
        return true;
      }

      return false;
    };

    // 1. Xử lý bàn phím: Mũi tên lên & Mũi tên xuống
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

    // 2. Xử lý con lăn chuột / lướt trên touchpad (Mouse Wheel / Touchpad)
    const handleWheel = (e) => {
      // Không chuyển slide khi đang hover trên Header hoặc đang nhập bàn phím cho thanh tìm kiếm / thành phố / rạp
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeSlide, onSlideChange, TOTAL_SLIDES]);

  // ===================== THANH ĐIỀU HƯỚNG BÊN PHẢI (5 GẠCH TRẮNG + LĂN NHƯ APP ĐỒNG HỒ) =====================
  // Giả sử có n slide (TOTAL_SLIDES = n):
  // - Chỉ hiển thị đúng 5 gạch trắng trong khung nhìn (VISIBLE_TICKS = 5), bỏ các gạch thừa.
  // - Từ Slide 1 -> Slide 2 (index 0 -> 1) và Slide 2 -> Slide 3 (index 1 -> 2):
  //   windowStart = 0, cờ đỏ di chuyển xuống từ gạch 1 -> gạch 2 -> gạch 3 (giữa) như cũ.
  // - Từ Slide 3 sang các slide sau (index 2 -> 3 ... -> n - 3):
  //   cờ đỏ giữ nguyên ở vị trí giữa (vị trí gạch thứ 3, flagSlotIndex = 2),
  //   thanh ray màu trắng lăn lên giống hiệu ứng chọn giờ trên app đồng hồ điện thoại (windowStart tăng lên).
  // - Khi đến Slide n - 1 (index = n - 2) và Slide n (index = n - 1):
  //   thanh ray dừng ở cuối (maxWindowStart = n - 5), cờ đỏ di chuyển xuống dưới (vị trí gạch 4 -> gạch 5) như cũ.
  const maxWindowStart = Math.max(0, TOTAL_SLIDES - VISIBLE_TICKS);
  const windowStart = Math.min(Math.max(0, activeSlide - 2), maxWindowStart);
  const flagSlotIndex = activeSlide - windowStart; // 0, 1, 2, 3, 4
  const flagTop = flagSlotIndex * SLOT_STEP + SLOT_HEIGHT / 2;

  return (
    <div className="body-slider-wrapper">
      {/* Track chứa 6 slide di chuyển mượt mà */}
      <div
        className="slides-track"
        style={{ transform: `translateY(-${activeSlide * 100}%)` }}
      >
        {/* ========================================================
            SLIDE 1: ĐẶT VÉ (3/4 trên: poster lớn tự chuyển 2s - 1/4 dưới: 8 thẻ phim hot)
            ======================================================== */}
        <section className="slide-section slide-home" id="slide-1">
          {/* ---------- PHẦN TRÊN: POSTER WALLPAPER 16:9 ---------- */}
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

            {/* Tiêu đề slide đè lên poster */}
            <div className="hero-title-group">
              <span className="slide-subtitle">PTIT Cine • Đang Công Chiếu</span>
              <h2 className="slide-main-title">Phim Nổi Bật Đang Chiếu</h2>
            </div>

            {/* Thông tin phim của poster hiện tại */}
            {currentHero && (
              <div className="hero-movie-meta" key={currentHero.id}>
                <h3 className="hero-movie-title">{currentHero.title}</h3>
                <p className="hero-movie-sub">
                  {currentHero.genre} &nbsp;•&nbsp; {currentHero.duration} &nbsp;•&nbsp; ★ {currentHero.rating.toFixed(1)}
                </p>
                <button
                  type="button"
                  className="hero-book-btn"
                  onClick={() => alert(`Đặt vé phim: ${currentHero.title}`)}
                >
                  Đặt vé ngay
                </button>
              </div>
            )}

            {/* Nút ‹ › đặt 2 bên lề poster */}
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

          {/* ---------- PHẦN DƯỚI: 8 THẺ PHIM HOT (TÔ SÁNG THẺ ĐANG CHIẾU POSTER) ---------- */}
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
                  />
                );
              })}
            </div>

            {/* Mũi tên chỉ dẫn kéo xuống */}
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
            SLIDE 2: ĐẶT VÉ (tiếp) - Trục tọa độ Oxy:
            - Chưa bấm '>' hoặc '<': hiển thị 12 thẻ phim như cũ
            - Khi bấm '>' hoặc '<': chuyển 6 thẻ phim ở vùng x > 0 sang bên cạnh cùng với phim đang bị ẩn
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
              {visibleSlide2Cols.map((colMovies, colIdx) => (
                <div className="more-movies-col" key={colMovies.map(m => m.id).join('-')}>
                  {colMovies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
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
          <ScheduleSlide mode="now" />
        </section>

        {/* ========================================================
            SLIDE 4: LỊCH CHIẾU - PHIM SẮP CHIẾU
            ======================================================== */}
        <section className="slide-section slide-schedule" id="slide-4">
          <ScheduleSlide mode="coming" />
        </section>

        {/* ========================================================
            SLIDE 5: PHIM VIỆT NAM
            ======================================================== */}
        <section className="slide-section slide-schedule" id="slide-5">
          <ScheduleSlide mode="vietnam" />
        </section>

        {/* ========================================================
            SLIDE 6: BLANK (Chỉ có màu đen, hiển thị Footer)
            ======================================================== */}
        <section className="slide-section slide-blank" id="slide-6">
          {/* Trống hoàn toàn để hiển thị Footer ở slide cuối */}
        </section>
      </div>

      {/* ========================================================
          THANH ĐIỀU HƯỚNG SLIDE DỌC BÊN PHẢI
          - Chỉ có đúng 5 gạch trắng hiển thị, bỏ các gạch thừa
          - Slide 1 -> 2 -> 3: cờ đỏ trượt xuống như cũ
          - Slide 3 -> các slide sau: cờ đỏ giữ nguyên ở giữa, thanh ray trắng lăn như chọn giờ đồng hồ điện thoại
          - Đến Slide n-1 (Slide 5) -> Slide n (Slide 6): cờ đỏ trượt xuống dưới như cũ
          ======================================================== */}
      <aside className="right-slide-nav" aria-label="Slide Navigation">
        <div
          className="nav-rail-viewport"
          style={{ height: `${VISIBLE_TICKS * SLOT_HEIGHT + (VISIBLE_TICKS - 1) * SLOT_GAP}px` }}
        >
          <div
            className="nav-rail-track"
            style={{
              transform: `translate3d(0, -${windowStart * SLOT_STEP}px, 0)`
            }}
          >
            {slides.map(idx => {
              const relPos = idx - windowStart; // vị trí tương đối trong cửa sổ 5 gạch (0..4)
              const distFromCenter = relPos - 2; // khoảng cách tới tâm con lăn (-2..+2)
              const isVisibleInWindow = relPos >= 0 && relPos < VISIBLE_TICKS;
              const rotateXDeg = Math.max(-65, Math.min(65, distFromCenter * -22));
              const scaleVal = isVisibleInWindow
                ? 1 - Math.abs(distFromCenter) * 0.05
                : 0.72;

              return (
                <div
                  key={idx}
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
              );
            })}
          </div>
        </div>

        {/* Cờ đỏ duy nhất: trượt ở đầu/cuối và giữ nguyên vị trí giữa khi thanh ray trắng lăn */}
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
