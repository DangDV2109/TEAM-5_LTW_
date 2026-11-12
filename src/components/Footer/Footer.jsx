import React from 'react';
import './Footer.css';
import ptitLogo from '../../assets/ptit-logo.png';
import riptLogo from '../../assets/ript-logo.png';

/**
 * Footer Component - PTIT Cine
 * - Nền đen (background-color: black)
 * - Tự động hiển thị chèn lên body ở slide cuối, ẩn ở các slide trên (thông qua prop isVisible)
 * - Bên trái: Logo RIPT và Logo PTIT bo tròn (border-radius: 50%)
 * - Đường thẳng mảnh, màu trắng, chiều dọc bên cạnh logo
 * - Chữ nhỏ màu xám, cỡ 1em, Arial: " NHÓM 5 LTW_03"
 */
const Footer = ({ isVisible = false, isStatic = false }) => {
  return (
    <footer
      className={`ptit-footer ${isVisible ? 'visible' : ''} ${isStatic ? 'static-footer' : ''}`}
      aria-hidden={!isVisible && !isStatic}
    >
      {/* Phía bên trái: Logo RIPT, Logo PTIT, vạch dọc trắng, Chữ Nhóm */}
      <div className="footer-left">
        {/* Cụm 2 logo tròn */}
        <div className="footer-logos">
          <img 
            src={riptLogo} 
            alt="RIPT Logo" 
            className="footer-logo-img" 
            title="Viện Khoa học Kỹ thuật Bưu điện (RIPT)"
          />
          <img 
            src={ptitLogo} 
            alt="PTIT Logo" 
            className="footer-logo-img" 
            title="Học viện Công nghệ Bưu chính Viễn thông (PTIT)"
          />
        </div>

        {/* Đường thẳng mảnh, màu trắng, chiều dọc */}
        <div className="footer-divider" aria-hidden="true"></div>

        {/* Chữ nhỏ màu xám, cỡ 1em, arial */}
        <p className="footer-text">
          NHÓM 5 LTW_03
        </p>
      </div>

      {/* Thông tin phụ bên phải */}
      <div className="footer-right">
        <span>PTIT Cine © 2026 - Bài tập lớn Lập trình Web</span>
      </div>
    </footer>
  );
};

export default Footer;
