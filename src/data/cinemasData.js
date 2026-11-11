/**
 * Dữ liệu Thành Phố & Cụm Rạp Chiếu Phim - PTIT Cine
 */

export const citiesData = [
  {
    id: 'hanoi',
    name: 'Hà Nội',
    cinemas: [
      { id: 'hn-hadong', name: 'PTIT Cine Hà Đông', address: 'Km10 Nguyễn Trãi, Hà Đông, Hà Nội' },
      { id: 'hn-caugiay', name: 'PTIT Cine Cầu Giấy', address: '122 Xuân Thủy, Cầu Giấy, Hà Nội' },
      { id: 'hn-badinh', name: 'PTIT Cine Ba Đình', address: '87 Láng Hạ, Ba Đình, Hà Nội' },
      { id: 'hn-haibatrung', name: 'PTIT Cine Hai Bà Trưng', address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội' },
      { id: 'hn-longbien', name: 'PTIT Cine Long Biên', address: '27 Cổ Linh, Long Biên, Hà Nội' }
    ]
  },
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    cinemas: [
      { id: 'hcm-q1', name: 'PTIT Cine Quận 1', address: '116 Nguyễn Du, Phường Bến Thành, Quận 1' },
      { id: 'hcm-q7', name: 'PTIT Cine Quận 7', address: '101 Tôn Dật Tiên, Tân Phú, Quận 7' },
      { id: 'hcm-thuduc', name: 'PTIT Cine TP. Thủ Đức', address: '216 Võ Văn Ngân, Bình Thọ, TP. Thủ Đức' },
      { id: 'hcm-binhthanh', name: 'PTIT Cine Bình Thạnh', address: '561A Điện Biên Phủ, Phường 25, Bình Thạnh' },
      { id: 'hcm-tanbinh', name: 'PTIT Cine Tân Bình', address: '20 Cộng Hòa, Phường 12, Tân Bình' }
    ]
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    cinemas: [
      { id: 'dn-haichau', name: 'PTIT Cine Hải Châu', address: 'Nguyễn Văn Linh, Hải Châu, Đà Nẵng' },
      { id: 'dn-thanhkhe', name: 'PTIT Cine Thanh Khê', address: 'Điện Biên Phủ, Thanh Khê, Đà Nẵng' }
    ]
  },
  {
    id: 'haiphong',
    name: 'Hải Phòng',
    cinemas: [
      { id: 'hp-lechan', name: 'PTIT Cine Lê Chân', address: 'Võ Nguyên Giáp, Lê Chân, Hải Phòng' },
      { id: 'hp-ngoquyen', name: 'PTIT Cine Ngô Quyền', address: 'Lê Hồng Phong, Ngô Quyền, Hải Phòng' }
    ]
  },
  {
    id: 'cantho',
    name: 'Cần Thơ',
    cinemas: [
      { id: 'ct-ninhkieu', name: 'PTIT Cine Ninh Kiều', address: 'Đại lộ Hòa Bình, Ninh Kiều, Cần Thơ' }
    ]
  },
  {
    id: 'khanhhoa',
    name: 'Khánh Hòa (Nha Trang)',
    cinemas: [
      { id: 'kh-nhatrang', name: 'PTIT Cine Nha Trang', address: 'Trần Phú, Lộc Thọ, TP. Nha Trang' }
    ]
  },
  {
    id: 'quangninh',
    name: 'Quảng Ninh',
    cinemas: [
      { id: 'qn-halong', name: 'PTIT Cine Hạ Long', address: 'Bạch Đằng, TP. Hạ Long, Quảng Ninh' }
    ]
  },
  {
    id: 'hue',
    name: 'Thừa Thiên Huế',
    cinemas: [
      { id: 'hue-center', name: 'PTIT Cine Huế', address: 'Hùng Vương, Phú Nhuận, TP. Huế' }
    ]
  },
  {
    id: 'binhduong',
    name: 'Bình Dương',
    cinemas: [
      { id: 'bd-thudaumot', name: 'PTIT Cine Thủ Dầu Một', address: 'Đại lộ Bình Dương, TP. Thủ Dầu Một' }
    ]
  },
  {
    id: 'dongnai',
    name: 'Đồng Nai',
    cinemas: [
      { id: 'dn-bienhoa', name: 'PTIT Cine Biên Hòa', address: 'Phạm Văn Thuận, TP. Biên Hòa, Đồng Nai' }
    ]
  }
];

/**
 * Hàm loại bỏ dấu tiếng Việt để tìm kiếm không dấu
 */
export const removeVietnameseTones = (str = '') => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};
