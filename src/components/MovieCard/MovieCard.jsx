import React from 'react';
import './MovieCard.css';

/**
 * MovieCard (thẻ phim thu nhỏ) - PTIT Cine
 * - Cùng mô típ với thẻ phim cũ: poster, huy hiệu điểm ★, tên phim, ngày khởi chiếu, nút Đặt vé
 * - Thu nhỏ: thông tin đè lên poster (gradient tối), nút Đặt vé trượt lên khi hover
 * - Hỗ trợ prop `isHighlighted`: tô sáng thẻ phim hot đang được trình chiếu poster ở Slide 1
 */
const MovieCard = ({
  movie,
  isHighlighted = false,
  isDimmed = false,
  onCardClick,
  onOpenDetail = () => {}
}) => {
  const isComing = movie.status === 'coming';
  const lastTapRef = React.useRef(0);

  const handleImgError = (e) => {
    const fallback = movie.fallbackPoster || movie.youtubeThumbnail || movie.backdrop;
    if (fallback && e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  // Hỗ trợ cả double click trên máy tính & double tap trên điện thoại
  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      onOpenDetail(movie);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <div
      className={`mini-movie-card ${isHighlighted ? 'is-highlighted' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
      title={`${movie.title} (${movie.year}) — Nhấn "Đặt vé" hoặc nhấp đúp để xem chi tiết`}
      onClick={onCardClick}
      onDoubleClick={() => onOpenDetail(movie)}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={movie.poster}
        alt={movie.title}
        className="mini-card-poster"
        loading="lazy"
        onError={handleImgError}
      />
      <div className="mini-card-overlay"></div>

      {/* Nhãn sắp chiếu */}
      {isComing && <span className="mini-card-status">Sắp chiếu</span>}

      {/* Số điểm đánh giá */}
      <div className="mini-card-rating" title={`Điểm đánh giá: ${movie.rating}/10`}>
        <span>★</span>
        <span>{movie.rating.toFixed(1)}</span>
      </div>

      {/* Thông tin phim */}
      <div className="mini-card-info">
        <h3 className="mini-card-title">{movie.title}</h3>
        <div className="mini-card-date">
          <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>{movie.releaseDate}</span>
        </div>

        <button
          type="button"
          className="mini-card-book-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(movie);
          }}
        >
          Đặt vé
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
