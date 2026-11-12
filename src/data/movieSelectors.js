import { moviesData } from './moviesData';

/**
 * Bộ chọn dữ liệu phim dùng chung cho các Slide
 * - Slide 1 & Slide 2: lấy phim ĐANG CHIẾU ('now') và SẮP CHIẾU ('coming') thuộc nhóm hiển thị trang chủ
 * - Phim có tag '#hot' được đưa lên trước (giữ nguyên thứ tự gốc trong từng nhóm)
 */
export const isHot = (movie) => Boolean(movie.tags && movie.tags.includes('#hot'));

/** Toàn bộ phim dùng cho Slide 1 & Slide 2, phim hot xếp trước */
export const showingAndUpcomingMovies = moviesData
  .filter(movie => (movie.status === 'now' || movie.status === 'coming') && movie.showOnSlide2 !== false)
  .map((movie, index) => ({ movie, index }))
  .sort((a, b) => (Number(isHot(b.movie)) - Number(isHot(a.movie))) || (a.index - b.index))
  .map(({ movie }) => movie);

/** Slide 1 - phần dưới: chỉ hiển thị các thẻ phim có tag #hot (đã giảm bớt số lượng phim hot) */
export const featuredMovies = showingAndUpcomingMovies.filter(movie => isHot(movie));
export const FEATURED_COUNT = featuredMovies.length;

/** Slide 1 - phần trên: poster wallpaper 16:9 (bao gồm cả thumbnail 16:9 từ YouTube cho phim hot) */
export const heroMovies = featuredMovies.filter(
  movie => isHot(movie) && (movie.backdrop || movie.youtubeThumbnail)
);

/** Slide 2: các phim còn lại, KHÔNG trùng với những phim Slide 1 đã hiển thị */
const shownOnSlide1 = new Set([...featuredMovies, ...heroMovies].map(movie => movie.id));
export const remainingMovies = showingAndUpcomingMovies.filter(movie => !shownOnSlide1.has(movie.id));

/** Slide 4: Phim sắp chiếu */
export const upcomingMovies = moviesData.filter(movie => movie.status === 'coming');

/** Slide 5: Phim Việt Nam (nếu đã có trên 2 slide trước thì vẫn chiếu tại slide này) */
export const vietnamMovies = moviesData.filter(
  movie =>
    (movie.origin && movie.origin.toLowerCase().includes('việt nam')) ||
    (movie.tags && movie.tags.includes('#vietnam'))
);
