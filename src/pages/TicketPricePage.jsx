import React, { useState } from 'react';
import './TicketPricePage.css';

/**
 * Slide 6: Giá Vé (TicketPricePage) - PTIT Cine
 * - Đã chuyển thành Slide 6 trên trang chủ (bỏ nút Quay về trang chủ & Breadcrumb)
 * - Nền màu xám hoàn toàn, không có circle at
 * - Góc phải trên có nút chuyển đổi ngôn ngữ [vie/eng] cỡ 0.7em
 * - Tiêu đề bên lề trái: "GIÁ VÉ" và "Áp dụng từ ngày ..."
 * - Cùng dòng với tiêu đề, ngay trên dòng kẻ xám: các nút "2D", "3D", "Phụ thu", "Ưu đãi" cỡ 0.7em
 *   + Hover (0.5s): xuất hiện viền hình chữ nhật đỏ bao quanh rồi biến thành 2 ngoặc vuông [ ]
 *   + Active (đang ở đó): tô đỏ chữ + khung ngoặc vuông, bên cạnh là dấu chấm to đang nhấp nháy
 * - Dòng kẻ xám cắt ngay dưới tiêu đề, độ dài bằng chiều dài bảng giá vé
 * - Vùng 1: Giá vé phim 2D | Vùng 2: Giá vé phim 3D | Vùng 3: Quy định chung & Phụ thu | Vùng 4: Ưu đãi + Hướng dẫn xác thực CCCD online
 */

const I18N = {
  vie: {
    title: 'GIÁ VÉ',
    effectiveDate: 'Áp dụng từ ngày 01/01/2026',
    tabs: [
      { id: '2d', label: '2D' },
      { id: '3d', label: '3D' },
      { id: 'surcharge', label: 'Phụ thu' },
      { id: 'promo', label: 'Ưu đãi' }
    ],
    table2d: {
      subjectHeader: 'Đối tượng áp dụng',
      monThu: 'Từ Thứ 2 đến Thứ 5',
      friSun: 'Thứ 6, Thứ 7, Chủ Nhật & Ngày Lễ',
      standardSeat: 'Ghế Thường',
      vipSeat: 'Ghế VIP',
      rows: [
        {
          title: 'Người lớn',
          sub: 'Khách hàng tiêu chuẩn',
          prices: ['70.000đ', '75.000đ', '85.000đ', '95.000đ'],
          type: 'normal'
        },
        {
          title: 'Học sinh, Sinh viên (U22)',
          sub: 'Xuất trình thẻ HSSV hoặc CCCD dưới 22 tuổi (hoặc đã xác thực CCCD online)',
          prices: ['55.000đ', '60.000đ', '70.000đ', '75.000đ'],
          type: 'discount'
        },
        {
          title: 'Trẻ em / Người cao tuổi',
          sub: 'Trẻ em dưới 1m3 & công dân từ 60 tuổi trở lên',
          prices: ['50.000đ', '55.000đ', '60.000đ', '65.000đ'],
          type: 'discount'
        }
      ],
      sweetbox: {
        title: 'Ghế Đôi (Sweetbox - 2 người)',
        sub: 'Bao gồm 02 vé cho cặp đôi ở hàng ghế cuối',
        monThuPrice: '160.000đ / đôi',
        friSunPrice: '200.000đ / đôi'
      }
    },
    table3d: {
      timeHeader: 'Khung giờ chiếu',
      monThu: 'Từ Thứ 2 đến Thứ 5',
      friSun: 'Thứ 6, Thứ 7, Chủ Nhật & Ngày Lễ',
      standardSeat: 'Ghế Thường',
      vipSeat: 'Ghế VIP',
      coupleSeat: 'Ghế Đôi',
      rows: [
        {
          title: 'Trước 12:00 trưa',
          sub: 'Suất chiếu sáng sớm ưu đãi',
          prices: ['65.000đ', '75.000đ', '150.000đ', '85.000đ', '95.000đ', '200.000đ']
        },
        {
          title: 'Từ 12:00 đến trước 17:00',
          sub: 'Khung giờ buổi chiều',
          prices: ['80.000đ', '90.000đ', '180.000đ', '100.000đ', '110.000đ', '230.000đ']
        },
        {
          title: 'Từ 17:00 đến 23:59',
          sub: 'Khung giờ vàng buổi tối',
          prices: ['90.000đ', '100.000đ', '200.000đ', '120.000đ', '130.000đ', '270.000đ']
        }
      ]
    },
    surcharge: {
      heading: 'Quy định chung & Phụ thu',
      items: [
        {
          label: 'Thuế GTGT (VAT)',
          desc: 'Toàn bộ giá vé niêm yết trong bảng đã bao gồm thuế giá trị gia tăng (VAT).'
        },
        {
          label: 'Phụ thu phim Bom tấn (Blockbuster) / thời lượng trên 150 phút',
          desc: '+10.000đ / vé đối với mọi loại ghế và khung giờ chiếu.'
        },
        {
          label: 'Phụ thu định dạng IMAX & Kính 3D',
          desc: 'Định dạng IMAX phụ thu +30.000đ / vé so với giá vé 3D cùng khung giờ (đã bao gồm kính 3D chuyên dụng).'
        },
        {
          label: 'Phụ thu Suất chiếu sớm (Sneak Show) & Ngày Lễ / Tết',
          desc: 'Áp dụng mức giá cuối tuần (Thứ 6, Thứ 7, Chủ Nhật) cho các ngày Lễ, Tết theo quy định của Nhà nước (1/1, Tết Âm lịch, 10/3 ÂL, 30/4 - 1/5, 2/9).'
        },
        {
          label: 'Thứ Ba Vui Vẻ (Happy Tuesday)',
          desc: 'Đồng giá vé 2D chỉ 50.000đ / vé cho mọi loại ghế đơn (không áp dụng vào Ngày Lễ/Tết và suất chiếu sớm).'
        }
      ]
    },
    promo: {
      policyHeading: 'Chính sách ưu đãi đối tượng đặc biệt',
      policies: [
        'Sinh viên PTIT & HSSV dưới 22 tuổi (U22): Áp dụng giá vé ưu đãi khi xuất trình thẻ HSSV/CCCD tại quầy hoặc tài khoản đã xác thực CCCD online (tối đa 01 vé ưu đãi / suất).',
        'Người cao tuổi (từ 60 tuổi) & Người có công với cách mạng, Người khuyết tật: Giảm từ 20% đến 50% giá vé.',
        'Trẻ em dưới 0.7m: Miễn phí vé hoàn toàn khi đi kèm người lớn và ngồi chung ghế.'
      ],
      cccdHeading: 'Hướng dẫn xác thực CCCD Online (Mua vé ưu đãi trực tuyến)',
      cccdSteps: [
        {
          step: 'Bước 1',
          title: 'Đăng nhập & Mở mục Xác thực',
          desc: 'Đăng nhập tài khoản PTIT Cine, nhấn vào mục "Tài khoản" trên thanh Header và chọn "Xác thực CCCD / U22 Online".'
        },
        {
          step: 'Bước 2',
          title: 'Chụp ảnh CCCD gắn chip hoặc liên kết VNeID',
          desc: 'Tải lên ảnh mặt trước CCCD gắn chip rõ nét (hoặc quét mã QR trên ứng dụng VNeID) để hệ thống trích xuất ngày sinh tự động.'
        },
        {
          step: 'Bước 3',
          title: 'Xác thực khuôn mặt (eKYC) trong 15 giây',
          desc: 'Thực hiện đối chiếu khuôn mặt nhanh qua camera điện thoại/máy tính để đảm bảo chính chủ.'
        },
        {
          step: 'Bước 4',
          title: 'Đặt vé U22 / Ưu đãi trực tuyến ngay lập tức',
          desc: 'Sau khi duyệt thành công, tài khoản được gắn huy hiệu "Đã xác thực CCCD" và tự động mở khóa giá vé ưu đãi khi đặt vé trên web mà không cần xếp hàng tại quầy.'
        }
      ]
    }
  },
  eng: {
    title: 'TICKET PRICES',
    effectiveDate: 'Effective from 01/01/2026',
    tabs: [
      { id: '2d', label: '2D' },
      { id: '3d', label: '3D' },
      { id: 'surcharge', label: 'Surcharge' },
      { id: 'promo', label: 'Promotions' }
    ],
    table2d: {
      subjectHeader: 'Customer Category',
      monThu: 'Monday to Thursday',
      friSun: 'Friday, Saturday, Sunday & Holidays',
      standardSeat: 'Standard Seat',
      vipSeat: 'VIP Seat',
      rows: [
        {
          title: 'Adults',
          sub: 'Standard ticket',
          prices: ['70.000đ', '75.000đ', '85.000đ', '95.000đ'],
          type: 'normal'
        },
        {
          title: 'Students & U22 Youth',
          sub: 'Present Student ID / National ID under 22 (or verified online)',
          prices: ['55.000đ', '60.000đ', '70.000đ', '75.000đ'],
          type: 'discount'
        },
        {
          title: 'Children / Seniors',
          sub: 'Children under 1.3m & senior citizens aged 60+',
          prices: ['50.000đ', '55.000đ', '60.000đ', '65.000đ'],
          type: 'discount'
        }
      ],
      sweetbox: {
        title: 'Sweetbox (Couple Seat - 2 Guests)',
        sub: 'Includes 02 tickets for back-row couple seats',
        monThuPrice: '160.000đ / pair',
        friSunPrice: '200.000đ / pair'
      }
    },
    table3d: {
      timeHeader: 'Showtime Slot',
      monThu: 'Monday to Thursday',
      friSun: 'Friday, Saturday, Sunday & Holidays',
      standardSeat: 'Standard',
      vipSeat: 'VIP',
      coupleSeat: 'Sweetbox',
      rows: [
        {
          title: 'Before 12:00 PM',
          sub: 'Early bird morning screenings',
          prices: ['65.000đ', '75.000đ', '150.000đ', '85.000đ', '95.000đ', '200.000đ']
        },
        {
          title: '12:00 PM to before 5:00 PM',
          sub: 'Afternoon screenings',
          prices: ['80.000đ', '90.000đ', '180.000đ', '100.000đ', '110.000đ', '230.000đ']
        },
        {
          title: '5:00 PM to 11:59 PM',
          sub: 'Prime-time evening screenings',
          prices: ['90.000đ', '100.000đ', '200.000đ', '120.000đ', '130.000đ', '270.000đ']
        }
      ]
    },
    surcharge: {
      heading: 'General Regulations & Surcharges',
      items: [
        {
          label: 'Value Added Tax (VAT)',
          desc: 'All listed ticket prices include Value Added Tax (VAT).'
        },
        {
          label: 'Blockbuster / Runtime over 150 mins Surcharge',
          desc: '+10.000đ / ticket across all seat types and time slots.'
        },
        {
          label: 'IMAX Format & 3D Glasses Surcharge',
          desc: 'IMAX format adds +30.000đ / ticket compared to 3D prices in the same time slot (3D glasses included).'
        },
        {
          label: 'Sneak Shows & Public Holidays',
          desc: 'Weekend pricing (Fri - Sun) applies on National Public Holidays (New Year, Lunar New Year, Hung Kings Festival, Apr 30 - May 1, Sep 2).'
        },
        {
          label: 'Happy Tuesday',
          desc: 'Flat 2D ticket price of 50.000đ / ticket for all single seats (excluding Public Holidays and Sneak Shows).'
        }
      ]
    },
    promo: {
      policyHeading: 'Special Discount Policies',
      policies: [
        'PTIT Students & U22 Youth: Discounted pricing applies when presenting Student ID/CCCD at the counter or booking with an Online CCCD-Verified account (max 01 ticket/screening).',
        'Senior Citizens (60+), War Veterans & People with Disabilities: 20% to 50% ticket discount.',
        'Toddlers under 0.7m: Free admission when accompanied by an adult and sharing a seat.'
      ],
      cccdHeading: 'Online CCCD (National ID) Verification Guide',
      cccdSteps: [
        {
          step: 'Step 1',
          title: 'Sign In & Open Verification',
          desc: 'Log in to your PTIT Cine account, click "Account" on the top Header and select "Online CCCD / U22 Verification".'
        },
        {
          step: 'Step 2',
          title: 'Scan Chip-based CCCD or VNeID QR',
          desc: 'Upload a clear photo of the front of your chip-based CCCD (or scan via the VNeID app) for automatic date-of-birth verification.'
        },
        {
          step: 'Step 3',
          title: '15-Second Liveness Check (eKYC)',
          desc: 'Complete a quick camera face match on your phone or computer to confirm identity ownership.'
        },
        {
          step: 'Step 4',
          title: 'Book Discounted U22 / Senior Tickets Online',
          desc: 'Once approved, your account receives the "CCCD Verified" badge and automatically unlocks discounted ticket prices online without queuing at the counter.'
        }
      ]
    }
  }
};

const TicketPricePage = () => {
  // '2d' (Vùng 1) | '3d' (Vùng 2) | 'surcharge' (Vùng 3) | 'promo' (Vùng 4)
  const [activeZone, setActiveZone] = useState('2d');
  // 'vie' | 'eng'
  const [lang, setLang] = useState('vie');

  const t = I18N[lang];

  const handleToggleLang = () => {
    setLang(prev => (prev === 'vie' ? 'eng' : 'vie'));
  };

  return (
    <div className="ticket-price-slide">
      {/* Nút chuyển đổi ngôn ngữ ["vie/eng"] cỡ 0.7em trên góc phải */}
      <button
        type="button"
        className="tp-lang-switch-btn"
        onClick={handleToggleLang}
        title="Chuyển đổi ngôn ngữ Tiếng Việt / English"
      >
        [<span className={lang === 'vie' ? 'lang-active' : ''}>vie</span>/
        <span className={lang === 'eng' ? 'lang-active' : ''}>eng</span>]
      </button>

      {/* Khung trung tâm có độ rộng bằng chiều dài bảng giá vé */}
      <div className="tp-main-box">
        {/* Hàng tiêu đề: Bên trái là "GIÁ VÉ" + "Áp dụng từ ngày...", cùng dòng bên phải là 4 nút chuyển vùng */}
        <div className="tp-header-bar">
          <div className="tp-title-left">
            <h1 className="tp-main-title">{t.title}</h1>
            <p className="tp-effective-date">{t.effectiveDate}</p>
          </div>

          {/* Ngay trên dòng kẻ xám, cùng dòng với tiêu đề: các nút "2d" "3d" "phụ thu" "ưu đãi" cỡ 0.7em */}
          <nav className="tp-zone-nav" aria-label="Chọn danh mục giá vé">
            {t.tabs.map(tab => {
              const isActive = activeZone === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`tp-zone-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveZone(tab.id)}
                >
                  <span className="tp-zone-btn-text">{tab.label}</span>
                  {isActive && (
                    <span className="tp-zone-active-dot" aria-hidden="true">
                      ●
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dòng kẻ xám cắt ngay dưới tiêu đề, độ dài bằng chiều dài bảng giá vé */}
        <div className="tp-gray-divider" aria-hidden="true"></div>

        {/* Nội dung 4 vùng */}
        <div className="tp-zone-content" key={`${activeZone}-${lang}`}>
          {/* ================= VÙNG 1: GIÁ VÉ PHIM 2D ================= */}
          {activeZone === '2d' && (
            <div className="tp-table-wrapper">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th rowSpan="2" className="col-subject">{t.table2d.subjectHeader}</th>
                    <th colSpan="2">{t.table2d.monThu}</th>
                    <th colSpan="2">{t.table2d.friSun}</th>
                  </tr>
                  <tr>
                    <th>{t.table2d.standardSeat}</th>
                    <th className="vip-col-header">{t.table2d.vipSeat}</th>
                    <th>{t.table2d.standardSeat}</th>
                    <th className="vip-col-header">{t.table2d.vipSeat}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.table2d.rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="subject-cell">
                        <strong>{row.title}</strong>
                        <span>{row.sub}</span>
                      </td>
                      <td className={`price-cell ${row.type === 'discount' ? 'highlight-discount' : ''}`}>
                        {row.prices[0]}
                      </td>
                      <td
                        className={`price-cell ${
                          row.type === 'discount' ? 'highlight-discount' : 'vip-price'
                        }`}
                      >
                        {row.prices[1]}
                      </td>
                      <td className={`price-cell ${row.type === 'discount' ? 'highlight-discount' : ''}`}>
                        {row.prices[2]}
                      </td>
                      <td
                        className={`price-cell ${
                          row.type === 'discount' ? 'highlight-discount' : 'vip-price'
                        }`}
                      >
                        {row.prices[3]}
                      </td>
                    </tr>
                  ))}
                  <tr className="sweetbox-row">
                    <td className="subject-cell">
                      <strong>{t.table2d.sweetbox.title}</strong>
                      <span>{t.table2d.sweetbox.sub}</span>
                    </td>
                    <td colSpan="2" className="price-cell sweetbox-price">
                      {t.table2d.sweetbox.monThuPrice}
                    </td>
                    <td colSpan="2" className="price-cell sweetbox-price">
                      {t.table2d.sweetbox.friSunPrice}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ================= VÙNG 2: GIÁ VÉ PHIM 3D ================= */}
          {activeZone === '3d' && (
            <div className="tp-table-wrapper">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th rowSpan="2" className="col-subject">{t.table3d.timeHeader}</th>
                    <th colSpan="3">{t.table3d.monThu}</th>
                    <th colSpan="3">{t.table3d.friSun}</th>
                  </tr>
                  <tr>
                    <th>{t.table3d.standardSeat}</th>
                    <th className="vip-col-header">{t.table3d.vipSeat}</th>
                    <th>{t.table3d.coupleSeat}</th>
                    <th>{t.table3d.standardSeat}</th>
                    <th className="vip-col-header">{t.table3d.vipSeat}</th>
                    <th>{t.table3d.coupleSeat}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.table3d.rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="subject-cell">
                        <strong>{row.title}</strong>
                        <span>{row.sub}</span>
                      </td>
                      <td className="price-cell">{row.prices[0]}</td>
                      <td className="price-cell vip-price">{row.prices[1]}</td>
                      <td className="price-cell">{row.prices[2]}</td>
                      <td className="price-cell">{row.prices[3]}</td>
                      <td className="price-cell vip-price">{row.prices[4]}</td>
                      <td className="price-cell">{row.prices[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= VÙNG 3: QUY ĐỊNH CHUNG VÀ PHỤ THU ================= */}
          {activeZone === 'surcharge' && (
            <div className="tp-surcharge-panel">
              <h2 className="tp-panel-title">{t.surcharge.heading}</h2>
              <div className="tp-surcharge-grid">
                {t.surcharge.items.map((item, idx) => (
                  <div key={idx} className="tp-surcharge-item">
                    <div className="tp-surcharge-num">0{idx + 1}</div>
                    <div className="tp-surcharge-body">
                      <h3>{item.label}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VÙNG 4: ƯU ĐÃI + HƯỚNG DẪN XÁC THỰC CCCD ONLINE ================= */}
          {activeZone === 'promo' && (
            <div className="tp-promo-panel">
              <div className="tp-promo-block">
                <h2 className="tp-panel-title">{t.promo.policyHeading}</h2>
                <ul className="tp-promo-list">
                  {t.promo.policies.map((pol, idx) => (
                    <li key={idx}>{pol}</li>
                  ))}
                </ul>
              </div>

              <div className="tp-cccd-guide-block">
                <h2 className="tp-panel-title">{t.promo.cccdHeading}</h2>
                <div className="tp-cccd-steps-grid">
                  {t.promo.cccdSteps.map((st, idx) => (
                    <div key={idx} className="tp-cccd-step-card">
                      <span className="tp-step-badge">{st.step}</span>
                      <h3>{st.title}</h3>
                      <p>{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketPricePage;
