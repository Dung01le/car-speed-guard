/**
 * CAR SPEED GUARD-XIP - MOBILE SPEED ENGINE (V3.0 - DỮ LIỆU TOÀN QUỐC & GHIM BIỂN 1 CHẠM)
 * Tác giả: Lê Viết Dũng | SĐT: 0983890250 | Email: Dungxip2008@gmail.com
 * Tự động nhận diện tốc độ theo GPS thời gian thực, cảnh báo sớm trước 250m và mở khóa âm thanh iOS.
 * Tích hợp kho dữ liệu tốc độ toàn quốc (các đoạn 70, 60, cao tốc, quốc lộ) và tính năng ghim biển 1 chạm.
 */

const SPEED_STANDARDS = {
  expressway: 100,      // Cao tốc (100 - 120 km/h)
  expressway_high: 120, // Cao tốc tiêu chuẩn cao
  rural_divided: 90,    // Ngoài đô thị, đường đôi có dải phân cách giữa
  rural_undivided: 80,  // Ngoài đô thị, đường 2 chiều
  urban_divided: 60,    // Trong đô thị, đường đôi có dải phân cách giữa
  urban_undivided: 50   // Trong đô thị / khu đông dân cư đường 2 chiều (MẶC ĐỊNH AN TOÀN)
};

// Kho dữ liệu các hành lang đường bộ trọng điểm & đoạn cắm biển cá biệt toàn quốc
const PREDEFINED_CORRIDORS = [
  {
    "name": "QL1A - Đoạn tiếp cận Dốc Miếu (Quảng Trị)",
    "type": "specific_limit",
    "speedLimit": 70,
    "bounds": [
      16.885,
      107.075,
      16.925,
      107.11
    ],
    "waypoints": [
      [
        16.885,
        107.098
      ],
      [
        16.905,
        107.09
      ],
      [
        16.925,
        107.082
      ]
    ],
    "province": "Quảng Trị",
    "description": "Đoạn đường dốc quanh co hạn chế tốc độ 70 km/h"
  },
  {
    "name": "QL1A - Đoạn tiếp cận Nút giao Tránh Phường Nam Đông Hà",
    "type": "specific_limit",
    "speedLimit": 70,
    "bounds": [
      16.755,
      107.105,
      16.785,
      107.138
    ],
    "waypoints": [
      [
        16.755,
        107.135
      ],
      [
        16.772,
        107.12
      ],
      [
        16.785,
        107.11
      ]
    ],
    "province": "Quảng Trị",
    "description": "Đoạn giảm tốc độ trước khi vào Phường Nam Đông Hà và nút giao tránh"
  },
  {
    "name": "QL1A - Trạm thu phí Quán Hàu (Quảng Bình)",
    "type": "specific_limit",
    "speedLimit": 70,
    "bounds": [
      17.375,
      106.62,
      17.415,
      106.665
    ],
    "province": "Quảng Bình",
    "description": "Đoạn giảm tốc độ 70 km/h trước trạm thu phí"
  },
  {
    "name": "QL1A - Đoạn dốc đèo Phước Tượng (Thừa Thiên Huế)",
    "type": "specific_limit",
    "speedLimit": 70,
    "bounds": [
      16.265,
      107.95,
      16.315,
      108.015
    ],
    "province": "Thừa Thiên Huế",
    "description": "Khu vực đường đèo dốc uốn lượn quy định 70 km/h"
  },
  {
    "name": "QL14 - Đoạn dốc quanh co Đắk Nông / Gia Lai",
    "type": "specific_limit",
    "speedLimit": 70,
    "bounds": [
      11.95,
      107.55,
      12.1,
      107.75
    ],
    "province": "Đắk Nông",
    "description": "Đường Hồ Chí Minh đoạn dốc quanh hạn chế 70 km/h"
  },
  {
    "name": "QL51 - Đoạn qua các KCN Tân Thành (Bà Rịa - Vũng Tàu)",
    "type": "specific_limit",
    "speedLimit": 70,
    "bounds": [
      10.53,
      107.02,
      10.64,
      107.11
    ],
    "province": "Bà Rịa - Vũng Tàu",
    "description": "Trục QL51 mật độ xe tải đông hạn chế 70 km/h"
  },
  {
    "name": "Tuyến tránh Quốc lộ 1A ngoài vành đai Phường Đông Hà - Phường Nam Đông Hà",
    "type": "specific_limit",
    "speedLimit": 60,
    "bounds": [
      16.74,
      107.105,
      16.865,
      107.155
    ],
    "waypoints": [
      [
        16.86,
        107.11
      ],
      [
        16.835,
        107.135
      ],
      [
        16.8,
        107.142
      ],
      [
        16.77,
        107.132
      ],
      [
        16.745,
        107.112
      ]
    ],
    "province": "Quảng Trị",
    "description": "Tuyến đường tránh ngoài vành đai Phường Đông Hà và Phường Nam Đông Hà quy định tốc độ 60 km/h"
  },
  {
    "name": "Đường Lê Duẩn & Nguyễn Văn Linh (Khu vực các phường Đà Nẵng)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.05,
      108.2,
      16.08,
      108.23
    ],
    "province": "Đà Nẵng",
    "description": "Trục đường đôi khu vực các phường trung tâm Đà Nẵng"
  },
  {
    "name": "Đại lộ Võ Nguyên Giáp & Trường Sa (Đà Nẵng - Hội An)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      15.98,
      108.24,
      16.07,
      108.26
    ],
    "province": "Đà Nẵng",
    "description": "Đường đôi ven biển có dải phân cách giữa"
  },
  {
    "name": "Đại lộ Thăng Long (Đường gom nội đô Hà Nội)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      20.98,
      105.7,
      21.01,
      105.78
    ],
    "province": "Hà Nội",
    "description": "Đường gom ven đại lộ quy định 60 km/h"
  },
  {
    "name": "Đại lộ Võ Văn Kiệt & Mai Chí Thọ (Hồ Chí Minh)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      10.72,
      106.66,
      10.78,
      106.74
    ],
    "province": "Hồ Chí Minh",
    "description": "Đại lộ Đông - Tây trục đường đôi Hồ Chí Minh"
  },
  {
    "name": "Cao tốc Cam Lộ - La Sơn",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      16.2,
      106.98,
      16.82,
      107.68
    ],
    "waypoints": [
      [
        16.785,
        107.015
      ],
      [
        16.72,
        107.08
      ],
      [
        16.65,
        107.18
      ],
      [
        16.55,
        107.35
      ],
      [
        16.45,
        107.45
      ],
      [
        16.38,
        107.55
      ],
      [
        16.28,
        107.65
      ]
    ],
    "province": "Quảng Trị - TT-Huế",
    "description": "Cao tốc Bắc - Nam nhánh Cam Lộ - La Sơn"
  },
  {
    "name": "Cao tốc La Sơn - Túy Loan",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      15.98,
      107.75,
      16.25,
      108.15
    ],
    "waypoints": [
      [
        16.25,
        107.76
      ],
      [
        16.15,
        107.9
      ],
      [
        16.05,
        108.05
      ]
    ],
    "province": "TT-Huế - Đà Nẵng",
    "description": "Cao tốc La Sơn nối vào cửa ngõ Đà Nẵng"
  },
  {
    "name": "Cao tốc Đà Nẵng - Quảng Ngãi",
    "type": "expressway_high",
    "speedLimit": 120,
    "bounds": [
      15.05,
      108.2,
      16.05,
      108.95
    ],
    "waypoints": [
      [
        16.02,
        108.21
      ],
      [
        15.75,
        108.45
      ],
      [
        15.45,
        108.7
      ],
      [
        15.15,
        108.85
      ]
    ],
    "province": "Đà Nẵng - Quảng Nam - Quảng Ngãi",
    "description": "Cao tốc liên vùng Duyên hải miền Trung"
  },
  {
    "name": "Cao tốc Pháp Vân - Cầu Giẽ - Ninh Bình",
    "type": "expressway_high",
    "speedLimit": 120,
    "bounds": [
      20.25,
      105.8,
      20.95,
      106.0
    ],
    "province": "Hà Nội - Hà Nam - Ninh Bình",
    "description": "Cao tốc huyết mạch cửa ngõ phía Nam Thủ đô"
  },
  {
    "name": "Cao tốc Mai Sơn - Quốc lộ 45 - Nghi Sơn",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      19.3,
      105.6,
      20.25,
      105.9
    ],
    "province": "Ninh Bình - Thanh Hóa",
    "description": "Cao tốc Bắc - Nam đoạn Ninh Bình - Thanh Hóa"
  },
  {
    "name": "Cao tốc Diễn Châu - Bãi Vọt",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      18.6,
      105.55,
      19.0,
      105.65
    ],
    "province": "Nghệ An - Hà Tĩnh",
    "description": "Cao tốc Bắc - Nam nhánh Nghệ An - Hà Tĩnh"
  },
  {
    "name": "Cao tốc Hà Nội - Hải Phòng (5B)",
    "type": "expressway_high",
    "speedLimit": 120,
    "bounds": [
      20.8,
      105.9,
      20.98,
      106.7
    ],
    "province": "Hà Nội - Hải Dương - Hải Phòng",
    "description": "Cao tốc tiêu chuẩn cao 120 km/h"
  },
  {
    "name": "Cao tốc Hạ Long - Vân Đồn - Móng Cái",
    "type": "expressway_high",
    "speedLimit": 120,
    "bounds": [
      20.9,
      107.0,
      21.5,
      107.95
    ],
    "province": "Quảng Ninh",
    "description": "Cao tốc ven biển phía Bắc 120 km/h"
  },
  {
    "name": "Cao tốc Nội Bài - Lào Cai",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      21.2,
      103.95,
      22.45,
      105.85
    ],
    "province": "Hà Nội - Vĩnh Phúc - Phú Thọ - Yên Bái - Lào Cai",
    "description": "Cao tốc Tây Bắc (100 km/h đoạn 4 làn, 80 km/h đoạn 2 làn)"
  },
  {
    "name": "Cao tốc Hồ Chí Minh - Long Thành - Dầu Giây",
    "type": "expressway_high",
    "speedLimit": 120,
    "bounds": [
      10.75,
      106.75,
      10.95,
      107.25
    ],
    "province": "Hồ Chí Minh - Đồng Nai",
    "description": "Cao tốc cửa ngõ miền Đông Nam Bộ"
  },
  {
    "name": "Cao tốc Phan Thiết - Dầu Giây",
    "type": "expressway_high",
    "speedLimit": 120,
    "bounds": [
      10.9,
      107.2,
      11.1,
      108.1
    ],
    "province": "Đồng Nai - Bình Thuận",
    "description": "Cao tốc miền Trung - Đông Nam Bộ"
  },
  {
    "name": "Cao tốc Vĩnh Hảo - Phan Thiết",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      11.05,
      108.05,
      11.35,
      108.75
    ],
    "province": "Bình Thuận",
    "description": "Cao tốc Bắc - Nam nhánh Bình Thuận"
  },
  {
    "name": "Cao tốc Hồ Chí Minh - Trung Lương - Mỹ Thuận",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      10.3,
      105.8,
      10.7,
      106.6
    ],
    "province": "Hồ Chí Minh - Long An - Tiền Giang",
    "description": "Cao tốc cửa ngõ Miền Tây Nam Bộ"
  },
  {
    "name": "Quốc lộ 1A (Đoạn qua Quảng Trị - Vĩnh Linh đến Hải Lăng)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      16.63,
      107.0,
      17.15,
      107.28
    ],
    "waypoints": [
      [
        17.1,
        107.035
      ],
      [
        17.06,
        107.05
      ],
      [
        17.006,
        107.055
      ],
      [
        16.98,
        107.065
      ],
      [
        16.92,
        107.085
      ],
      [
        16.89,
        107.098
      ],
      [
        16.825,
        107.1
      ],
      [
        16.78,
        107.125
      ],
      [
        16.75,
        107.145
      ],
      [
        16.7,
        107.2
      ],
      [
        16.68,
        107.23
      ]
    ],
    "province": "Quảng Trị",
    "description": "QL1A đường đôi có dải phân cách giữa ngoài đô thị (90 km/h)"
  },
  {
    "name": "Quốc lộ 9 (Hành lang kinh tế Đông - Tây: Phường Đông Hà - Xã Lao Bảo)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      16.58,
      106.5,
      16.85,
      107.11
    ],
    "waypoints": [
      [
        16.818,
        107.097
      ],
      [
        16.815,
        107.03
      ],
      [
        16.78,
        106.95
      ],
      [
        16.72,
        106.85
      ],
      [
        16.65,
        106.72
      ],
      [
        16.615,
        106.595
      ]
    ],
    "province": "Quảng Trị",
    "description": "QL9 đường 2 chiều ngoài đô thị từ Phường Đông Hà đi Xã Lao Bảo (80 km/h)"
  },
  {
    "name": "Quốc lộ 1A (Đoạn qua Thừa Thiên Huế)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      16.2,
      107.5,
      16.65,
      107.75
    ],
    "province": "Thừa Thiên Huế",
    "description": "QL1A đường đôi có dải phân cách cứng"
  },
  {
    "name": "Quốc lộ 1A (Đoạn qua Quảng Bình - Lệ Thủy đến Đồng Hới)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.15,
      106.55,
      17.6,
      106.8
    ],
    "province": "Quảng Bình",
    "description": "QL1A đường đôi ngoài đô thị Quảng Bình"
  },
  {
    "name": "Quốc lộ 1A (Đoạn qua Hà Tĩnh - Kỳ Anh đến Hồng Lĩnh)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      18.0,
      105.7,
      18.6,
      106.3
    ],
    "province": "Hà Tĩnh",
    "description": "QL1A dải phân cách giữa Hà Tĩnh"
  },
  {
    "name": "Quốc lộ 14 (Đường Hồ Chí Minh qua Tây Nguyên: Kon Tum - Đắk Lắk)",
    "type": "rural_divided",
    "speedLimit": 80,
    "bounds": [
      12.5,
      107.8,
      14.5,
      108.2
    ],
    "province": "Kon Tum - Gia Lai - Đắk Lắk",
    "description": "Đường Hồ Chí Minh Tây Nguyên ngoài đô thị"
  },
  {
    "name": "Quốc lộ 51 (Biên Hòa - Vũng Tàu)",
    "type": "rural_divided",
    "speedLimit": 80,
    "bounds": [
      10.45,
      107.1,
      10.9,
      107.0
    ],
    "province": "Đồng Nai - Bà Rịa Vũng Tàu",
    "description": "QL51 đường đôi dải phân cách cứng"
  },
  {
    "name": "Quốc lộ 1A (Đoạn qua Khánh Hòa - Phú Yên)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      11.9,
      109.0,
      13.5,
      109.3
    ],
    "province": "Khánh Hòa - Phú Yên",
    "description": "QL1A đường đôi duyên hải Nam Trung Bộ"
  },
  {
    "name": "Khu vực Phường Đông Hà (Quảng Trị)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.815,
      107.07,
      16.85,
      107.12
    ],
    "province": "Quảng Trị",
    "description": "Khu đông dân cư Phường Đông Hà (đường nội thị không dải phân cách)"
  },
  {
    "name": "Khu vực Phường Nam Đông Hà (Quảng Trị)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.78,
      107.06,
      16.815,
      107.12
    ],
    "province": "Quảng Trị",
    "description": "Khu đông dân cư Phường Nam Đông Hà (đường nội thị không dải phân cách)"
  },
  {
    "name": "Khu vực các phường trung tâm Huế",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.42,
      107.55,
      16.49,
      107.63
    ],
    "province": "Thừa Thiên Huế",
    "description": "Khu đông dân cư các phường trung tâm Huế"
  },
  {
    "name": "Khu vực các phường trung tâm Đà Nẵng",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      15.98,
      108.15,
      16.12,
      108.28
    ],
    "province": "Đà Nẵng",
    "description": "Khu đông dân cư các phường trung tâm Đà Nẵng"
  },
  {
    "name": "Khu vực các phường trung tâm Đồng Hới (Quảng Bình)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.44,
      106.58,
      17.5,
      106.63
    ],
    "province": "Quảng Bình",
    "description": "Khu vực các phường nội đô Đồng Hới"
  },
  {
    "name": "Khu vực các phường trung tâm Hà Tĩnh",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      18.31,
      105.88,
      18.37,
      105.93
    ],
    "province": "Hà Tĩnh",
    "description": "Khu vực các phường nội đô Hà Tĩnh"
  },
  {
    "name": "Khu vực các phường trung tâm Vinh (Nghệ An)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      18.64,
      105.64,
      18.72,
      105.71
    ],
    "province": "Nghệ An",
    "description": "Khu vực các phường nội đô Vinh"
  },
  {
    "name": "Khu vực các phường nội thành Hà Nội",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      20.95,
      105.75,
      21.1,
      105.9
    ],
    "province": "Hà Nội",
    "description": "Khu vực các phường nội thành Hà Nội"
  },
  {
    "name": "Khu vực các phường nội thành Hồ Chí Minh",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      10.7,
      106.6,
      10.85,
      106.75
    ],
    "province": "Hồ Chí Minh",
    "description": "Khu vực các phường nội thành Hồ Chí Minh"
  },
  {
    "name": "Quốc lộ 9 (QL.9;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      16.66267,
      106.83069,
      16.66485,
      106.84018
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9;HCM - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.57171,
      107.23481,
      16.59366,
      107.25631
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.56541,
      107.22182,
      16.61438,
      107.2622
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.56551,
      107.22195,
      16.61447,
      107.26232
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.72023,
      107.02016,
      16.80299,
      107.05946
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.67546,
      107.09187,
      16.69097,
      107.11728
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.67365,
      107.06852,
      16.70989,
      107.12446
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.63706,
      107.13795,
      16.6683,
      107.2052
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.65954,
      107.14473,
      16.66497,
      107.15421
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.6509,
      107.15822,
      16.65728,
      107.16969
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.65742,
      107.15447,
      16.65939,
      107.15798
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.65939,
      107.15421,
      16.65954,
      107.15447
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.65728,
      107.15798,
      16.65742,
      107.15822
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Thạch Hãn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.67462,
      107.11728,
      16.67546,
      107.12057
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.66843,
      107.1245,
      16.6738,
      107.13803
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.67365,
      107.12367,
      16.67393,
      107.12446
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.67393,
      107.12057,
      16.67462,
      107.12367
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.66772,
      107.13795,
      16.6683,
      107.13929
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.66497,
      107.13929,
      16.66772,
      107.14473
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.72023,
      107.05881,
      16.72093,
      107.05946
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.72093,
      107.04782,
      16.73663,
      107.05881
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.71806,
      107.05934,
      16.72014,
      107.061
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.73663,
      107.04316,
      16.74354,
      107.04782
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.75232,
      107.02279,
      16.77309,
      107.03729
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.74354,
      107.04251,
      16.74451,
      107.04316
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.74451,
      107.03748,
      16.75204,
      107.04251
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.75204,
      107.03729,
      16.75232,
      107.03748
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.77309,
      107.02011,
      16.78239,
      107.02279
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.78239,
      107.02009,
      16.79607,
      107.02015
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.701,
      107.07603,
      16.70337,
      107.07879
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.69147,
      107.07879,
      16.701,
      107.09126
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.70385,
      107.06919,
      16.70936,
      107.07549
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.70999,
      107.06124,
      16.71801,
      107.06863
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.70936,
      107.06852,
      16.70989,
      107.06919
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.70337,
      107.07549,
      16.70385,
      107.07603
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.69097,
      107.09126,
      16.69147,
      107.09187
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.71792,
      107.061,
      16.71806,
      107.06111
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Trần Bình Trọng (ĐT.585B)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.79035,
      107.0858,
      16.80404,
      107.08938
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.585B - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Trường Chinh",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.76946,
      107.15709,
      16.77907,
      107.16643
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.61328,
      107.21576,
      16.62577,
      107.22271
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.63489,
      107.20871,
      16.63703,
      107.20918
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.63612,
      107.20623,
      16.63724,
      107.20916
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.63489,
      107.20623,
      16.63663,
      107.20918
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.62577,
      107.21001,
      16.63429,
      107.21576
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.6245,
      107.20838,
      16.63519,
      107.21628
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.63456,
      107.20571,
      16.63676,
      107.208
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.6356,
      107.20813,
      16.63838,
      107.20982
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.63429,
      107.20973,
      16.63448,
      107.21001
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.63454,
      107.20838,
      16.63519,
      107.20964
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.63454,
      107.20918,
      16.63489,
      107.20964
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.63462,
      107.20661,
      16.63573,
      107.20838
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.63531,
      107.20794,
      16.6356,
      107.20813
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.59451,
      107.22708,
      16.60712,
      107.2344
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.59366,
      107.2344,
      16.59451,
      107.23481
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.60793,
      107.22271,
      16.61328,
      107.22649
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.60712,
      107.22649,
      16.60793,
      107.22708
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.64396,
      107.16969,
      16.6509,
      107.19175
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.63742,
      107.19271,
      16.64372,
      107.20475
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.64372,
      107.19175,
      16.64396,
      107.19271
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.63676,
      107.20475,
      16.63742,
      107.20571
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Hai Bà Trưng (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.74003,
      107.19081,
      16.7556,
      107.19271
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76403,
      107.21614,
      16.76967,
      107.23457
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.7671,
      107.1779,
      16.80888,
      107.1935
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 1 - Đường tránh Quảng Trị (QL.1)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76665,
      107.16901,
      16.76739,
      107.17167
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.1 - 2 làn"
  },
  {
    "name": "Quốc lộ 1 - Đường tránh Quảng Trị (QL.1)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76622,
      107.16807,
      16.76665,
      107.16901
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 - Đường tránh Quảng Trị (QL.1)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.75784,
      107.18346,
      16.7587,
      107.18565
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - Số hiệu: QL.1 - 4 làn"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.75814,
      107.18789,
      16.76558,
      107.19287
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.7556,
      107.19271,
      16.76099,
      107.20078
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76108,
      107.20095,
      16.76679,
      107.2048
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76558,
      107.19287,
      16.7671,
      107.19334
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76721,
      107.20554,
      16.77068,
      107.21515
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76679,
      107.2048,
      16.76721,
      107.20554
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.77056,
      107.21515,
      16.77068,
      107.21528
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76993,
      107.21536,
      16.77049,
      107.21593
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76976,
      107.21593,
      16.76993,
      107.21607
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.7634,
      107.23478,
      16.77109,
      107.2629
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Quốc lộ 49C (QL.49C)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.76434,
      107.23457,
      16.76439,
      107.23478
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.49C"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.92933,
      106.94859,
      16.94818,
      106.95597
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.93061,
      106.94872,
      16.94827,
      106.95562
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Bến Tắt (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.94818,
      106.94781,
      16.95017,
      106.94859
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.9502,
      106.94441,
      16.95867,
      106.94798
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.95976,
      106.93001,
      16.98415,
      106.94394
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.98491,
      106.91196,
      17.02033,
      106.92891
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.95867,
      106.94394,
      16.95976,
      106.94441
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Rào Trường (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.98415,
      106.929,
      16.98502,
      106.93001
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.03844,
      106.64148,
      17.05626,
      106.67254
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.05663,
      106.67279,
      17.06911,
      106.69583
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Vít Thù Lù (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.05626,
      106.67254,
      17.05663,
      106.67279
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.06871,
      106.69646,
      17.072,
      106.70531
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.07612,
      106.72869,
      17.09452,
      106.75148
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Khe Rêu (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.06902,
      106.69583,
      17.06912,
      106.69646
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Hộp Sổ (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.072,
      106.70531,
      17.0723,
      106.70574
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Gằng Mười (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.07364,
      106.71343,
      17.07371,
      106.71404
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.0723,
      106.70574,
      17.07564,
      106.71343
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.07371,
      106.71404,
      17.0772,
      106.72273
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.07768,
      106.72298,
      17.08065,
      106.72836
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Chuồi (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.0772,
      106.72273,
      17.07768,
      106.72298
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Ván (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.0794,
      106.72836,
      17.07964,
      106.72869
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.14735,
      106.59271,
      17.17759,
      106.61032
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.12001,
      106.74467,
      17.13783,
      106.7527
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.03512,
      106.84604,
      17.06816,
      106.89709
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.07799,
      106.76067,
      17.1467,
      106.82954
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Chu Kê (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.09452,
      106.75136,
      17.09522,
      106.75143
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.09522,
      106.74809,
      17.1097,
      106.75254
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.06816,
      106.84443,
      17.0691,
      106.84604
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.06828,
      106.84451,
      17.06922,
      106.84612
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.0691,
      106.83298,
      17.07581,
      106.84443
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.07581,
      106.82946,
      17.07787,
      106.83298
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.07593,
      106.82954,
      17.07799,
      106.83306
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.02427,
      106.90226,
      17.03052,
      106.90498
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9D (QL.9D)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.02176,
      106.90207,
      17.02412,
      106.90741
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9D"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.02658,
      106.90226,
      17.03052,
      106.90602
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.03052,
      106.89734,
      17.03495,
      106.90226
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.03495,
      106.89709,
      17.03512,
      106.89734
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.02989,
      106.89752,
      17.035,
      106.90306
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9D (QL.9D)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.03302,
      106.91535,
      17.05569,
      106.945
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9D"
  },
  {
    "name": "Cầu Sa Lung (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.02033,
      106.9105,
      17.02186,
      106.91196
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Sa Lung (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.02042,
      106.9106,
      17.02196,
      106.91206
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9D (QL.9D)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.02481,
      106.91043,
      17.03272,
      106.9153
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - Số hiệu: QL.9D"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.02482,
      106.90666,
      17.02774,
      106.91115
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.02524,
      106.90306,
      17.02989,
      106.91124
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.02186,
      106.90602,
      17.02658,
      106.9105
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.02196,
      106.90788,
      17.02482,
      106.9106
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu vượt Bến Lãng (QL.9D)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.02412,
      106.90741,
      17.02481,
      106.91043
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - Số hiệu: QL.9D"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.02482,
      106.90306,
      17.02989,
      106.90788
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.02433,
      106.90307,
      17.02811,
      106.90602
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Khe Cáy (QL.9D)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.03272,
      106.9153,
      17.03302,
      106.91536
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9D"
  },
  {
    "name": "Quốc lộ 9D (QL.9D)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.05569,
      106.945,
      17.05576,
      106.94516
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9D"
  },
  {
    "name": "Cầu Khe Ma (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.1097,
      106.75254,
      17.11036,
      106.75282
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.11036,
      106.75157,
      17.11972,
      106.75307
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Khe Ma (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.11972,
      106.7525,
      17.12001,
      106.75258
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Khe Sứt (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.13783,
      106.74763,
      17.13823,
      106.74783
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Quốc lộ 9C (QL.9C)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.13823,
      106.74613,
      17.15689,
      106.75262
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9C"
  },
  {
    "name": "Cầu Thác Cóc (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.1467,
      106.75923,
      17.14863,
      106.76067
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.14863,
      106.75106,
      17.15965,
      106.75923
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Tránh Lũ Ba Canh",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.13919,
      106.80895,
      17.14033,
      106.80936
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 2 làn"
  },
  {
    "name": "Đường tránh lũ Ba Canh",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.13751,
      106.80958,
      17.13859,
      106.80979
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 2 làn"
  },
  {
    "name": "Cầu Ba Canh (mới)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.13859,
      106.80936,
      17.13919,
      106.80958
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 2 làn"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.81959,
      106.99097,
      16.87566,
      107.01711
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.79607,
      107.02013,
      16.79627,
      107.02013
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.79627,
      107.02013,
      16.80264,
      107.02014
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 100,
    "bounds": [
      16.80553,
      107.01995,
      16.81041,
      107.02006
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.80392,
      107.02019,
      16.80909,
      107.02022
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.80417,
      107.01693,
      16.8084,
      107.01931
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.80553,
      107.018,
      16.80822,
      107.02006
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.80392,
      107.02022,
      16.8084,
      107.02184
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.80264,
      107.02014,
      16.80392,
      107.02022
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.8082,
      107.01773,
      16.81041,
      107.01995
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.80831,
      107.01931,
      16.80832,
      107.02079
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.81041,
      107.01767,
      16.81782,
      107.01995
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.80909,
      107.0178,
      16.81787,
      107.0202
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.80694,
      107.0202,
      16.80909,
      107.02174
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu vượt Sông Hiếu (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.81782,
      107.01697,
      16.81954,
      107.01767
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9 (QL.9)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      16.82194,
      107.01309,
      16.82232,
      107.01393
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9 - 2 làn"
  },
  {
    "name": "Đường cao tốc Vạn Ninh - Cam Lộ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      16.87651,
      106.96769,
      16.90754,
      106.99042
    ],
    "province": "Quảng Trị",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.1916,
      107.72637,
      16.20112,
      107.72921
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.20181,
      107.72328,
      16.20619,
      107.72594
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Vực Tròn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.20112,
      107.72594,
      16.20181,
      107.72637
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 40,
    "bounds": [
      16.209,
      107.72114,
      16.20976,
      107.72135
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (40 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 40,
    "bounds": [
      16.20851,
      107.7218,
      16.20934,
      107.72208
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (40 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 40,
    "bounds": [
      16.20738,
      107.72207,
      16.20934,
      107.72339
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (40 km/h) - 2 làn"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.20706,
      107.72193,
      16.20847,
      107.72278
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Phú Mậu (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.20619,
      107.72278,
      16.20706,
      107.72328
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 40,
    "bounds": [
      16.20847,
      107.72114,
      16.20906,
      107.72193
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (40 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 40,
    "bounds": [
      16.20645,
      107.72106,
      16.209,
      107.72268
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (40 km/h) - 2 làn"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.20851,
      107.72137,
      16.20981,
      107.72208
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.20847,
      107.72123,
      16.20976,
      107.72193
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.20976,
      107.71969,
      16.21319,
      107.72123
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.21484,
      107.71636,
      16.22479,
      107.71891
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu cọc H6 (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.21319,
      107.71891,
      16.21484,
      107.71969
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.25429,
      107.69747,
      16.27062,
      107.70044
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu cọc 34 (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.22907,
      107.7143,
      16.2308,
      107.71501
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.23274,
      107.69492,
      16.2458,
      107.71149
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.2308,
      107.71239,
      16.23212,
      107.7143
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu cọc 11 (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.23212,
      107.71142,
      16.23261,
      107.71239
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Cọc 7 (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.22479,
      107.71557,
      16.22641,
      107.71636
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.22641,
      107.71501,
      16.22907,
      107.71557
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Tây Hy (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.2458,
      107.69466,
      16.24906,
      107.695
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.24902,
      107.69514,
      16.25409,
      107.69746
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Vũng Vàng (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.25411,
      107.69731,
      16.2543,
      107.69732
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.37188,
      107.63539,
      16.37461,
      107.64518
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.35453,
      107.64547,
      16.37178,
      107.66594
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.32841,
      107.68841,
      16.33693,
      107.69959
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.34565,
      107.67361,
      16.34833,
      107.67664
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.33693,
      107.67679,
      16.34554,
      107.68841
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.34554,
      107.67664,
      16.34565,
      107.67679
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.37178,
      107.64518,
      16.37188,
      107.64547
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.34833,
      107.67311,
      16.34878,
      107.67361
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.35436,
      107.66594,
      16.35453,
      107.66617
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.34878,
      107.66617,
      16.35436,
      107.67311
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Khe Sến (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.27062,
      107.70011,
      16.2712,
      107.70032
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.27125,
      107.70018,
      16.27806,
      107.7049
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.27827,
      107.70511,
      16.28628,
      107.70847
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Khe Lốt (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.27806,
      107.7049,
      16.27827,
      107.70511
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.28628,
      107.70847,
      16.28646,
      107.70869
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.28617,
      107.70856,
      16.28634,
      107.70878
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.28959,
      107.71133,
      16.30451,
      107.71781
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Khe Sâu (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.2893,
      107.71125,
      16.28959,
      107.71133
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31796,
      107.70068,
      16.32731,
      107.70994
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đi Đà Nẵng",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31288,
      107.71207,
      16.31503,
      107.71495
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Phú Lộc",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31599,
      107.71382,
      16.3175,
      107.71547
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Phú Lộc",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31371,
      107.71214,
      16.31538,
      107.71324
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Phú Lộc",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31499,
      107.71268,
      16.3152,
      107.71292
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường dẫn cao tốc",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31606,
      107.71374,
      16.31758,
      107.7154
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Đà Nẵng",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31503,
      107.71263,
      16.31525,
      107.71287
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Phú Lộc",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31329,
      107.71339,
      16.31599,
      107.71479
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31288,
      107.71243,
      16.31538,
      107.71495
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31329,
      107.71065,
      16.31734,
      107.71479
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đương cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31133,
      107.71479,
      16.31329,
      107.7168
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31125,
      107.71495,
      16.31288,
      107.71668
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31538,
      107.71027,
      16.31762,
      107.71243
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Khe Trái (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31762,
      107.70994,
      16.31796,
      107.71027
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đi Huế, Quảng Trị",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      16.31571,
      107.71065,
      16.31734,
      107.71374
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31734,
      107.71027,
      16.31762,
      107.71065
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.3074,
      107.71746,
      16.31069,
      107.7189
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc La Sơn - Hoà Liên (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.3046,
      107.71769,
      16.30741,
      107.71875
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Sông Nông (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.31069,
      107.7168,
      16.31133,
      107.71746
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.32731,
      107.70051,
      16.32748,
      107.70068
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.32748,
      107.69959,
      16.32841,
      107.70051
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.48794,
      107.35742,
      16.50659,
      107.44251
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.48809,
      107.3575,
      16.50672,
      107.44251
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.45295,
      107.47838,
      16.48005,
      107.51217
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.45297,
      107.4564,
      16.48698,
      107.51219
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.39887,
      107.52939,
      16.4288,
      107.56338
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.42289,
      107.53018,
      16.42823,
      107.5406
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39625,
      107.56417,
      16.39755,
      107.56556
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39982,
      107.56134,
      16.40269,
      107.56284
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39352,
      107.57045,
      16.39424,
      107.57462
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39337,
      107.56771,
      16.3946,
      107.57217
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39352,
      107.56556,
      16.39625,
      107.57045
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.3946,
      107.56404,
      16.39747,
      107.56771
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường dẫn vào cao tốc",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39457,
      107.56893,
      16.39585,
      107.57167
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Quốc lộ 49",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39457,
      107.56901,
      16.39576,
      107.57167
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Đà Nẵng",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39293,
      107.56769,
      16.39424,
      107.57217
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Quốc lộ 49",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39302,
      107.56771,
      16.3946,
      107.56882
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39777,
      107.56284,
      16.39982,
      107.56401
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39747,
      107.56388,
      16.39769,
      107.56404
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39755,
      107.56401,
      16.39777,
      107.56417
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Quốc lộ 49",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39443,
      107.56831,
      16.39504,
      107.56874
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Đà Nẵng",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39448,
      107.56824,
      16.39508,
      107.56867
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39504,
      107.56874,
      16.39517,
      107.56884
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Quảng Trị",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39524,
      107.56874,
      16.39543,
      107.56893
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đi Đà Nẵng",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.39522,
      107.56877,
      16.39543,
      107.56893
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Tuần CL-LS (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39424,
      107.57462,
      16.39494,
      107.57828
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39523,
      107.58256,
      16.39526,
      107.58517
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39508,
      107.58231,
      16.39512,
      107.58518
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39361,
      107.57217,
      16.3941,
      107.57466
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Khải Định (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      16.39542,
      107.582,
      16.39542,
      107.58264
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn"
  },
  {
    "name": "Cầu Châu Ê (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      16.39526,
      107.57931,
      16.39529,
      107.57952
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39494,
      107.57828,
      16.39514,
      107.57923
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39518,
      107.5795,
      16.39527,
      107.58182
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39504,
      107.57952,
      16.39512,
      107.58154
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Châu Ê CL-LS (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39514,
      107.57923,
      16.39518,
      107.5795
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.40295,
      107.55377,
      16.41361,
      107.56121
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.41507,
      107.5409,
      16.42269,
      107.54968
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Khe Nước (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.42269,
      107.5406,
      16.42289,
      107.5409
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Khe Ly (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.41498,
      107.54968,
      16.41507,
      107.55011
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Tam Vinh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.41361,
      107.55359,
      16.4137,
      107.55377
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.4137,
      107.55011,
      16.41498,
      107.55359
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Khe Thương CL-LS (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.40269,
      107.56121,
      16.40295,
      107.56134
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.43842,
      107.51658,
      16.44005,
      107.51828
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.43748,
      107.51828,
      16.43842,
      107.51939
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn giai đoạn 2 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.43738,
      107.51413,
      16.44615,
      107.51928
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.42823,
      107.51928,
      16.43738,
      107.53018
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.44156,
      107.51523,
      16.44209,
      107.51551
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.44029,
      107.51551,
      16.44156,
      107.51639
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Vân Thành (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.44005,
      107.51639,
      16.44029,
      107.51658
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.44209,
      107.51424,
      16.44616,
      107.51523
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Số 4 (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.44616,
      107.51217,
      16.45295,
      107.51429
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Số 4 (CT.01;CT.02)",
    "type": "rural_divided",
    "speedLimit": 100,
    "bounds": [
      16.44615,
      107.51209,
      16.45286,
      107.51418
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (100 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Nguyễn Phúc Chu",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.45787,
      107.54479,
      16.45952,
      107.55211
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h)"
  },
  {
    "name": "Nguyễn Thiện Thuật",
    "type": "urban_undivided",
    "speedLimit": 40,
    "bounds": [
      16.46574,
      107.57177,
      16.46791,
      107.57487
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (40 km/h)"
  },
  {
    "name": "Đinh Tiên Hoàng",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.47499,
      107.57476,
      16.48194,
      107.58016
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 2 làn"
  },
  {
    "name": "Đinh Tiên Hoàng",
    "type": "urban_undivided",
    "speedLimit": 30,
    "bounds": [
      16.46986,
      107.58241,
      16.47209,
      107.58415
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (30 km/h) - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.48804,
      107.40843,
      16.489,
      107.4327
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.48903,
      107.38877,
      16.49157,
      107.40808
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Ông Vàng (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.489,
      107.40808,
      16.48903,
      107.40843
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.48839,
      107.43646,
      16.48861,
      107.44134
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Sông Bồ (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.48828,
      107.4327,
      16.48839,
      107.43646
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.48637,
      107.44134,
      16.48877,
      107.45812
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.48022,
      107.45812,
      16.48637,
      107.47799
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Hương Trà (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.48005,
      107.47799,
      16.48022,
      107.47838
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Cầu Cửa Hậu",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.48691,
      107.57054,
      16.48734,
      107.57088
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 2 làn"
  },
  {
    "name": "Cầu Kho",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.48198,
      107.57431,
      16.48253,
      107.57473
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h)"
  },
  {
    "name": "Đinh Tiên Hoàng",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      16.48253,
      107.57106,
      16.48668,
      107.57431
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.38361,
      107.60274,
      16.38755,
      107.61516
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.38799,
      107.58746,
      16.39512,
      107.60198
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39523,
      107.58517,
      16.39523,
      107.58553
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.39512,
      107.58553,
      16.39523,
      107.58746
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.38784,
      107.60198,
      16.38799,
      107.6023
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.37895,
      107.61568,
      16.38349,
      107.6258
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.38349,
      107.61536,
      16.38368,
      107.61568
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.38355,
      107.61516,
      16.38361,
      107.61534
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.3762,
      107.63013,
      16.37661,
      107.63094
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường cao tốc Cam Lộ - La Sơn (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 80,
    "bounds": [
      16.37467,
      107.63094,
      16.3762,
      107.63519
    ],
    "province": "Thừa Thiên Huế",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: CT.01;CT.02 - 2 làn"
  },
  {
    "name": "Đường tránh lũ - QL.1",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.20417,
      106.68864,
      17.36658,
      106.8722
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.52746,
      106.42399,
      17.59667,
      106.47929
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 4 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.44457,
      106.51863,
      17.47963,
      106.53709
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.44444,
      106.51845,
      17.47963,
      106.53697
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.5029,
      106.4795,
      17.52726,
      106.50626
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 4 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.52736,
      106.46929,
      17.53686,
      106.47875
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.51845,
      106.47882,
      17.5271,
      106.48702
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.51861,
      106.47897,
      17.52715,
      106.48708
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.52715,
      106.47875,
      17.52736,
      106.47897
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.49101,
      106.5075,
      17.50086,
      106.51784
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 2 làn"
  },
  {
    "name": "Cầu Đá Mài (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.50047,
      106.50635,
      17.50171,
      106.50719
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.49106,
      106.50705,
      17.5004,
      106.51283
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu vượt QL.9E (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.47963,
      106.51832,
      17.47991,
      106.51845
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu vượt QL.9E (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.47963,
      106.5185,
      17.47992,
      106.51863
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.48431,
      106.51542,
      17.4881,
      106.51668
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.48726,
      106.51239,
      17.4891,
      106.51477
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.48822,
      106.51664,
      17.49024,
      106.51943
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.48803,
      106.51298,
      17.49109,
      106.51664
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.4877,
      106.51513,
      17.4881,
      106.51668
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.48431,
      106.51298,
      17.49109,
      106.51639
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.48726,
      106.51283,
      17.49106,
      106.51477
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.48309,
      106.51477,
      17.48726,
      106.51678
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.47992,
      106.51713,
      17.48278,
      106.5185
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.48762,
      106.51433,
      17.48781,
      106.51508
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.48312,
      106.51639,
      17.48431,
      106.51696
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.48273,
      106.51678,
      17.48309,
      106.51696
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.4839,
      106.52285,
      17.49028,
      106.53182
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 2 làn"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.49024,
      106.51943,
      17.49072,
      106.51992
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.49033,
      106.51784,
      17.49101,
      106.52255
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 2 làn"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.49028,
      106.52255,
      17.49033,
      106.52285
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 2 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.50274,
      106.48728,
      17.5184,
      106.50549
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.502,
      106.50635,
      17.50276,
      106.50683
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 4 làn"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.50276,
      106.50626,
      17.5029,
      106.50635
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 4 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.50163,
      106.50547,
      17.50254,
      106.50621
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Đá Rò (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.50254,
      106.50532,
      17.5027,
      106.50547
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.50171,
      106.50565,
      17.50257,
      106.50635
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.51823,
      106.48702,
      17.51845,
      106.48722
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.55343,
      106.42631,
      17.58091,
      106.45378
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Vũng Áng - Bùng (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.60196,
      106.38537,
      17.63718,
      106.40658
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.6015,
      106.39944,
      17.61456,
      106.41418
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 4 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.58154,
      106.41164,
      17.59604,
      106.42567
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.58146,
      106.4099,
      17.59783,
      106.42552
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.58091,
      106.42567,
      17.58154,
      106.42631
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59783,
      106.40657,
      17.59967,
      106.4099
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59839,
      106.40872,
      17.59903,
      106.40979
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59969,
      106.41091,
      17.60156,
      106.41408
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59774,
      106.40646,
      17.60188,
      106.40878
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59931,
      106.40768,
      17.60066,
      106.41091
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59604,
      106.41012,
      17.59961,
      106.41164
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.59604,
      106.40768,
      17.60066,
      106.41164
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.59783,
      106.40646,
      17.60188,
      106.4099
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59895,
      106.40988,
      17.59961,
      106.41097
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.59693,
      106.41418,
      17.6015,
      106.42342
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 4 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.60066,
      106.40658,
      17.60196,
      106.40768
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.60131,
      106.41365,
      17.60181,
      106.41381
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hồ Chí Minh nhánh Đông (QL.15;HCM)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.59667,
      106.42342,
      17.59693,
      106.42399
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.15;HCM - 4 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.53676,
      106.45395,
      17.5531,
      106.46917
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.5531,
      106.45368,
      17.55332,
      106.45395
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Hùng Vương (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.56857,
      106.53371,
      17.5872,
      106.54117
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.60608,
      106.52048,
      17.63704,
      106.53218
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.60613,
      106.52062,
      17.6371,
      106.53233
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Nguyễn Văn Linh (ĐT.561)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.58883,
      106.52171,
      17.59173,
      106.52549
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.561 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Hiểm (ĐT.561)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.59173,
      106.5214,
      17.59212,
      106.52171
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.561 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Nguyễn Văn Linh (ĐT.561)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.58747,
      106.52575,
      17.58864,
      106.53332
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.561 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Nguyễn Văn Linh (ĐT.561)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.58763,
      106.52576,
      17.58879,
      106.53327
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.561 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.58787,
      106.53218,
      17.60608,
      106.53363
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Hói (ĐT.561)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.58879,
      106.52549,
      17.58883,
      106.52576
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.561 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Hùng Vương (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.58717,
      106.53351,
      17.58787,
      106.53356
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường bộ ven biển Nam cầu Lý Hoà - Quang Phú",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.61438,
      106.52823,
      17.63223,
      106.548
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - 2 làn"
  },
  {
    "name": "Đường bộ ven biển Nam cầu Lý Hoà - Quang Phú",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.63181,
      106.52062,
      17.63947,
      106.52847
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - 2 làn"
  },
  {
    "name": "Đường bộ ven biển Nam cầu Roòn- Bắc Cầu Gianh",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.71004,
      106.44603,
      17.81677,
      106.48357
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - 2 làn"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.67112,
      106.48633,
      17.69295,
      106.50438
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Lý Hoà (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.63763,
      106.51918,
      17.63878,
      106.52005
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường bộ ven biển Nam cầu Lý Hoà - Quang Phú",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.63704,
      106.52048,
      17.6371,
      106.52062
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - 2 làn"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.63878,
      106.51398,
      17.65316,
      106.51918
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đèo Lý Hoà (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.65316,
      106.51169,
      17.6616,
      106.51398
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.6616,
      106.50472,
      17.67079,
      106.51169
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.67079,
      106.50438,
      17.67112,
      106.50472
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.69593,
      106.44036,
      17.70952,
      106.47552
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.71581,
      106.43885,
      17.75171,
      106.44436
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.69605,
      106.44125,
      17.7035,
      106.47557
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Gianh 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.70947,
      106.44139,
      17.71581,
      106.44377
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Gianh 2 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.70952,
      106.44125,
      17.71586,
      106.44363
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_divided",
    "speedLimit": 90,
    "bounds": [
      17.7035,
      106.44051,
      17.70947,
      106.44139
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.6931,
      106.47606,
      17.69593,
      106.48636
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.69579,
      106.47552,
      17.69593,
      106.47604
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường bộ ven biển Nam cầu Roòn- Bắc Cầu Gianh",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.71804,
      106.44565,
      17.71838,
      106.44656
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường bộ ven biển Nam cầu Roòn- Bắc Cầu Gianh",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.71788,
      106.44518,
      17.71804,
      106.44656
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.30673,
      106.66628,
      17.35101,
      106.67339
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B - 2 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.3416,
      106.60448,
      17.38771,
      106.62399
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.34164,
      106.60461,
      17.38777,
      106.62413
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.42013,
      106.56018,
      17.4268,
      106.57135
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.40555,
      106.57533,
      17.41759,
      106.5937
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.40564,
      106.57923,
      17.41534,
      106.59381
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.41534,
      106.57135,
      17.42013,
      106.57923
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.4185,
      106.57135,
      17.42013,
      106.57632
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.41759,
      106.57143,
      17.41991,
      106.57533
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.41682,
      106.57296,
      17.41837,
      106.57533
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.41666,
      106.57143,
      17.41991,
      106.57492
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.41968,
      106.57647,
      17.42558,
      106.59253
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.41534,
      106.57576,
      17.41968,
      106.57923
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.41824,
      106.5753,
      17.41975,
      106.57632
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường motorway_link",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.41746,
      106.57477,
      17.41824,
      106.5753
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 1 làn - Đường 1 chiều"
  },
  {
    "name": "Đường tránh Đồng Hới (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.40249,
      106.62614,
      17.43245,
      106.63681
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.39382,
      106.59415,
      17.40524,
      106.60107
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Quán Hàu - Vĩnh Ninh (ĐT.569B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.38355,
      106.61387,
      17.38724,
      106.61547
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: ĐT.569B"
  },
  {
    "name": "Cầu vượt Hồ Điều Gà (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.38771,
      106.60094,
      17.39377,
      106.60448
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Quán Hàu - Vĩnh Ninh (ĐT.569B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.38724,
      106.61547,
      17.38761,
      106.61563
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: ĐT.569B"
  },
  {
    "name": "Đường Quán Hàu - Vĩnh Ninh (ĐT.569B)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.38761,
      106.61563,
      17.40319,
      106.63725
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - Số hiệu: ĐT.569B"
  },
  {
    "name": "Cầu Quán Hàu (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.39643,
      106.63912,
      17.40006,
      106.64239
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Quán Hàu 2 (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.39633,
      106.639,
      17.39996,
      106.64227
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Vực Huý (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.40524,
      106.59381,
      17.40564,
      106.59415
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường tránh Đồng Hới (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.40169,
      106.63681,
      17.40249,
      106.63795
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường tránh Đồng Hới (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.40143,
      106.63681,
      17.40249,
      106.63779
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.40006,
      106.63838,
      17.40104,
      106.63912
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "urban_undivided",
    "speedLimit": 50,
    "bounds": [
      17.40104,
      106.63822,
      17.40151,
      106.63838
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (50 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Hùng Vương (QL.1)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.40104,
      106.63827,
      17.41741,
      106.64399
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.1 - Đường 1 chiều"
  },
  {
    "name": "Đường Hùng Vương (QL.1)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.40169,
      106.63795,
      17.41737,
      106.64383
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.1 - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.41737,
      106.63455,
      17.4354,
      106.64368
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Đường tránh lũ - QL.1",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.36658,
      106.65121,
      17.3922,
      106.68864
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.35405,
      106.67387,
      17.36564,
      106.67633
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B - 2 làn"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.35101,
      106.67339,
      17.35405,
      106.67387
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B - 2 làn"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.36595,
      106.67613,
      17.36719,
      106.68826
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B - 2 làn"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.36669,
      106.68856,
      17.36849,
      106.70014
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.36647,
      106.68826,
      17.36669,
      106.68856
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 9B (QL.9B)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.36843,
      106.70014,
      17.3755,
      106.72186
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.9B - 2 làn"
  },
  {
    "name": "Đường ven biển Hà Trung - Mạch Nước (ĐT.569)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.34282,
      106.71048,
      17.38496,
      106.74598
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.569 - 2 làn"
  },
  {
    "name": "Đường ven biển Hà Trung - Mạch Nước",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.41213,
      106.66074,
      17.43992,
      106.68458
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - 2 làn"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.38889,
      106.64803,
      17.39107,
      106.65053
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Đường tránh lũ - QL.1",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.38997,
      106.65039,
      17.39007,
      106.65121
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "urban_undivided",
    "speedLimit": 30,
    "bounds": [
      17.39096,
      106.64617,
      17.39241,
      106.64793
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (30 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.39251,
      106.64239,
      17.39643,
      106.64627
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Quốc lộ 1 (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.39241,
      106.64227,
      17.39633,
      106.64617
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 3 làn - Đường 1 chiều"
  },
  {
    "name": "Đường ven biển Hà Trung - Mạch Nước (ĐT.569)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.39961,
      106.68458,
      17.41213,
      106.69693
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.569 - 2 làn"
  },
  {
    "name": "Đường ven biển Hà Trung - Mạch Nước (ĐT.569)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.38496,
      106.70365,
      17.39125,
      106.71048
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.569 - 2 làn"
  },
  {
    "name": "Đường ven biển Hà Trung - Mạch Nước (ĐT.569)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.39125,
      106.69693,
      17.39961,
      106.70365
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: ĐT.569 - 2 làn"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.43317,
      106.53852,
      17.44315,
      106.55061
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường tránh Đồng Hới (QL.1)",
    "type": "rural_undivided",
    "speedLimit": 80,
    "bounds": [
      17.46013,
      106.56236,
      17.4951,
      106.59472
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (80 km/h) - Số hiệu: QL.1 - 2 làn"
  },
  {
    "name": "Đường Phan Đình Phùng mở rộng (QH) (QL.9E)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.46941,
      106.57457,
      17.4853,
      106.59448
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.9E - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường Phan Đình Phùng mở rộng (QH) (QL.9E)",
    "type": "urban_divided",
    "speedLimit": 60,
    "bounds": [
      17.46951,
      106.57458,
      17.4854,
      106.59459
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (60 km/h) - Số hiệu: QL.9E - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Cầu Phú Vinh 2 (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.42665,
      106.55888,
      17.42737,
      106.56009
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  },
  {
    "name": "Đường cao tốc Bùng - Vạn Ninh (CT.01;CT.02)",
    "type": "expressway",
    "speedLimit": 90,
    "bounds": [
      17.42751,
      106.55615,
      17.42931,
      106.55897
    ],
    "province": "Quảng Bình",
    "source": "OpenStreetMap",
    "description": "Dữ liệu OSM (90 km/h) - Số hiệu: CT.01;CT.02 - 2 làn - Đường 1 chiều"
  }
];

// Phân cấp ưu tiên: Biển đặc thù (70, 60) > Cao tốc (100, 120) > Đô thị > Quốc lộ ngoài đô thị
const TYPE_PRIORITY = {
  specific_limit: 1,
  expressway_high: 2,
  expressway: 2,
  urban_divided: 3,
  urban_undivided: 4,
  rural_divided: 5,
  rural_undivided: 6
};

// Sắp xếp ưu tiên: Loại đường ưu tiên cao lên trước, cùng loại thì diện tích hẹp lên trước
const SORTED_CORRIDORS = [...PREDEFINED_CORRIDORS].sort((a, b) => {
  const pA = TYPE_PRIORITY[a.type] || 10;
  const pB = TYPE_PRIORITY[b.type] || 10;
  if (pA !== pB) return pA - pB;

  const areaA = (a.bounds[2] - a.bounds[0]) * (a.bounds[3] - a.bounds[1]);
  const areaB = (b.bounds[2] - b.bounds[0]) * (b.bounds[3] - b.bounds[1]);
  return areaA - areaB;
});

class StandaloneSpeedEngine {
  constructor() {
    this.cache = new Map();
    this.audioCtx = null;
    this.synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    this.lastLookAheadTime = 0;
    this.audioUnlocked = false;
    this.lastCameraAlertId = null;
    this.lastCameraAlertTime = 0;
    this.corridors = null;
    this.vietmapApiKey = '273fdfe22a594029d71165bb3f672970532f97677b04d649';
    this.vietmapEnabled = true;
    this.vietmapCache = new Map();
    this.lastVietmapQueryCoord = null;
    this.lastVietmapQueryResult = null;
    this.lastVietmapQueryTime = 0;
    this.lastVietmapBoundary = null;
    this.hereApiKey = '';
    this.hereEnabled = true;
    this.hereCache = new Map();
    this.lastHereQueryCoord = null;
    this.lastHereQueryResult = null;
    this.lastHereQueryTime = 0;
    this.loadExternalCorridors();
  }

  /**
   * Tra cứu tên đường và giới hạn tốc độ chuẩn xác từ VIETMAP Maps API v4 (Client Standalone)
   */
  async queryVietmapSpeedLimit(lat, lon) {
    if (!this.vietmapEnabled || !this.vietmapApiKey) return null;

    const now = Date.now();
    // Bộ đệm khoảng cách: nếu xe di chuyển < 20m so với lần hỏi trước thì tái sử dụng kết quả
    if (this.lastVietmapQueryCoord && this.lastVietmapQueryResult && (now - this.lastVietmapQueryTime < 30000)) {
      const distM = this.haversine(lat, lon, this.lastVietmapQueryCoord.lat, this.lastVietmapQueryCoord.lon) * 1000;
      if (distM < 20) {
        return this.lastVietmapQueryResult;
      }
    }

    const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
    if (this.vietmapCache.has(cacheKey)) {
      const item = this.vietmapCache.get(cacheKey);
      if (now - item.time < 3600000) { // TTL 1 giờ
        if (item.data && item.data.boundary) {
          this.lastVietmapBoundary = item.data.boundary;
        }
        return item.data;
      }
    }

    try {
      const url = `https://maps.vietmap.vn/api/reverse/v4?apikey=${encodeURIComponent(this.vietmapApiKey)}&lat=${lat.toFixed(6)}&lng=${lon.toFixed(6)}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;

      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const best = data[0];
      const rawName = (best.name || '').trim();
      const display = (best.display || '').trim();
      const address = (best.address || '').trim();

      // Ranh giới hành chính từ boundaries
      const boundaries = Array.isArray(best.boundaries) ? best.boundaries : [];
      let wardName = '';
      let isWardPhuong = false;
      let provinceName = '';

      for (let i = 0; i < boundaries.length; i++) {
        const b = boundaries[i];
        const pfx = (b.prefix || '').trim().toLowerCase();
        const bName = (b.name || '').trim();
        const bNameLower = bName.toLowerCase();
        if (pfx === 'phường' || bNameLower.startsWith('phường')) {
          wardName = bNameLower.startsWith('phường') ? bName : (b.prefix ? `${b.prefix} ` : 'Phường ') + bName;
          isWardPhuong = true;
        } else if (pfx === 'xã' || bNameLower.startsWith('xã')) {
          wardName = bNameLower.startsWith('xã') ? bName : (b.prefix ? `${b.prefix} ` : 'Xã ') + bName;
          isWardPhuong = false;
        } else if (pfx === 'tỉnh' || pfx === 'thành phố' || b.type === 0) {
          provinceName = (b.prefix ? `${b.prefix} ` : '') + bName;
        }
      }

      const boundaryInfo = { wardName, isWardPhuong, provinceName };
      this.lastVietmapBoundary = boundaryInfo;

      // Xây dựng tên đường hiển thị (lọc bỏ Plus Code và mã vị trí vô danh)
      const isPlusCode = (s) => !s || s.includes('+') || /^[0-9A-Z]{4,8}\+/i.test(s);
      let roadName = rawName;
      if (isPlusCode(roadName)) roadName = '';

      if (!roadName && display) {
        const candidate = display.split(',')[0].trim();
        const candLower = candidate.toLowerCase();
        if (!isPlusCode(candidate) && !candLower.startsWith('xã ') && !candLower.startsWith('phường ') && !candLower.startsWith('thôn ') && !candLower.startsWith('bản ')) {
          roadName = candidate;
        }
      }
      if (!roadName && address) {
        const candidate = address.split(',')[0].trim();
        const candLower = candidate.toLowerCase();
        if (!isPlusCode(candidate) && !candLower.startsWith('xã ') && !candLower.startsWith('phường ') && !candLower.startsWith('thôn ') && !candLower.startsWith('bản ')) {
          roadName = candidate;
        }
      }

      if (roadName) {
        // Loại bỏ số nhà ở đầu (ví dụ: "125 Lê Duẩn" -> "Lê Duẩn")
        const m = roadName.match(/^\d+[\w\/-]*\s+(.*)$/);
        if (m && m[1]) roadName = m[1].trim();
      }

      // Nếu không có tên đường cụ thể từ Vietmap, nhường cho Waypoints Cao tốc / Quốc lộ / HERE API
      if (!roadName || roadName.toLowerCase() === 'unnamed road' || roadName.toLowerCase() === 'tuyến đường khu vực') {
        return null;
      }

      const nameLower = roadName.toLowerCase();
      let speedLimit = 50;
      let roadType = 'urban_undivided';
      let desc = '';

      const BOULEVARDS = [
        'hùng vương', 'lê duẩn', 'võ nguyên giáp', 'nguyễn huệ',
        'trần hưng đạo', 'phạm văn đồng', 'nguyễn tất thành',
        'quang trung', 'hoàng hoa thám', 'đại lộ', 'tôn đức thắng',
        'mai chí thọ', 'nguyễn văn linh', 'phạm hùng', 'lý thường kiệt',
        'điện biên phủ', 'trường chinh', 'bà triệu', 'lê lợi', 'hai bà trưng',
        'nguyễn trãi', 'trần phú', 'phan chu trinh', 'hà huy tập'
      ];

      if (nameLower.includes('cao tốc') || nameLower.includes('ct.') || nameLower.startsWith('ct')) {
        speedLimit = 100;
        roadType = 'expressway';
        desc = `Đường Cao tốc theo CSDL Vietmap (${roadName})`;
      } else if (nameLower.includes('quốc lộ') || nameLower.includes('ql.') || nameLower.startsWith('ql') || nameLower.includes('tuyến tránh') || nameLower.includes('đường tránh')) {
        if (isWardPhuong) {
          speedLimit = 60;
          roadType = 'urban_divided';
          desc = `Quốc lộ qua ${wardName || 'đô thị'} - Đường đôi (60 km/h TT31)`;
        } else {
          speedLimit = 90;
          roadType = 'rural_divided';
          desc = `Quốc lộ ngoài đô thị - Đường đôi dải phân cách giữa (90 km/h TT31)`;
        }
      } else if (nameLower.includes('đường tỉnh') || nameLower.includes('đt.') || nameLower.startsWith('đt')) {
        if (isWardPhuong) {
          speedLimit = 60;
          roadType = 'urban_divided';
          desc = `Đường tỉnh qua ${wardName || 'đô thị'} (60 km/h TT31)`;
        } else {
          speedLimit = 80;
          roadType = 'rural_undivided';
          desc = `Đường tỉnh ngoài đô thị (80 km/h TT31)`;
        }
      } else if (isWardPhuong) {
        const isAlley = /^(ngõ|hẻm|kiệt|ngách|đường gom)/i.test(roadName);
        const isBvd = !isAlley && BOULEVARDS.some(b => nameLower.includes(b));
        if (isBvd) {
          speedLimit = 60;
          roadType = 'urban_divided';
          desc = `Trục đường đôi chính đô thị (${wardName || 'Phường'}) - 60 km/h`;
        } else {
          speedLimit = 50;
          roadType = 'urban_undivided';
          desc = `Khu vực nội thị (${wardName || 'Phường'}) theo Thông tư 31`;
        }
      } else {
        speedLimit = 80;
        roadType = 'rural_undivided';
        desc = `Đường ngoài đô thị (${wardName || 'Khu dân cư xã'}) theo Thông tư 31`;
      }

      const displayFullName = wardName ? `${roadName} (${wardName})` : roadName;
      const result = {
        roadName: displayFullName,
        speedLimit: speedLimit,
        roadType: roadType,
        source: 'VIETMAP_Maps_API_v4',
        province: provinceName,
        ward: wardName,
        description: desc,
        boundary: boundaryInfo
      };

      this.vietmapCache.set(cacheKey, { time: now, data: result });
      this.lastVietmapQueryCoord = { lat, lon };
      this.lastVietmapQueryResult = result;
      this.lastVietmapQueryTime = now;
      return result;
    } catch (e) {
      // Offline fallback
    }
    return null;
  }

  /**
   * Tra cứu giới hạn tốc độ trực tiếp từ HERE Route Matching API v8 (Client Standalone)
   */
  async queryHereSpeedLimit(lat, lon) {
    if (!this.hereEnabled || !this.hereApiKey) return null;

    const now = Date.now();
    // Bộ đệm khoảng cách: nếu xe di chuyển < 20m so với lần hỏi trước thì tái sử dụng kết quả
    if (this.lastHereQueryCoord && this.lastHereQueryResult && (now - this.lastHereQueryTime < 30000)) {
      const distM = this.haversine(lat, lon, this.lastHereQueryCoord.lat, this.lastHereQueryCoord.lon) * 1000;
      if (distM < 20) {
        return this.lastHereQueryResult;
      }
    }

    const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
    if (this.hereCache.has(cacheKey)) {
      const item = this.hereCache.get(cacheKey);
      if (now - item.time < 3600000) { // TTL 1 giờ
        return item.data;
      }
    }

    try {
      const wp0 = `${lat.toFixed(6)},${lon.toFixed(6)}`;
      const wp1 = `${(lat + 0.00005).toFixed(6)},${(lon + 0.00005).toFixed(6)}`;
      const url = `https://routematching.hereapi.com/v8/match/routelinks?apiKey=${encodeURIComponent(this.hereApiKey)}&routeMatch=1&mode=fastest;car&attributes=SPEED_LIMITS_FCn(*),ROAD_GEOM_FCn(NAME)&waypoint0=${wp0}&waypoint1=${wp1}`;

      const resp = await fetch(url);
      if (!resp.ok) return null;

      const data = await resp.json();
      let links = [];
      if (data.response && data.response.route) {
        for (const r of data.response.route) {
          if (r.link) links.push(...r.link);
        }
      } else if (data.matchedRoute && data.matchedRoute.links) {
        links = data.matchedRoute.links;
      }

      if (links.length === 0) return null;
      const targetLink = links[0];
      const attrs = targetLink.attributes || {};

      let speedLimit = null;
      let roadName = '';

      for (const [k, v] of Object.entries(attrs)) {
        if (k.startsWith('SPEED_LIMITS_FC')) {
          const item = Array.isArray(v) ? v[0] : v;
          if (item) {
            const raw = item.FROM_REF_SPEED_LIMIT || item.TO_REF_SPEED_LIMIT || item.fromRefSpeedLimit || item.toRefSpeedLimit;
            const unit = item.SPEED_LIMIT_UNIT || item.unit || 'KPH';
            if (raw) {
              let val = parseFloat(raw);
              if (String(unit).toUpperCase() === 'MPH') val *= 1.60934;
              speedLimit = Math.round(val);
            }
          }
          break;
        }
      }

      for (const [k, v] of Object.entries(attrs)) {
        if (k.startsWith('ROAD_GEOM_FC')) {
          const item = Array.isArray(v) ? v[0] : v;
          if (item) roadName = item.NAME || item.name || '';
          break;
        }
      }

      if (speedLimit && speedLimit > 0) {
        const result = {
          roadName: roadName || 'Đoạn đường HERE Maps',
          speedLimit: speedLimit,
          roadType: 'here_speed_limit',
          source: 'HERE_Technologies_API',
          description: `Giới hạn tốc độ chính xác từ HERE Technologies (${speedLimit} km/h)`
        };
        this.hereCache.set(cacheKey, { time: now, data: result });
        this.lastHereQueryCoord = { lat, lon };
        this.lastHereQueryResult = result;
        this.lastHereQueryTime = now;
        return result;
      }
    } catch (e) {
      // Offline fallback
    }
    return null;
  }

  /**
   * Tự động nạp kho dữ liệu tốc độ mới nhất từ file JSON ngoại vi (nếu có)
   */
  async loadExternalCorridors() {
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const resp = await fetch('./vietnam_speed_limits.json');
        if (resp.ok) {
          const list = await resp.json();
          if (Array.isArray(list) && list.length > 0) {
            this.corridors = list.sort((a, b) => {
              const pA = TYPE_PRIORITY[a.type] || 10;
              const pB = TYPE_PRIORITY[b.type] || 10;
              if (pA !== pB) return pA - pB;
              const areaA = (a.bounds[2] - a.bounds[0]) * (a.bounds[3] - a.bounds[1]);
              const areaB = (b.bounds[2] - b.bounds[0]) * (b.bounds[3] - b.bounds[1]);
              return areaA - areaB;
            });
            console.log(`[SpeedEngine] Tải thành công ${list.length} hành lang tốc độ từ vietnam_speed_limits.json`);
          }
        }
      } catch (e) {
        // Fallback về PREDEFINED_CORRIDORS mặc định
      }
    }
  }

  /**
   * Quản lý Biển Báo Ghim Tùy Biến 1 Chạm (Crowdsource / Custom User Pins)
   */
  getCustomSigns() {
    try {
      return JSON.parse(localStorage.getItem('csg_custom_signs') || '[]');
    } catch (e) {
      return [];
    }
  }

  addCustomSign(lat, lon, speedLimit, note = '') {
    const signs = this.getCustomSigns();
    const newSign = {
      id: Date.now(),
      latitude: lat,
      longitude: lon,
      speedLimit: parseInt(speedLimit, 10),
      note: note || '',
      createdAt: new Date().toISOString()
    };
    signs.unshift(newSign);
    localStorage.setItem('csg_custom_signs', JSON.stringify(signs));
    this.cache.clear(); // Xóa cache để cập nhật ngay
    return newSign;
  }

  deleteCustomSign(signId) {
    let signs = this.getCustomSigns();
    signs = signs.filter(s => s.id !== signId);
    localStorage.setItem('csg_custom_signs', JSON.stringify(signs));
    this.cache.clear();
  }

  /**
   * Quản lý Camera Phạt Nguội Tùy Biến 1 Chạm (User Pinned Cameras)
   */
  getCustomCameras() {
    try {
      return JSON.parse(localStorage.getItem('csg_custom_cameras') || '[]');
    } catch (e) {
      return [];
    }
  }

  addCustomCamera(lat, lon, speedLimit, type = 'speed_camera', name = '') {
    const cams = this.getCustomCameras();
    const newCam = {
      id: 'user_cam_' + Date.now(),
      lat: lat,
      lon: lon,
      speedLimit: speedLimit ? parseInt(speedLimit, 10) : null,
      type: type,
      name: name || (type === 'red_light_camera' ? 'Camera phạt nguội vượt đèn đỏ' : `Camera bắn ${speedLimit || 60} km/h`),
      source: 'user_pinned',
      createdAt: new Date().toISOString()
    };
    cams.unshift(newCam);
    localStorage.setItem('csg_custom_cameras', JSON.stringify(cams));
    return newCam;
  }

  deleteCustomCamera(camId) {
    let cams = this.getCustomCameras();
    cams = cams.filter(c => c.id !== camId);
    localStorage.setItem('csg_custom_cameras', JSON.stringify(cams));
  }

  getAllCameras() {
    const builtin = (typeof VIETNAM_SPEED_CAMERAS !== 'undefined') ? VIETNAM_SPEED_CAMERAS : [];
    const custom = this.getCustomCameras();
    return [...custom, ...builtin];
  }

  /**
   * Quét camera phạt nguội / bắn tốc độ phía trước trong cự ly 550m
   */
  checkNearbyCamera(currentSpeed, lat, lon) {
    const allCams = this.getAllCameras();
    if (!allCams || allCams.length === 0) return null;

    let nearest = null;
    let minDistanceKm = 999;

    for (let i = 0; i < allCams.length; i++) {
      const cam = allCams[i];
      if (Math.abs(lat - cam.lat) > 0.015 || Math.abs(lon - cam.lon) > 0.015) continue;

      const dist = this.haversine(lat, lon, cam.lat, cam.lon);
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
        nearest = cam;
      }
    }

    if (nearest && minDistanceKm <= 0.55) { // 550m
      const distM = Math.round(minDistanceKm * 1000);
      const now = Date.now();
      
      let shouldVoiceAlert = false;
      if (this.lastCameraAlertId !== nearest.id || (now - this.lastCameraAlertTime > 25000)) {
        shouldVoiceAlert = true;
        this.lastCameraAlertId = nearest.id;
        this.lastCameraAlertTime = now;
      }

      let voiceMsg = '';
      if (nearest.type === 'red_light_camera') {
        voiceMsg = `Chú ý! Phía trước ${distM} mét có camera phạt nguội vượt đèn đỏ!`;
      } else if (nearest.speedLimit) {
        voiceMsg = `Chú ý! Phía trước ${distM} mét có camera phạt nguội bắn tốc độ, giới hạn ${nearest.speedLimit} km/h!`;
      } else {
        voiceMsg = `Chú ý! Phía trước ${distM} mét có camera phạt nguội giám sát giao thông!`;
      }

      return {
        camera: nearest,
        distanceM: distM,
        shouldVoiceAlert: shouldVoiceAlert,
        voiceMessage: voiceMsg
      };
    }
    return null;
  }

  /**
   * Mở khóa phần cứng âm thanh trên iOS Safari (Audio Autoplay Policy)
   */
  unlockAudioIOS() {
    if (this.audioUnlocked) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Phát xung âm siêu ngắn không làm phiền để mở cổng loa phần cứng
      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        gain.gain.value = 0.001;
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.02);
      }

      // Mở khóa SpeechSynthesis trên iOS
      if (this.synth) {
        this.synth.resume();
        const dummy = new SpeechSynthesisUtterance(' ');
        dummy.volume = 0.01;
        this.synth.speak(dummy);
      }

      this.audioUnlocked = true;
      console.log('Audio hardware unlocked successfully for iOS/Android!');
    } catch (e) {
      console.warn('Audio unlock error:', e);
    }
  }

  /**
   * Tính khoảng cách Haversine giữa 2 tọa độ (km)
   */
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180.0;
    const dLon = (lon2 - lon1) * Math.PI / 180.0;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180.0) * Math.cos(lat2 * Math.PI / 180.0) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Tính khoảng cách vuông góc từ điểm P(lat, lon) đến đoạn thẳng nối 2 điểm A và B (km)
   */
  pointToSegmentDistanceKm(pLat, pLon, aLat, aLon, bLat, bLon) {
    const latRad = ((aLat + bLat) / 2.0) * Math.PI / 180.0;
    const cosLat = Math.cos(latRad);
    const kx = 111.32 * cosLat;
    const ky = 111.32;

    const px = (pLon - aLon) * kx;
    const py = (pLat - aLat) * ky;

    const bx = (bLon - aLon) * kx;
    const by = (bLat - aLat) * ky;

    const segLenSq = bx * bx + by * by;
    if (segLenSq < 1e-8) {
      return Math.sqrt(px * px + py * py);
    }

    const t = Math.max(0, Math.min(1, (px * bx + py * by) / segLenSq));
    const projX = t * bx;
    const projY = t * by;

    const dx = px - projX;
    const dy = py - projY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Tính khoảng cách từ điểm GPS tới chuỗi tọa độ tim đường (Waypoints Polyline)
   */
  pointToPolylineDistanceKm(pLat, pLon, waypoints) {
    if (!waypoints || waypoints.length < 2) return 999;
    let minDist = 999;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const d = this.pointToSegmentDistanceKm(pLat, pLon, a[0], a[1], b[0], b[1]);
      if (d < minDist) {
        minDist = d;
      }
    }
    return minDist;
  }

  /**
   * Cảnh báo sớm từ xa 250m trước khi vào khu vực giảm tốc độ
   */
  checkLookAheadAlert(currentSpeed, lat, lon) {
    const now = Date.now();
    if (now - this.lastLookAheadTime < 15000) return null; // Giãn cách 15s

    if (currentSpeed < 55) return null;

    for (let i = 0; i < SORTED_CORRIDORS.length; i++) {
      const c = SORTED_CORRIDORS[i];
      if (c.speedLimit <= 50) {
        const [minLat, minLon, maxLat, maxLon] = c.bounds;
        const latBuffer = 0.0025; // ~270m
        const lonBuffer = 0.0025;
        const isNearBoundary = (
          (lat >= minLat - latBuffer && lat <= maxLat + latBuffer) &&
          (lon >= minLon - lonBuffer && lon <= maxLon + lonBuffer)
        );
        const isAlreadyInside = (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon);

        if (isNearBoundary && !isAlreadyInside) {
          this.lastLookAheadTime = now;
          return {
            message: `Chú ý! Phía trước 250 mét là khu đông dân cư, giảm tốc độ về 50 km/h!`,
            targetSpeed: 50
          };
        }
      }
    }
    return null;
  }

  /**
   * Tra cứu giới hạn tốc độ tức thì (0ms) từ tọa độ GPS thời gian thực
   */
  /**
   * Tra cứu giới hạn tốc độ tức thì (0ms) từ tọa độ GPS thời gian thực
   * Thứ tự ưu tiên chuẩn (Spatial Priority Hierarchy):
   * 1. Biển ghim của tài xế (bán kính 250m)
   * 2. Biển hạn chế đặc thù (70, 60 km/h)
   * 3. Tim đường Waypoints Polyline (Cao tốc 100-120, Tuyến tránh 80, QL1A 90 bám tim <= 450m;
   *    kèm bộ lọc hạ về 60 km/h khi Quốc lộ chạy xuyên qua ranh giới nội thị theo TT 31)
   * 4. Các tuyến đường cụ thể từ OpenStreetMap (Đường tỉnh ĐT, trục đường có thẻ maxspeed rõ ràng)
   * 5. Ranh giới nội thị & khu đông dân cư diện rộng (50 km/h Thông tư 31)
   * 6. Bounding box Quốc lộ liên tỉnh ngoài đô thị
   * 7. Fallback an toàn (50 km/h)
   */
  async getRoadSpeedInfo(lat, lon) {
    const key = lat.toFixed(4) + '_' + lon.toFixed(4);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const corridors = this.corridors || SORTED_CORRIDORS;

    // 1. ƯU TIÊN SỐ 1: Kiểm tra Biển báo do tài xế tự ghim 1 chạm trong bán kính 250m
    const customSigns = this.getCustomSigns();
    for (let i = 0; i < customSigns.length; i++) {
      const sign = customSigns[i];
      const dist = this.haversine(lat, lon, sign.latitude, sign.longitude);
      if (dist <= 0.25) { // 250m
        const res = {
          roadName: `Biển ghim ${sign.speedLimit} km/h` + (sign.note ? ` (${sign.note})` : ''),
          speedLimit: sign.speedLimit,
          roadType: 'user_custom_pinned',
          source: 'custom_user_pin',
          distanceM: Math.round(dist * 1000),
          description: 'Biển báo tốc độ do tài xế tự ghim 1 chạm'
        };
        this.cache.set(key, res);
        return res;
      }
    }

    // 2. ƯU TIÊN SỐ 2: Kiểm tra các đoạn cắm biển tốc độ đặc thù (70, 60 km/h, trạm thu phí, đèo dốc)
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if (c.type === 'specific_limit') {
        let isMatch = false;
        let distM = 0;

        if (c.waypoints && c.waypoints.length >= 2) {
          const dKm = this.pointToPolylineDistanceKm(lat, lon, c.waypoints);
          if (dKm <= 0.25) { // Trong vòng 250m từ tim đoạn đặc thù
            isMatch = true;
            distM = Math.round(dKm * 1000);
          }
        } else {
          const [minLat, minLon, maxLat, maxLon] = c.bounds;
          if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
            isMatch = true;
          }
        }

        if (isMatch) {
          const res = {
            roadName: c.name,
            speedLimit: c.speedLimit,
            roadType: c.type,
            source: 'specific_sign_corridor',
            province: c.province,
            distanceM: distM,
            description: c.description
          };
          this.cache.set(key, res);
          return res;
        }
      }
    }

    // 3. ƯU TIÊN SỐ 3: Kiểm tra tim đường CAO TỐC Waypoints (Expressway centerline <= 450m -> 100 - 120 km/h)
    // Đặt trước API để bảo vệ tuyệt đối hành lang cao tốc khi Vietmap chỉ trả về Plus code hoặc tên xã
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if ((c.type === 'expressway' || c.type === 'expressway_high') && c.waypoints && c.waypoints.length >= 2) {
        const distKm = this.pointToPolylineDistanceKm(lat, lon, c.waypoints);
        const maxThresholdKm = 0.45; // 450m
        if (distKm <= maxThresholdKm) {
          const res = {
            roadName: c.name,
            speedLimit: c.speedLimit,
            roadType: c.type,
            source: 'expressway_waypoint_matching',
            province: c.province,
            distanceM: Math.round(distKm * 1000),
            description: `${c.description} (Khớp tim đường cự ly ${Math.round(distKm * 1000)}m)`
          };
          this.cache.set(key, res);
          return res;
        }
      }
    }

    // 4. ƯU TIÊN SỐ 4: Tra cứu trực tuyến từ VIETMAP Maps API v4 (Bản Quyền Việt Nam)
    if (this.vietmapEnabled && this.vietmapApiKey) {
      const vmRes = await this.queryVietmapSpeedLimit(lat, lon);
      if (vmRes && vmRes.speedLimit) {
        this.cache.set(key, vmRes);
        return vmRes;
      }
    }

    // 5. ƯU TIÊN SỐ 5: Tra cứu trực tuyến từ HERE Technologies Speed Limits API
    if (this.hereEnabled && this.hereApiKey) {
      const hereRes = await this.queryHereSpeedLimit(lat, lon);
      if (hereRes && hereRes.speedLimit) {
        this.cache.set(key, hereRes);
        return hereRes;
      }
    }

    // 6. ƯU TIÊN SỐ 6: Kiểm tra tim đường Waypoints (Tuyến tránh & Quốc lộ ngoài đô thị <= 450m)
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if (c.type !== 'expressway' && c.type !== 'expressway_high' && c.waypoints && c.waypoints.length >= 2) {
        const distKm = this.pointToPolylineDistanceKm(lat, lon, c.waypoints);
        const maxThresholdKm = 0.45; // 450m
        if (distKm <= maxThresholdKm) {
          let speed = c.speedLimit;
          let desc = `${c.description} (Khớp tim đường cự ly ${Math.round(distKm * 1000)}m)`;

          // Nếu là Quốc lộ ngoài đô thị nhưng chạy qua ranh giới Phường nội thị, hạ về 60 km/h (đường đôi) hoặc 50 km/h theo TT 31
          const isPhuongBoundary = this.lastVietmapBoundary && this.lastVietmapBoundary.isWardPhuong;
          if (c.type === 'rural_divided' || c.type === 'rural_undivided') {
            if (isPhuongBoundary) {
              speed = (c.type === 'rural_divided') ? 60 : 50;
              desc += ` (Đoạn qua ${this.lastVietmapBoundary.wardName || 'đô thị'} hạ về ${speed} km/h theo Thông tư 31)`;
            } else {
              for (let j = 0; j < corridors.length; j++) {
                const u = corridors[j];
                if ((u.type === 'urban_undivided' || u.type === 'urban_divided') && u.source !== 'OpenStreetMap') {
                  const [uMinLat, uMinLon, uMaxLat, uMaxLon] = u.bounds;
                  if (lat >= uMinLat && lat <= uMaxLat && lon >= uMinLon && lon <= uMaxLon) {
                    speed = (c.type === 'rural_divided') ? 60 : 50;
                    desc += ` (Đoạn qua ${u.name} hạ về ${speed} km/h theo Thông tư 31)`;
                    break;
                  }
                }
              }
            }
          }

          const res = {
            roadName: c.name,
            speedLimit: speed,
            roadType: c.type,
            source: 'centerline_waypoint_matching',
            province: c.province,
            distanceM: Math.round(distKm * 1000),
            description: desc
          };
          this.cache.set(key, res);
          return res;
        }
      }
    }

    // 7. ƯU TIÊN SỐ 7: Kiểm tra các tuyến đường cụ thể từ OpenStreetMap (Đường tỉnh ĐT, trục đường có maxspeed)
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if (c.source === 'OpenStreetMap') {
        const [minLat, minLon, maxLat, maxLon] = c.bounds;
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
          const res = {
            roadName: c.name,
            speedLimit: c.speedLimit,
            roadType: c.type || 'urban_divided',
            source: 'OpenStreetMap',
            province: c.province,
            description: c.description
          };
          this.cache.set(key, res);
          return res;
        }
      }
    }

    // 8. ƯU TIÊN SỐ 8: Kiểm tra khu vực nội thị & khu đông dân cư diện rộng (50 km/h Thông tư 31)
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if ((c.type === 'urban_undivided' || c.type === 'urban_divided') && c.source !== 'OpenStreetMap') {
        const [minLat, minLon, maxLat, maxLon] = c.bounds;
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
          const res = {
            roadName: c.name,
            speedLimit: c.speedLimit,
            roadType: c.type,
            source: 'urban_zone_50',
            province: c.province,
            description: c.description
          };
          this.cache.set(key, res);
          return res;
        }
      }
    }

    // 9. ƯU TIÊN SỐ 9: Kiểm tra Bounding Box rộng của các tuyến Quốc lộ chưa có tim đường Waypoints
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if ((!c.waypoints || c.waypoints.length === 0) && c.source !== 'OpenStreetMap' && c.type !== 'urban_undivided' && c.type !== 'urban_divided') {
        const [minLat, minLon, maxLat, maxLon] = c.bounds;
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
          const res = {
            roadName: c.name,
            speedLimit: c.speedLimit,
            roadType: c.type,
            source: 'national_corridor_bounds',
            province: c.province,
            description: c.description
          };
          this.cache.set(key, res);
          return res;
        }
      }
    }

    // 10. ƯU TIÊN SỐ 10: Fallback theo ranh giới hành chính Xã (80 km/h) / Phường (50 km/h) hoặc mặc định
    if (this.lastVietmapBoundary) {
      const isPhuong = this.lastVietmapBoundary.isWardPhuong;
      const wName = this.lastVietmapBoundary.wardName;
      const fallback = {
        roadName: wName ? `Đường khu vực ${wName}` : (isPhuong ? 'Đoạn đường tiêu chuẩn (Khu dân cư)' : 'Đường ngoài đô thị (Xã)'),
        speedLimit: isPhuong ? 50 : 80,
        roadType: isPhuong ? 'urban_undivided' : 'rural_undivided',
        source: 'vietmap_boundary_fallback',
        description: isPhuong
          ? `Giới hạn an toàn khu vực nội thị (${wName || 'Phường'}) theo Thông tư 31/2019/TT-BGTVT (50 km/h)`
          : `Giới hạn an toàn đường ngoài khu đông dân cư (${wName || 'Xã'}) theo Thông tư 31/2019/TT-BGTVT (80 km/h)`
      };
      this.cache.set(key, fallback);
      return fallback;
    }

    const fallback = {
      roadName: 'Đoạn đường tiêu chuẩn (Khu dân cư)',
      speedLimit: 50,
      roadType: 'urban_undivided',
      source: 'default_fallback',
      description: 'Giới hạn an toàn khu vực thông thường theo Thông tư 31/2019/TT-BGTVT'
    };
    this.cache.set(key, fallback);
    return fallback;
  }

  playBeepAlert(freq = 950, duration = 0.35) {
    if (typeof window === 'undefined') return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.frequency.exponentialRampToValueAtTime(1400, now + duration * 0.5);
      osc1.frequency.exponentialRampToValueAtTime(freq, now + duration);

      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn('Lỗi còi báo động:', e);
    }
  }

  /**
   * Phát giọng nói tiếng Việt to rõ
   */
  speakVietnamese(text, minIntervalMs = 3500) {
    if (!this.synth) return;
    const now = Date.now();
    if (this.lastSpokenText === text && now - this.lastSpokenTime < minIntervalMs) {
      return;
    }

    try {
      this.synth.resume();
      this.synth.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      utter.rate = 1.05;
      utter.pitch = 1.0;
      utter.volume = 1.0;

      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN') || v.lang.includes('vi-VN'));
        if (viVoice) utter.voice = viVoice;
      }

      this.synth.speak(utter);
      this.lastSpokenText = text;
      this.lastSpokenTime = now;
    } catch (e) {
      console.warn('Lỗi phát giọng nói:', e);
    }
  }
}

if (typeof window !== 'undefined') {
  window.speedEngine = new StandaloneSpeedEngine();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StandaloneSpeedEngine, PREDEFINED_CORRIDORS, SPEED_STANDARDS };
}
