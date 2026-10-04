/**
 * CAR SPEED GUARD-XIP - MOBILE SPEED ENGINE
 * Tác giả: Lê Viết Dũng | SĐT: 0983890250 | Email: Dungxip2008@gmail.com
 * Nhận diện giới hạn tốc độ và cảnh báo âm thanh độc lập 100% trên thiết bị di động.
 * Chuẩn quy định đường bộ Việt Nam (Thông tư 31/2019/TT-BGTVT).
 */

const SPEED_STANDARDS = {
  expressway: 100,      // Cao tốc (100 - 120 km/h)
  expressway_high: 120, // Cao tốc tiêu chuẩn cao
  rural_divided: 90,    // Ngoài đô thị, đường đôi có dải phân cách giữa
  rural_undivided: 80,  // Ngoài đô thị, đường 2 chiều
  urban_divided: 60,    // Trong đô thị, đường đôi
  urban_undivided: 50   // Trong đô thị, đường 2 chiều
};

// Kho dữ liệu các hành lang đường bộ trọng điểm tại Việt Nam (Offline Geo Corridors)
const PREDEFINED_CORRIDORS = [
  // 1. Các Trung tâm Đô thị & Khu đông dân cư (50 - 60 km/h)
  {
    name: 'Đô thị TP. Đông Hà (Quảng Trị)',
    type: 'urban_divided',
    speedLimit: 60,
    bounds: [16.78, 107.06, 16.85, 107.12],
    description: 'Đường nội thị TP Đông Hà (Hùng Vương, Lê Duẩn)'
  },
  {
    name: 'Nội đô TP. Hà Nội',
    type: 'urban_divided',
    speedLimit: 60,
    bounds: [20.95, 105.75, 21.10, 105.90],
    description: 'Khu vực đô thị trung tâm Hà Nội'
  },
  {
    name: 'Nội đô TP. Đà Nẵng',
    type: 'urban_divided',
    speedLimit: 60,
    bounds: [15.98, 108.15, 16.12, 108.28],
    description: 'Khu vực trung tâm Đà Nẵng'
  },
  {
    name: 'Nội đô TP. Hồ Chí Minh',
    type: 'urban_undivided',
    speedLimit: 50,
    bounds: [10.70, 106.60, 10.85, 106.75],
    description: 'Khu vực trung tâm TP.HCM'
  },

  // 2. Các tuyến Cao Tốc (100 - 120 km/h)
  {
    name: 'Cao tốc Cam Lộ - La Sơn',
    type: 'expressway',
    speedLimit: 100,
    bounds: [16.25, 107.30, 16.60, 107.65],
    description: 'Cao tốc Bắc - Nam nhánh Cam Lộ - La Sơn'
  },
  {
    name: 'Cao tốc Pháp Vân - Cầu Giẽ - Ninh Bình',
    type: 'expressway_high',
    speedLimit: 120,
    bounds: [20.25, 105.80, 20.95, 106.00],
    description: 'Cao tốc cửa ngõ phía Nam Hà Nội'
  },
  {
    name: 'Cao tốc Đà Nẵng - Quảng Ngãi',
    type: 'expressway_high',
    speedLimit: 120,
    bounds: [15.10, 108.50, 16.05, 108.90],
    description: 'Cao tốc liên vùng Duyên hải miền Trung'
  },
  {
    name: 'Cao tốc Long Thành - Dầu Giây',
    type: 'expressway_high',
    speedLimit: 120,
    bounds: [10.75, 106.75, 10.95, 107.25],
    description: 'Cao tốc TP.HCM - Dầu Giây'
  },

  // 3. Quốc lộ 1A và các Quốc lộ trọng điểm (80 - 90 km/h)
  {
    name: 'Quốc lộ 1A (Đoạn qua Quảng Trị)',
    type: 'rural_divided',
    speedLimit: 90,
    bounds: [16.65, 107.13, 16.95, 107.25],
    description: 'QL1A đường đôi có dải phân cách giữa'
  },
  {
    name: 'Quốc lộ 9 (Hành lang kinh tế Đông - Tây)',
    type: 'rural_undivided',
    speedLimit: 80,
    bounds: [16.60, 106.50, 16.85, 107.05],
    description: 'QL9 Đông Hà - Lao Bảo'
  }
];

class StandaloneSpeedEngine {
  constructor() {
    this.cache = new Map();
    this.audioCtx = null;
    this.synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
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
   * Tra cứu giới hạn tốc độ và tên đường từ tọa độ GPS
   */
  async getRoadSpeedInfo(lat, lon) {
    const key = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // 1. Kiểm tra kho dữ liệu hành lang ngoại tuyến (ưu tiên cao nhất)
    for (let i = 0; i < PREDEFINED_CORRIDORS.length; i++) {
      const c = PREDEFINED_CORRIDORS[i];
      const minLat = c.bounds[0];
      const minLon = c.bounds[1];
      const maxLat = c.bounds[2];
      const maxLon = c.bounds[3];
      if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
        const res = {
          roadName: c.name,
          speedLimit: c.speedLimit,
          roadType: c.type,
          source: 'local_corridor_db',
          description: c.description
        };
        this.cache.set(key, res);
        return res;
      }
    }

    // 2. Thử truy vấn OpenStreetMap qua Internet nếu online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          const addr = data.address || {};
          const roadName = addr.road || addr.suburb || addr.city_district || 'Tuyến đường không tên';
          const roadType = data.type || 'road';
          const speedLimit = this.inferOsmSpeed(roadType, addr);

          const res = {
            roadName: roadName,
            speedLimit: speedLimit,
            roadType: roadType,
            source: 'online_osm',
            description: 'Đoạn đường xác định qua bản đồ OpenStreetMap'
          };
          this.cache.set(key, res);
          return res;
        }
      } catch (err) {
        // Fallback khi mất mạng hoặc timeout
      }
    }

    // 3. Fallback mặc định an toàn cho đường bộ VN
    const fallback = {
      roadName: 'Đoạn đường tiêu chuẩn',
      speedLimit: 60,
      roadType: 'standard_road',
      source: 'default_fallback',
      description: 'Giới hạn tiêu chuẩn khu vực thông thường'
    };
    this.cache.set(key, fallback);
    return fallback;
  }

  inferOsmSpeed(type, addr) {
    const t = (type || '').toLowerCase();
    if (t.includes('motorway')) return 100;
    if (t.includes('trunk')) return 90;
    if (t.includes('primary') || t.includes('secondary')) {
      return (addr.city || addr.town) ? 60 : 80;
    }
    if (t.includes('residential') || t.includes('living_street')) {
      return 50;
    }
    return 60;
  }

  playBeepAlert(freq = 880, duration = 0.3) {
    if (typeof window === 'undefined') return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Lỗi phát còi bíp:', e);
    }
  }

  speakVietnamese(text, minIntervalMs = 4000) {
    if (!this.synth) return;
    const now = Date.now();
    if (this.lastSpokenText === text && now - this.lastSpokenTime < minIntervalMs) {
      return;
    }
    try {
      this.synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      utter.rate = 1.05;
      utter.pitch = 1.0;

      const voices = this.synth.getVoices();
      const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN'));
      if (viVoice) utter.voice = viVoice;

      this.synth.speak(utter);
      this.lastSpokenText = text;
      this.lastSpokenTime = now;
    } catch (e) {
      console.warn('Lỗi đọc cảnh báo:', e);
    }
  }
}

if (typeof window !== 'undefined') {
  window.speedEngine = new StandaloneSpeedEngine();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StandaloneSpeedEngine, PREDEFINED_CORRIDORS, SPEED_STANDARDS };
}
