import React, { useState, useEffect, useMemo } from 'react';
import './CommunityPage.css';
import { moviesData } from '../data/moviesData';
import Footer from '../components/Footer/Footer';

const STORAGE_KEY = 'ptit_cine_community_posts_v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Tạo dữ liệu bài đánh giá mẫu ban đầu (trong vòng 7 ngày gần nhất)
 */
const createSeedPosts = () => {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      author: 'Nguyễn Minh Quân',
      avatarColor: '#ED1C24',
      movieId: 1,
      rating: 10,
      content:
        'Oppenheimer thực sự là một kiệt tác điện ảnh của đạo diễn Christopher Nolan! Âm thanh trong phòng chiếu cực kỳ sống động, phân cảnh thử nghiệm Trinity khiến cả rạp nín thở.',
      createdAt: now - 1 * 24 * 60 * 60 * 1000, // 1 ngày trước
      likes: 42,
      dislikes: 1,
      userReaction: null, // 'like' | 'dislike' | null
      replies: [
        {
          id: 'rep-101',
          author: 'Trần Thu Hà',
          avatarColor: '#2563eb',
          content: 'Đồng ý luôn bạn ơi, nhạc nền của Ludwig Göransson nổi da gà thật sự!',
          createdAt: now - 20 * 60 * 60 * 1000,
          likes: 11,
          dislikes: 0,
          userReaction: null
        }
      ]
    },
    {
      id: 'seed-2',
      author: 'Lê Hoàng Nam',
      avatarColor: '#16a34a',
      movieId: 22,
      rating: 9,
      content:
        'Đào, Phở và Piano mang lại cảm xúc rất tự hào và xúc động về tinh thần người Hà Nội mùa đông năm 1946. Bối cảnh chiến lũy và âm nhạc cổ điển kết hợp rất ấn tượng.',
      createdAt: now - 2 * 24 * 60 * 60 * 1000, // 2 ngày trước
      likes: 35,
      dislikes: 0,
      userReaction: null,
      replies: []
    },
    {
      id: 'seed-3',
      author: 'Phạm Khánh Linh',
      avatarColor: '#9333ea',
      movieId: 24,
      rating: 9,
      content:
        'Lật Mặt 7: Một Điều Ước là bộ phim gia đình ấm áp nhất năm nay. Đi xem cùng bố mẹ mà cả nhà đều rưng rưng nước mắt ở đoạn cuối.',
      createdAt: now - 3 * 24 * 60 * 60 * 1000, // 3 ngày trước
      likes: 28,
      dislikes: 2,
      userReaction: null,
      replies: []
    }
  ];
};

/**
 * Đọc dữ liệu từ localStorage và tự động xóa mọi bài viết / bình luận đã quá 7 ngày
 */
const loadAndPrunePosts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    if (!raw) {
      const seeds = createSeedPosts();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createSeedPosts();

    // Lọc bỏ các bài đăng quá 7 ngày (now - createdAt >= 7 ngày)
    const validPosts = parsed
      .filter(post => post && typeof post.createdAt === 'number' && now - post.createdAt < SEVEN_DAYS_MS)
      .map(post => ({
        ...post,
        replies: Array.isArray(post.replies)
          ? post.replies.filter(
              rep => rep && typeof rep.createdAt === 'number' && now - rep.createdAt < SEVEN_DAYS_MS
            )
          : []
      }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validPosts));
    return validPosts;
  } catch (err) {
    return createSeedPosts();
  }
};

/**
 * Định dạng thời gian đăng và thời gian còn lại trước khi tự xóa (sau 7 ngày)
 */
const formatRelativeTime = (timestamp) => {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

const formatRemainingExpiry = (timestamp) => {
  const remainMs = SEVEN_DAYS_MS - (Date.now() - timestamp);
  if (remainMs <= 0) return 'Đã hết hạn';
  const remainDays = Math.ceil(remainMs / (24 * 60 * 60 * 1000));
  return `Tự xóa sau ${remainDays} ngày`;
};

/**
 * Trang Cộng Đồng (CommunityPage) - PTIT Cine
 * Tham khảo nội dung Moveek Community (https://moveek.com/community):
 * - Cột chính: Khung viết bài đánh giá phim (chọn phim, chọn số sao 1-10, nhập bình luận) + Luồng hoạt động cộng đồng
 * - Tương tác kiểu YouTube: Nút Thích (👍), Không thích (👎), Phản hồi (Bình luận con)
 * - Cột phụ: Phim được thảo luận sôi nổi & Thành viên tích cực
 * - Tự động xóa dữ liệu bài đăng / bình luận sau 7 ngày
 */
const CommunityPage = ({
  onBackHome = () => {},
  onOpenMovieDetail = () => {}
}) => {
  const [posts, setPosts] = useState(() => loadAndPrunePosts());

  // State cho form đăng bài đánh giá mới
  const [authorName, setAuthorName] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState(moviesData[0]?.id || 1);
  const [starRating, setStarRating] = useState(9);
  const [hoverStar, setHoverStar] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [filterMovieId, setFilterMovieId] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'

  // State cho bình luận phản hồi (reply) theo từng bài viết
  const [openReplyPostId, setOpenReplyPostId] = useState(null);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Kiểm tra định kỳ và đồng bộ lưu trữ (xóa các bài quá 7 ngày)
  useEffect(() => {
    const now = Date.now();
    const cleaned = posts.filter(p => now - p.createdAt < SEVEN_DAYS_MS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch (e) {
      // ignore storage quota errors
    }
  }, [posts]);

  // Tìm thông tin phim từ movieId
  const getMovieById = (id) => {
    return moviesData.find(m => m.id === Number(id)) || moviesData[0];
  };

  // Xử lý đăng đánh giá & bình luận mới
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const colors = ['#ED1C24', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPost = {
      id: `post-${Date.now()}`,
      author: authorName.trim() || 'Thành viên PTIT Cine',
      avatarColor: randomColor,
      movieId: Number(selectedMovieId),
      rating: starRating,
      content: commentText.trim(),
      createdAt: Date.now(),
      likes: 0,
      dislikes: 0,
      userReaction: null,
      replies: []
    };

    setPosts(prev => [newPost, ...prev]);
    setCommentText('');
  };

  // Xử lý nút Like / Dislike kiểu YouTube cho bài viết chính
  const handlePostReaction = (postId, type) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;

        let { likes, dislikes, userReaction } = post;

        if (userReaction === type) {
          // Bấm lại nút đang chọn -> bỏ chọn
          if (type === 'like') likes = Math.max(0, likes - 1);
          if (type === 'dislike') dislikes = Math.max(0, dislikes - 1);
          userReaction = null;
        } else {
          // Nếu trước đó đã chọn nút kia thì giảm nút kia đi 1
          if (userReaction === 'like') likes = Math.max(0, likes - 1);
          if (userReaction === 'dislike') dislikes = Math.max(0, dislikes - 1);

          // Tăng nút mới
          if (type === 'like') likes += 1;
          if (type === 'dislike') dislikes += 1;
          userReaction = type;
        }

        return { ...post, likes, dislikes, userReaction };
      })
    );
  };

  // Xử lý nút Like / Dislike kiểu YouTube cho phản hồi (reply)
  const handleReplyReaction = (postId, replyId, type) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const updatedReplies = (post.replies || []).map(rep => {
          if (rep.id !== replyId) return rep;
          let { likes, dislikes, userReaction } = rep;

          if (userReaction === type) {
            if (type === 'like') likes = Math.max(0, likes - 1);
            if (type === 'dislike') dislikes = Math.max(0, dislikes - 1);
            userReaction = null;
          } else {
            if (userReaction === 'like') likes = Math.max(0, likes - 1);
            if (userReaction === 'dislike') dislikes = Math.max(0, dislikes - 1);
            if (type === 'like') likes += 1;
            if (type === 'dislike') dislikes += 1;
            userReaction = type;
          }
          return { ...rep, likes, dislikes, userReaction };
        });

        return { ...post, replies: updatedReplies };
      })
    );
  };

  // Gửi phản hồi (comment con) vào bài viết
  const handleAddReply = (e, postId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      author: replyAuthor.trim() || 'Khán giả PTIT',
      avatarColor: '#3b82f6',
      content: replyContent.trim(),
      createdAt: Date.now(),
      likes: 0,
      dislikes: 0,
      userReaction: null
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        return {
          ...post,
          replies: [...(post.replies || []), newReply]
        };
      })
    );

    setReplyContent('');
    setOpenReplyPostId(null);
  };

  // Xóa bài viết thủ công (nếu người dùng muốn xóa ngay)
  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // Danh sách bài viết sau khi lọc và sắp xếp
  const displayedPosts = useMemo(() => {
    const now = Date.now();
    let list = posts.filter(p => now - p.createdAt < SEVEN_DAYS_MS);

    if (filterMovieId !== 'ALL') {
      list = list.filter(p => p.movieId === Number(filterMovieId));
    }

    if (sortBy === 'popular') {
      return [...list].sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
    }
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, filterMovieId, sortBy]);

  // Thống kê phim được đánh giá nhiều nhất trên Cộng đồng
  const trendingMovies = useMemo(() => {
    const counts = {};
    for (const post of posts) {
      if (!counts[post.movieId]) {
        counts[post.movieId] = { count: 0, totalScore: 0 };
      }
      counts[post.movieId].count += 1;
      counts[post.movieId].totalScore += post.rating;
    }

    return moviesData
      .slice(0, 8)
      .map(m => {
        const stat = counts[m.id];
        return {
          movie: m,
          reviewCount: stat ? stat.count : 0,
          avgScore: stat ? (stat.totalScore / stat.count).toFixed(1) : m.rating.toFixed(1)
        };
      })
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5);
  }, [posts]);

  return (
    <div className="community-page">
      {/* Banner tiêu đề Cộng đồng Moveek style */}
      <section className="comm-hero-banner">
        <div className="comm-container">
          <div className="comm-topbar">
            <button type="button" className="comm-back-btn" onClick={onBackHome}>
              <span>←</span> Quay lại trang chủ
            </button>
            <span className="comm-retention-badge" title="Mọi bình luận và đánh giá sẽ tự động xóa sau 7 ngày">
              ⏱ Tự động dọn dẹp dữ liệu sau 7 ngày
            </span>
          </div>

          <h1 className="comm-hero-title">Cộng Đồng Điện Ảnh PTIT Cine</h1>
          <p className="comm-hero-desc">
            Nơi chia sẻ cảm nhận, chấm điểm sao và thảo luận về các bộ phim đang &amp; sắp chiếu.
          </p>
        </div>
      </section>

      {/* Nội dung chính 2 cột (Moveek Community Layout) */}
      <div className="comm-container comm-main-layout">
        {/* ==================== CỘT TRÁI: ĐĂNG ĐÁNH GIÁ & LUỒNG BÌNH LUẬN ==================== */}
        <div className="comm-feed-column">
          {/* KHUNG VIẾT ĐÁNH GIÁ & CHẤM SAO PHIM */}
          <form className="comm-compose-card" onSubmit={handleCreatePost}>
            <div className="compose-card-header">
              <h3>✍️ Viết đánh giá &amp; Bình luận phim</h3>
              <span className="compose-expire-note">Lưu trữ trong 7 ngày</span>
            </div>

            <div className="compose-row-grid">
              <div className="compose-field">
                <label htmlFor="comm-author-input">Tên hiển thị của bạn</label>
                <input
                  id="comm-author-input"
                  type="text"
                  className="compose-input"
                  placeholder="Nhập tên của bạn (tùy chọn)..."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>

              <div className="compose-field">
                <label htmlFor="comm-movie-select">Chọn phim đánh giá</label>
                <select
                  id="comm-movie-select"
                  className="compose-select"
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(Number(e.target.value))}
                >
                  {moviesData.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chọn số sao đánh giá (1 -> 10 sao) */}
            <div className="compose-star-picker">
              <span className="star-picker-label">Đánh giá của bạn:</span>
              <div className="star-buttons-wrap">
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map(star => {
                  const isFilled = star <= (hoverStar || starRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`star-icon-btn ${isFilled ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      onClick={() => setStarRating(star)}
                      title={`${star}/10 sao`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <span className="star-score-badge">{hoverStar || starRating} / 10 ★</span>
            </div>

            {/* Nội dung bình luận */}
            <textarea
              className="compose-textarea"
              rows="3"
              placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim này (cốt truyện, diễn xuất, âm thanh, hình ảnh)..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />

            <div className="compose-actions">
              <button type="submit" className="compose-submit-btn">
                Đăng đánh giá
              </button>
            </div>
          </form>

          {/* THANH LỌC LUỒNG HOẠT ĐỘNG */}
          <div className="comm-feed-toolbar">
            <div className="feed-tabs">
              <button
                type="button"
                className={`feed-tab-btn ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => setSortBy('newest')}
              >
                Mới nhất
              </button>
              <button
                type="button"
                className={`feed-tab-btn ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                Nổi bật nhất (Nhiều lượt thích)
              </button>
            </div>

            <div className="feed-movie-filter">
              <select
                value={filterMovieId}
                onChange={(e) => setFilterMovieId(e.target.value)}
                className="feed-filter-select"
                aria-label="Lọc theo phim"
              >
                <option value="ALL">Tất cả phim ({posts.length})</option>
                {moviesData.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DANH SÁCH BÀI ĐÁNH GIÁ & BÌNH LUẬN */}
          <div className="comm-posts-list">
            {displayedPosts.length > 0 ? (
              displayedPosts.map(post => {
                const movie = getMovieById(post.movieId);
                return (
                  <article key={post.id} className="comm-post-card">
                    {/* Cột trái: Avatar người đăng + Nội dung */}
                    <div className="post-main-body">
                      <div className="post-user-header">
                        <div
                          className="post-avatar"
                          style={{ backgroundColor: post.avatarColor || '#ED1C24' }}
                        >
                          {post.author.charAt(0).toUpperCase()}
                        </div>

                        <div className="post-user-meta">
                          <div className="post-author-line">
                            <strong className="post-author-name">{post.author}</strong>
                            <span className="post-action-text">đã đánh giá phim</span>
                            <button
                              type="button"
                              className="post-movie-link"
                              onClick={() => onOpenMovieDetail(movie)}
                            >
                              {movie.title}
                            </button>
                          </div>

                          <div className="post-time-row">
                            <span className="post-rating-pill">
                              ★ {post.rating}/10
                            </span>
                            <span className="post-dot">•</span>
                            <span className="post-timestamp">{formatRelativeTime(post.createdAt)}</span>
                            <span className="post-dot">•</span>
                            <span className="post-expiry-tag">{formatRemainingExpiry(post.createdAt)}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="post-delete-btn"
                          onClick={() => handleDeletePost(post.id)}
                          title="Xóa bình luận này"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Dải sao trực quan */}
                      <div className="post-visual-stars" aria-label={`Đánh giá ${post.rating} trên 10 sao`}>
                        {Array.from({ length: 10 }, (_, idx) => (
                          <span
                            key={idx}
                            className={`visual-star ${idx < post.rating ? 'on' : 'off'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <p className="post-content-text">{post.content}</p>

                      {/* THANH TƯƠNG TÁC KIỂU YOUTUBE (👍 Thích, 👎 Không thích, 💬 Phản hồi) */}
                      <div className="yt-action-bar">
                        <div className="yt-like-dislike-pill">
                          <button
                            type="button"
                            className={`yt-like-btn ${post.userReaction === 'like' ? 'active' : ''}`}
                            onClick={() => handlePostReaction(post.id, 'like')}
                            title="Thích bình luận này"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                            </svg>
                            <span>{post.likes}</span>
                          </button>

                          <span className="yt-pill-divider" />

                          <button
                            type="button"
                            className={`yt-dislike-btn ${post.userReaction === 'dislike' ? 'active' : ''}`}
                            onClick={() => handlePostReaction(post.id, 'dislike')}
                            title="Không thích"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                              <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                            </svg>
                            {post.dislikes > 0 && <span>{post.dislikes}</span>}
                          </button>
                        </div>

                        <button
                          type="button"
                          className="yt-reply-toggle-btn"
                          onClick={() =>
                            setOpenReplyPostId(prev => (prev === post.id ? null : post.id))
                          }
                        >
                          Phản hồi ({post.replies?.length || 0})
                        </button>
                      </div>

                      {/* Khung nhập phản hồi (khi bấm Phản hồi) */}
                      {openReplyPostId === post.id && (
                        <form
                          className="yt-reply-form"
                          onSubmit={(e) => handleAddReply(e, post.id)}
                        >
                          <input
                            type="text"
                            className="reply-author-input"
                            placeholder="Tên của bạn..."
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                          />
                          <input
                            type="text"
                            className="reply-text-input"
                            placeholder="Viết phản hồi công khai..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            required
                          />
                          <div className="reply-form-btns">
                            <button
                              type="button"
                              className="reply-cancel-btn"
                              onClick={() => setOpenReplyPostId(null)}
                            >
                              Hủy
                            </button>
                            <button type="submit" className="reply-submit-btn">
                              Phản hồi
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Danh sách các bình luận phản hồi (Replies) */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="yt-replies-list">
                          {post.replies.map(rep => (
                            <div key={rep.id} className="yt-reply-item">
                              <div
                                className="reply-avatar"
                                style={{ backgroundColor: rep.avatarColor || '#3b82f6' }}
                              >
                                {rep.author.charAt(0).toUpperCase()}
                              </div>
                              <div className="reply-body">
                                <div className="reply-header">
                                  <strong>{rep.author}</strong>
                                  <span>{formatRelativeTime(rep.createdAt)}</span>
                                </div>
                                <p className="reply-text">{rep.content}</p>
                                <div className="reply-actions">
                                  <button
                                    type="button"
                                    className={`yt-mini-like ${rep.userReaction === 'like' ? 'active' : ''}`}
                                    onClick={() => handleReplyReaction(post.id, rep.id, 'like')}
                                  >
                                    👍 {rep.likes}
                                  </button>
                                  <button
                                    type="button"
                                    className={`yt-mini-dislike ${rep.userReaction === 'dislike' ? 'active' : ''}`}
                                    onClick={() => handleReplyReaction(post.id, rep.id, 'dislike')}
                                  >
                                    👎 {rep.dislikes > 0 ? rep.dislikes : ''}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cột phải trên thẻ bài viết: Poster nhỏ của phim (Moveek style) */}
                    <div
                      className="post-movie-poster-side"
                      onClick={() => onOpenMovieDetail(movie)}
                      title={`Xem chi tiết phim ${movie.title}`}
                    >
                      <img src={movie.poster} alt={movie.title} />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="comm-empty-state">
                <p>Chưa có bình luận nào cho bộ phim này. Hãy là người đầu tiên đánh giá!</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== CỘT PHẢI: SIDEBAR THỐNG KÊ (MOVEEK STYLE) ==================== */}
        <aside className="comm-sidebar-column">
          <div className="comm-sidebar-box">
            <h3 className="sidebar-box-title">🔥 Phim Được Đánh Giá Sôi Nổi</h3>
            <div className="trending-movies-list">
              {trendingMovies.map(({ movie, reviewCount, avgScore }) => (
                <div
                  key={movie.id}
                  className="trending-movie-item"
                  onClick={() => onOpenMovieDetail(movie)}
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="trending-poster"
                  />
                  <div className="trending-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.genre}</p>
                    <div className="trending-stats">
                      <span className="trending-score">★ {avgScore}</span>
                      <span className="trending-count">{reviewCount} đánh giá</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="comm-sidebar-box">
            <h3 className="sidebar-box-title">🛡️ Quy Tắc Cộng Đồng</h3>
            <ul className="comm-rules-list">
              <li>Không tiết lộ nội dung quan trọng của phim (No Spoiler) khi chưa cảnh báo.</li>
              <li>Chấm điểm công tâm từ <strong>1 đến 10 sao</strong> dựa trên trải nghiệm thực tế.</li>
              <li>Sử dụng nút <strong>👍 Thích / 👎 Không thích</strong> văn minh như trên YouTube.</li>
              <li>Mọi bài đánh giá &amp; bình luận sẽ <strong>tự động xóa sau 7 ngày</strong> để làm mới luồng thảo luận.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Footer tĩnh ở đáy trang */}
      <Footer isVisible={true} isStatic={true} />
    </div>
  );
};

export default CommunityPage;
