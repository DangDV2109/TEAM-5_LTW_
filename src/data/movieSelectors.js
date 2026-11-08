import { moviesData } from './moviesData';

/**
 * Bộ chọn dữ liệu phim dùng chung cho Slide 1 & Slide 2
 * - Chỉ lấy phim ĐANG CHIẾU ('now') và SẮP CHIẾU ('coming') ở tất cả các rạp
 * - Phim có tag '#hot' được đưa lên trước (giữ nguyên thứ tự gốc trong từng nhóm)
 */
const isHot = (movie) => Boolean(movie.tags && movie.tags.includes('#hot'));

/** Toàn bộ phim đang chiếu + sắp chiếu, phim hot xếp trước */
export const showingAndUpcomingMovies = moviesData
  .filter(movie => movie.status === 'now' || movie.status === 'coming')
  .map((movie, index) => ({ movie, index }))
  .sort((a, b) => (Number(isHot(b.movie)) - Number(isHot(a.movie))) || (a.index - b.index))
  .map(({ movie }) => movie);

/** Slide 1 - phần dưới: 8 thẻ phim */
export const FEATURED_COUNT = 8;
export const featuredMovies = showingAndUpcomingMovies.slice(0, FEATURED_COUNT);

/** Slide 1 - phần trên: poster wallpaper 16:9 (mỗi poster 1 phim hot có ảnh backdrop) */
export const heroMovies = showingAndUpcomingMovies.filter(movie => isHot(movie) && movie.backdrop);

/** Slide 2: các phim còn lại, KHÔNG trùng với những phim Slide 1 đã hiển thị */
const shownOnSlide1 = new Set([...featuredMovies, ...heroMovies].map(movie => movie.id));
export const remainingMovies = showingAndUpcomingMovies.filter(movie => !shownOnSlide1.has(movie.id));
