import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import './BodySlider.css';
import { featuredMovies, heroMovies, remainingMovies } from '../../data/movieSelectors';
import MovieCard from '../MovieCard/MovieCard';
import ScheduleSlide from '../ScheduleSlide/ScheduleSlide';

/**
 * BodySlider Component - PTIT Cine
 * - Hỗ trợ chuyển slide bằng:
 *   1. Bấm nút điều hướng bên phải (1, 2, 3, 4) hoặc các nút trên Header
 *   2. Bấm phím mũi tên LÊN (ArrowUp) / XUỐNG (ArrowDown)
 *   3. Lăn con lăn chuột (Mouse Wheel / Touchpad scroll)
 * - Slide 1: ĐẶT VÉ - 3/4 trên: poster wallpaper 16:9 (mỗi poster 1 phim, nút ‹ › 2 bên lề)
 *                     1/4 dưới: 8 thẻ phim thu nhỏ (phim hot trước) + mũi tên gợi ý kéo xuống
 * - Slide 2: ĐẶT VÉ (tiếp) - các phim đang chiếu / sắp chiếu còn lại, không trùng Slide 1
 * - Slide 3: LỊCH CHIẾU (ScheduleSlide component - 9 thẻ / trang, PREV/NEXT)
 * - Slide 4: Blank màu đen hoàn toàn (Footer hiện đè lên)
 * - Mọi nút chuyển trang (‹ › / PREV NEXT) đều quay vòng: trang cuối -> trang đầu và ngược lại
 */

// Chuyển trang quay vòng
const wrapIndex = (index, total) => (total > 0 ? (index + total) % total : 0);

const BodySlider = ({ activeSlide = 0, onSlideChange = () => { } }) => {
  // ===================== SLIDE 1: POSTER LỚN =====================
  const [heroIndex, setHeroIndex] = useState(0);
  const heroCount = heroMovies.length;
  const currentHero = heroMovies[heroIndex];

  const handleHeroPrev = () => setHeroIndex(i => wrapIndex(i - 1, heroCount));
  const handleHeroNext = () => setHeroIndex(i => wrapIndex(i + 1, heroCount));

  // ===================== SLIDE 2: PHIM CÒN LẠI =====================
  const MORE_PER_PAGE = 12; // 2 hàng x 6 thẻ
  const [morePage, setMorePage] = useState(0);
  const moreTotalPages = Math.max(1, Math.ceil(remainingMovies.length / MORE_PER_PAGE));
  const displayedMoreMovies = remainingMovies.slice(
    morePage * MORE_PER_PAGE,
    (morePage + 1) * MORE_PER_PAGE
  );

  const handleMorePrev = () => setMorePage(p => wrapIndex(p - 1, moreTotalPages));
  const handleMoreNext = () => setMorePage(p => wrapIndex(p + 1, moreTotalPages));

  // Tổng số slide là 4 (Slide 1, Slide 2, Slide 3, Slide 4)
  const TOTAL_SLIDES = 4;
  const slides = [0, 1, 2, 3];

  // Ref chống spam cuộn chuột (throttle 750ms để khớp với thời gian chuyển động của slide)
  const isWheelingRef = useRef(false);

  // Lắng nghe sự kiện bàn phím (Mũi tên lên/xuống) và con lăn chuột (Wheel)
  useEffect(() => {
    // 1. Xử lý bàn phím: Mũi tên lên & Mũi tên xuống
    const handleKeyDown = (e) => {
      // Nếu đang gõ trong ô tìm kiếm thì bỏ qua, không chuyển slide
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
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

    // 2. Xử lý con lăn chuột (Mouse Wheel)
    const handleWheel = (e) => {
      // Nếu đang trong khoảng thời gian chuyển động (throttle) thì bỏ qua
      if (isWheelingRef.current) return;
      // Bỏ qua các chuyển động lăn cực nhỏ (micro-scroll)
      if (Math.abs(e.deltaY) < 25) return;

      if (e.deltaY > 0) {
        // Lăn xuống -> Chuyển sang slide tiếp theo
        if (activeSlide < TOTAL_SLIDES - 1) {
          isWheelingRef.current = true;
          onSlideChange(activeSlide + 1);
          setTimeout(() => {
            isWheelingRef.current = false;
          }, 750);
        }
      } else if (e.deltaY < 0) {
        // Lăn lên -> Chuyển về slide trước đó
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

    // Cleanup listener khi unmount hoặc khi activeSlide thay đổi
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeSlide, onSlideChange, TOTAL_SLIDES]);

  // ===================== THANH RAY BÊN PHẢI: CỜ ĐỎ TRƯỢT =====================
  // Cờ đỏ (active flag) là 1 phần tử duy nhất, trượt mượt theo thanh ray tới vị trí slide đang xem
  const navSlotRefs = useRef([]);
  const [flagTop, setFlagTop] = useState(null);

  useLayoutEffect(() => {
    const slot = navSlotRefs.current[activeSlide];
    if (slot) setFlagTop(slot.offsetTop + slot.offsetHeight / 2);
  }, [activeSlide]);

  return (
    <div className="body-slider-wrapper">
      {/* Track chứa 4 slide di chuyển mượt mà */}
      <div
        className="slides-track"
        style={{ transform: `translateY(-${activeSlide * 100}%)` }}
      >
        {/* ========================================================
            SLIDE 1: ĐẶT VÉ (3/4 trên: poster lớn - 1/4 dưới: 8 thẻ phim)
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
                <img src={movie.backdrop} alt={movie.title} className="hero-slide-img" />
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

            {/* Nút ‹ › mới đặt 2 bên lề poster (không viền, không nền hover) */}
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

          {/* ---------- PHẦN DƯỚI: 8 THẺ PHIM THU NHỎ ---------- */}
          <div className="home-bottom">
            <div className="home-cards-row">
              {featuredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
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
            SLIDE 2: ĐẶT VÉ (tiếp) - Phim đang chiếu & sắp chiếu còn lại
            (không tiêu đề, không trùng phim với Slide 1)
            ======================================================== */}
        <section className="slide-section slide-more" id="slide-2">
          <div className="more-movies-area">
            {moreTotalPages > 1 && (
              <button
                type="button"
                className="edge-arrow-btn edge-arrow-prev"
                onClick={handleMorePrev}
                title="Trang trước"
                aria-label="Previous page"
              >
                ‹
              </button>
            )}

            <div className="more-movies-grid" key={morePage}>
              {displayedMoreMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {moreTotalPages > 1 && (
              <button
                type="button"
                className="edge-arrow-btn edge-arrow-next"
                onClick={handleMoreNext}
                title="Trang tiếp theo"
                aria-label="Next page"
              >
                ›
              </button>
            )}
          </div>
        </section>

        {/* ========================================================
            SLIDE 3: LỊCH CHIẾU
            ======================================================== */}
        <section className="slide-section slide-schedule" id="slide-3">
          <ScheduleSlide />
        </section>

        {/* ========================================================
            SLIDE 4: BLANK (Chỉ có màu đen, không có nội dung)
            ======================================================== */}
        <section className="slide-section slide-blank" id="slide-4">
          {/* Trống hoàn toàn theo yêu cầu */}
        </section>
      </div>

      {/* ========================================================
          THANH ĐIỀU HƯỚNG SLIDE DỌC BÊN PHẢI (CHUẨN ARENA BREAKOUT)
          - Cờ đỏ thu nhỏ, trượt dọc thanh ray khi đổi slide, số slide cuộn lên
          ======================================================== */}
      <aside className="right-slide-nav" aria-label="Slide Navigation">
        <div className="nav-dot"></div>
        <div className="nav-tick"></div>
        <div className="nav-dot"></div>

        {slides.map(idx => (
          <React.Fragment key={idx}>
            <div
              className={`nav-slot ${activeSlide === idx ? 'is-active' : ''}`}
              ref={el => { navSlotRefs.current[idx] = el; }}
              title={activeSlide === idx ? `Đang xem Slide ${idx + 1}` : `Chuyển đến Slide ${idx + 1}`}
              onClick={() => onSlideChange(idx)}
            >
              <div className="nav-slide-tick"></div>
            </div>

            <div className="nav-dot"></div>
            <div className="nav-tick"></div>
            <div className="nav-dot"></div>
          </React.Fragment>
        ))}

        {/* Cờ đỏ duy nhất, trượt tới slot đang active */}
        <div
          className={`nav-active-flag ${flagTop === null ? 'is-hidden' : ''}`}
          style={{ top: flagTop ?? 0 }}
          onClick={() => onSlideChange(activeSlide)}
          aria-hidden="true"
        >
          <span className="nav-active-num" key={activeSlide}>{activeSlide + 1}</span>
        </div>
      </aside>

    </div >
  );
};

export default BodySlider;
