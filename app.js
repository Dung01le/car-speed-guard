// ==============================================================================
// CAR SPEED GUARD-XIP - MOBILE STANDALONE APP
// Tác giả: Lê Viết Dũng | SĐT: 0983890250 | Email: Dungxip2008@gmail.com
// Chạy 100% độc lập không cần server Python, nhận diện GPS thời gian thực.
// ==============================================================================

(function () {
  'use strict';

  // State Management
  const state = {
    currentSpeed: 0,
    speedLimit: 60,
    warningBuffer: 5,
    voiceAlertEnabled: true,
    beepAlertEnabled: true,
    hudMode: false,
    highAccuracy: true,
    isAutoSpeedLimit: true,
    detectedRoadName: '',
    lastRoadQueryTime: 0,
    
    // GPS & Tracking
    watchId: null,
    lastPosition: null,
    lastPositionTime: null,
    isGpsActive: false,

    // Trip Metrics
    isTripActive: false,
    tripId: null,
    tripStartTime: null,
    tripTimerInterval: null,
    tripDurationSec: 0,
    tripDistanceKm: 0.0,
    tripMaxSpeed: 0.0,
    speedSamples: [],
    violationsCount: 0,
    lastViolationLogTime: 0,

    // Audio & Speech
    lastVoiceAlertTime: 0,

    // Live Map Tracking
    leafletMap: null,
    carMarker: null,
    routePolyline: null,
    currentTileLayer: null,
    currentMapSource: 'google_roadmap',
    mapFollowCar: true,
    mapExpanded: false
  };

  // DOM Elements
  const el = {
    currentTime: document.getElementById('currentTime'),
    gpsBadge: document.getElementById('gpsBadge'),
    btnHud: document.getElementById('btnHud'),
    btnSound: document.getElementById('btnSound'),
    btnSettings: document.getElementById('btnSettings'),
    btnModeAuto: document.getElementById('btnModeAuto'),
    detectedRoadName: document.getElementById('detectedRoadName'),
    btnMapFollow: document.getElementById('btnMapFollow'),
    btnMapExpand: document.getElementById('btnMapExpand'),
    mapSourceSelect: document.getElementById('mapSourceSelect'),
    carLiveMap: document.getElementById('carLiveMap'),
    mapRoadBadge: document.getElementById('mapRoadBadge'),
    mapCoordsBadge: document.getElementById('mapCoordsBadge'),
    currentSpeed: document.getElementById('currentSpeed'),
    speedStatusText: document.getElementById('speedStatusText'),
    gaugeProgress: document.getElementById('gaugeProgress'),
    vietnamSign: document.getElementById('vietnamSign'),
    speedLimitValue: document.getElementById('speedLimitValue'),
    geoLat: document.getElementById('geoLat'),
    geoLng: document.getElementById('geoLng'),
    geoAlt: document.getElementById('geoAlt'),
    alertOverlay: document.getElementById('overspeedAlertOverlay'),

    // Trip
    btnTripControl: document.getElementById('btnTripControl'),
    btnViewHistory: document.getElementById('btnViewHistory'),
    tripDistance: document.getElementById('tripDistance'),
    tripMaxSpeed: document.getElementById('tripMaxSpeed'),
    tripAvgSpeed: document.getElementById('tripAvgSpeed'),
    tripDuration: document.getElementById('tripDuration'),
    tripViolations: document.getElementById('tripViolations'),

    // Modals
    historyModal: document.getElementById('historyModal'),
    btnCloseHistory: document.getElementById('btnCloseHistory'),
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    settingWarningBuffer: document.getElementById('settingWarningBuffer'),
    settingVoiceAlert: document.getElementById('settingVoiceAlert'),
    settingBeepAlert: document.getElementById('settingBeepAlert'),
    settingHighAccuracy: document.getElementById('settingHighAccuracy'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    violationsTableBody: document.getElementById('violationsTableBody'),
    tripsTableBody: document.getElementById('tripsTableBody'),

    // Mobile App Prompt & Guide
    mobileAppPromptBanner: document.getElementById('mobileAppPromptBanner'),
    btnActivateApp: document.getElementById('btnActivateApp'),
    btnDismissPrompt: document.getElementById('btnDismissPrompt'),
    installGuideModal: document.getElementById('installGuideModal'),
    btnCloseInstallGuide: document.getElementById('btnCloseInstallGuide'),
    btnNativeInstallPrompt: document.getElementById('btnNativeInstallPrompt')
  };

  // Clock Update
  function updateClock() {
    const now = new Date();
    el.currentTime.textContent = now.toTimeString().split(' ')[0];
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Screen Wake Lock (Chống tắt màn hình khi đang lái xe)
  async function requestScreenWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        await navigator.wakeLock.request('screen');
      } catch (e) {
        console.log('WakeLock not granted:', e);
      }
    }
  }
  requestScreenWakeLock();

  // Local Storage Helpers
  function getLocalTrips() {
    try {
      return JSON.parse(localStorage.getItem('csg_trips') || '[]');
    } catch (e) { return []; }
  }

  function saveLocalTrip(trip) {
    const trips = getLocalTrips();
    trips.unshift(trip);
    if (trips.length > 50) trips.pop();
    localStorage.setItem('csg_trips', JSON.stringify(trips));
  }

  function getLocalViolations() {
    try {
      return JSON.parse(localStorage.getItem('csg_violations') || '[]');
    } catch (e) { return []; }
  }

  function saveLocalViolation(v) {
    const list = getLocalViolations();
    list.unshift(v);
    if (list.length > 100) list.pop();
    localStorage.setItem('csg_violations', JSON.stringify(list));
  }

  // Audio & Speech synthesizers
  function playAlertBeep() {
    if (!state.beepAlertEnabled || !window.speedEngine) return;
    window.speedEngine.playBeepAlert(950, 0.25);
  }

  function speakWarning(text) {
    if (!state.voiceAlertEnabled || !window.speedEngine) return;
    window.speedEngine.speakVietnamese(text);
  }

  // Haversine Distance (km)
  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (window.speedEngine) {
      return window.speedEngine.haversine(lat1, lon1, lat2, lon2);
    }
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Update Speed Gauge & Alert Thresholds
  function updateSpeedDisplay(speed) {
    state.currentSpeed = Math.max(0, Math.round(speed));
    el.currentSpeed.textContent = state.currentSpeed;

    const maxGaugeSpeed = 160;
    const circumference = 534.07;
    const progress = Math.min(state.currentSpeed / maxGaugeSpeed, 1);
    const offset = circumference - (progress * circumference);
    el.gaugeProgress.style.strokeDashoffset = offset;

    const limit = state.speedLimit;
    const buffer = state.warningBuffer;
    const warnThreshold = limit - buffer;

    if (state.currentSpeed > limit) {
      // QUÁ TỐC ĐỘ (ĐỎ)
      el.currentSpeed.style.color = 'var(--danger-red)';
      el.currentSpeed.style.textShadow = '0 0 30px var(--danger-glow)';
      el.gaugeProgress.style.stroke = 'var(--danger-red)';
      el.gaugeProgress.style.filter = 'drop-shadow(0 0 16px var(--danger-glow))';
      
      el.speedStatusText.textContent = `QUÁ TỐC ĐỘ (+${state.currentSpeed - limit})`;
      el.speedStatusText.style.backgroundColor = 'rgba(255, 23, 68, 0.25)';
      el.speedStatusText.style.color = 'var(--danger-red)';

      el.alertOverlay.classList.add('flashing');

      playAlertBeep();
      speakWarning(`Chú ý! Bạn đang chạy ${state.currentSpeed} km/h, vượt quá tốc độ cho phép ${limit} km/h!`);
      handleViolationRecord();

    } else if (state.currentSpeed >= warnThreshold) {
      // TIỆM CẬN (CAM)
      el.currentSpeed.style.color = 'var(--warn-orange)';
      el.currentSpeed.style.textShadow = '0 0 20px var(--warn-glow)';
      el.gaugeProgress.style.stroke = 'var(--warn-orange)';
      el.gaugeProgress.style.filter = 'drop-shadow(0 0 12px var(--warn-glow))';

      el.speedStatusText.textContent = 'CHÚ Ý TỐC ĐỘ';
      el.speedStatusText.style.backgroundColor = 'rgba(255, 145, 0, 0.2)';
      el.speedStatusText.style.color = 'var(--warn-orange)';

      el.alertOverlay.classList.remove('flashing');

    } else {
      // AN TOÀN (XANH)
      el.currentSpeed.style.color = 'var(--safe-green)';
      el.currentSpeed.style.textShadow = '0 0 25px var(--safe-glow)';
      el.gaugeProgress.style.stroke = 'var(--safe-green)';
      el.gaugeProgress.style.filter = 'drop-shadow(0 0 12px var(--safe-glow))';

      el.speedStatusText.textContent = 'AN TOÀN';
      el.speedStatusText.style.backgroundColor = 'rgba(0, 230, 118, 0.15)';
      el.speedStatusText.style.color = 'var(--safe-green)';

      el.alertOverlay.classList.remove('flashing');
    }

    if (state.isTripActive) {
      updateTripMetrics(state.currentSpeed);
    }
  }

  // Violation Record
  function handleViolationRecord() {
    const now = Date.now();
    if (now - state.lastViolationLogTime < 10000) return;
    state.lastViolationLogTime = now;

    state.violationsCount++;
    el.tripViolations.textContent = state.violationsCount;

    const vRecord = {
      id: now,
      trip_id: state.tripId,
      timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      current_speed: state.currentSpeed,
      speed_limit: state.speedLimit,
      latitude: state.lastPosition ? state.lastPosition.latitude : null,
      longitude: state.lastPosition ? state.lastPosition.longitude : null
    };
    saveLocalViolation(vRecord);
  }

  // Trip Metrics
  function updateTripMetrics(speed) {
    if (speed > state.tripMaxSpeed) {
      state.tripMaxSpeed = speed;
      el.tripMaxSpeed.textContent = Math.round(state.tripMaxSpeed);
    }
    state.speedSamples.push(speed);
    const sum = state.speedSamples.reduce((a, b) => a + b, 0);
    const avg = sum / state.speedSamples.length;
    el.tripAvgSpeed.textContent = Math.round(avg);
  }

  // Start GPS Tracking
  function startGpsTracking() {
    if (!('geolocation' in navigator)) {
      el.gpsBadge.textContent = 'GPS không hỗ trợ';
      el.gpsBadge.className = 'status-badge badge-searching';
      return;
    }

    el.gpsBadge.textContent = 'Đang dò GPS...';
    el.gpsBadge.className = 'status-badge badge-searching';

    const options = {
      enableHighAccuracy: state.highAccuracy,
      timeout: 10000,
      maximumAge: 1000
    };

    state.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        state.isGpsActive = true;
        el.gpsBadge.textContent = 'GPS Kết nối 🟢';
        el.gpsBadge.className = 'status-badge badge-active';

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const alt = pos.coords.altitude;
        
        el.geoLat.textContent = lat.toFixed(5);
        el.geoLng.textContent = lng.toFixed(5);
        el.geoAlt.textContent = alt ? Math.round(alt) : '--';

        let speedKmh = 0;

        if (pos.coords.speed !== null && !isNaN(pos.coords.speed)) {
          speedKmh = pos.coords.speed * 3.6;
        } else if (state.lastPosition && state.lastPositionTime) {
          const distKm = calculateDistanceKm(
            state.lastPosition.latitude, state.lastPosition.longitude,
            lat, lng
          );
          const timeSec = (pos.timestamp - state.lastPositionTime) / 1000;
          if (timeSec > 0 && distKm > 0.001) {
            speedKmh = (distKm / timeSec) * 3600;
          }
          if (state.isTripActive) {
            state.tripDistanceKm += distKm;
            el.tripDistance.textContent = state.tripDistanceKm.toFixed(1);
          }
        }

        state.lastPosition = { latitude: lat, longitude: lng };
        state.lastPositionTime = pos.timestamp;

        updateCarMapPosition(lat, lng);

        if (state.isAutoSpeedLimit) {
          fetchRoadSpeedLimit(lat, lng);
        }

        updateSpeedDisplay(speedKmh);
      },
      (err) => {
        console.warn('GPS Watch Error:', err.message);
        el.gpsBadge.textContent = 'Mất sóng GPS ⚠️';
        el.gpsBadge.className = 'status-badge badge-searching';
      },
      options
    );
  }

  // Khởi tạo Leaflet Live Map
  function initLiveMap() {
    if (typeof L === 'undefined') return;

    try {
      const defaultLat = 16.8188;
      const defaultLon = 107.1005;

      state.leafletMap = L.map('carLiveMap', {
        zoomControl: true,
        attributionControl: false
      }).setView([defaultLat, defaultLon], 15);

      const tileSources = {
        google_roadmap: {
          url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          options: { maxZoom: 20, subdomains: '0123' }
        },
        google_hybrid: {
          url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          options: { maxZoom: 20, subdomains: '0123' }
        },
        osm: {
          url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
          options: { maxZoom: 19 }
        },
        carto_dark: {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          options: { maxZoom: 19, subdomains: 'abcd' }
        }
      };

      function setMapTileSource(sourceKey) {
        if (!tileSources[sourceKey]) sourceKey = 'google_roadmap';
        if (state.currentTileLayer && state.leafletMap.hasLayer(state.currentTileLayer)) {
          state.leafletMap.removeLayer(state.currentTileLayer);
        }
        const cfg = tileSources[sourceKey];
        state.currentTileLayer = L.tileLayer(cfg.url, cfg.options).addTo(state.leafletMap);
        state.currentMapSource = sourceKey;
        if (el.mapSourceSelect) el.mapSourceSelect.value = sourceKey;
      }

      setMapTileSource('google_roadmap');

      if (el.mapSourceSelect) {
        el.mapSourceSelect.addEventListener('change', (e) => {
          setMapTileSource(e.target.value);
        });
      }

      const carIcon = L.divIcon({
        className: 'custom-car-marker',
        html: '<div class="car-pulse"></div><div class="car-symbol">🚗</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      state.carMarker = L.marker([defaultLat, defaultLon], { icon: carIcon }).addTo(state.leafletMap);

      state.routePolyline = L.polyline([], {
        color: '#00e5ff',
        weight: 4,
        opacity: 0.85,
        smoothFactor: 1
      }).addTo(state.leafletMap);

      if (el.btnMapFollow) {
        el.btnMapFollow.addEventListener('click', () => {
          state.mapFollowCar = !state.mapFollowCar;
          if (state.mapFollowCar) {
            el.btnMapFollow.classList.add('active');
            if (state.lastPosition) {
              state.leafletMap.panTo([state.lastPosition.latitude, state.lastPosition.longitude], { animate: true });
            }
          } else {
            el.btnMapFollow.classList.remove('active');
          }
        });
      }

      if (el.btnMapExpand) {
        el.btnMapExpand.addEventListener('click', () => {
          state.mapExpanded = !state.mapExpanded;
          if (state.mapExpanded) {
            document.body.classList.add('map-expanded');
            el.btnMapExpand.classList.add('active');
            el.btnMapExpand.textContent = '🗗 Thu nhỏ';
          } else {
            document.body.classList.remove('map-expanded');
            el.btnMapExpand.classList.remove('active');
            el.btnMapExpand.textContent = '⛶ Mở rộng';
          }
          setTimeout(() => {
            if (state.leafletMap) state.leafletMap.invalidateSize();
          }, 300);
        });
      }

    } catch (e) {
      console.warn('Lỗi khởi tạo Live Map:', e);
    }
  }

  function updateCarMapPosition(lat, lng) {
    if (!state.leafletMap || !state.carMarker) return;

    const latLng = [lat, lng];
    state.carMarker.setLatLng(latLng);

    if (state.routePolyline) {
      state.routePolyline.addLatLng(latLng);
    }

    if (state.mapFollowCar) {
      state.leafletMap.panTo(latLng, { animate: true, duration: 0.3 });
    }

    if (el.mapCoordsBadge) {
      el.mapCoordsBadge.textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
    }
    if (el.mapRoadBadge && state.detectedRoadName) {
      el.mapRoadBadge.textContent = state.detectedRoadName;
    }
  }

  // Tra cứu giới hạn tốc độ hoàn toàn độc lập qua Standalone Speed Engine
  async function fetchRoadSpeedLimit(lat, lon, force = false) {
    const now = Date.now();
    if (!force && now - state.lastRoadQueryTime < 3500) return;
    state.lastRoadQueryTime = now;

    if (!window.speedEngine) return;

    try {
      const road = await window.speedEngine.getRoadSpeedInfo(lat, lon);
      if (road && road.speedLimit) {
        state.detectedRoadName = road.roadName;
        if (el.detectedRoadName) el.detectedRoadName.textContent = `📍 ${road.roadName}`;

        const newLimit = road.speedLimit;
        if (newLimit !== state.speedLimit) {
          setSpeedLimit(newLimit, false);
          speakWarning(`Đoạn đường ${road.roadName}, giới hạn tốc độ ${newLimit} km/h`);
        }
      }
    } catch (err) {
      console.warn('Lỗi tra cứu tốc độ đoạn đường:', err);
    }
  }

  function setSpeedLimit(limit, announce = true) {
    state.speedLimit = limit;
    if (el.speedLimitValue) el.speedLimitValue.textContent = limit;

    if (announce) {
      speakWarning(`Giới hạn tốc độ ${limit} km/h`);
    }

    try {
      localStorage.setItem('csg_setting_speed_limit', limit);
    } catch (e) {}
    updateSpeedDisplay(state.currentSpeed);
  }

  // HUD Mode
  el.btnHud.addEventListener('click', () => {
    state.hudMode = !state.hudMode;
    toggleHudMode(state.hudMode);
  });

  function toggleHudMode(active) {
    if (active) {
      document.body.classList.add('hud-active');
      el.btnHud.classList.add('active');
    } else {
      document.body.classList.remove('hud-active');
      el.btnHud.classList.remove('active');
    }
  }

  document.body.addEventListener('click', (e) => {
    if (document.body.classList.contains('hud-active') && !e.target.closest('#btnHud')) {
      toggleHudMode(false);
    }
  });

  // Sound Toggle
  el.btnSound.addEventListener('click', () => {
    state.beepAlertEnabled = !state.beepAlertEnabled;
    state.voiceAlertEnabled = state.beepAlertEnabled;
    if (state.beepAlertEnabled) {
      el.btnSound.classList.add('active');
      el.btnSound.innerHTML = '<span class="sound-icon">🔊</span>';
    } else {
      el.btnSound.classList.remove('active');
      el.btnSound.innerHTML = '<span class="sound-icon">🔇</span>';
    }
  });

  // Trip Control
  el.btnTripControl.addEventListener('click', () => {
    if (!state.isTripActive) {
      startTrip();
    } else {
      endTripSession();
    }
  });

  function startTrip() {
    state.isTripActive = true;
    state.tripId = Date.now();
    state.tripStartTime = new Date();
    state.tripDurationSec = 0;
    state.tripDistanceKm = 0.0;
    state.tripMaxSpeed = 0.0;
    state.speedSamples = [];
    state.violationsCount = 0;

    el.tripDistance.textContent = '0.0';
    el.tripMaxSpeed.textContent = '0';
    el.tripAvgSpeed.textContent = '0';
    el.tripDuration.textContent = '00:00:00';
    el.tripViolations.textContent = '0';

    el.btnTripControl.textContent = '⏹ Kết Thúc Chuyến';
    el.btnTripControl.classList.add('active');

    state.tripTimerInterval = setInterval(() => {
      state.tripDurationSec++;
      const hrs = String(Math.floor(state.tripDurationSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((state.tripDurationSec % 3600) / 60)).padStart(2, '0');
      const secs = String(state.tripDurationSec % 60).padStart(2, '0');
      el.tripDuration.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
  }

  function endTripSession() {
    state.isTripActive = false;
    clearInterval(state.tripTimerInterval);

    el.btnTripControl.textContent = '▶ Bắt Đầu Chuyến';
    el.btnTripControl.classList.remove('active');

    const avgSpeed = state.speedSamples.length > 0 
      ? state.speedSamples.reduce((a, b) => a + b, 0) / state.speedSamples.length 
      : 0;

    const tripRecord = {
      id: state.tripId,
      start_time: state.tripStartTime.toLocaleTimeString('vi-VN') + ' ' + state.tripStartTime.toLocaleDateString('vi-VN'),
      end_time: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      distance_km: parseFloat(state.tripDistanceKm.toFixed(2)),
      max_speed_kmh: Math.round(state.tripMaxSpeed),
      avg_speed_kmh: Math.round(avgSpeed),
      duration_seconds: state.tripDurationSec,
      violations_count: state.violationsCount
    };
    saveLocalTrip(tripRecord);
  }

  // History Modal
  el.btnViewHistory.addEventListener('click', () => {
    loadHistoryData();
    el.historyModal.classList.add('show');
  });

  el.btnCloseHistory.addEventListener('click', () => {
    el.historyModal.classList.remove('show');
  });

  el.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      el.tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  function loadHistoryData() {
    const violations = getLocalViolations();
    if (violations.length === 0) {
      el.violationsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có vi phạm nào. Bạn lái xe rất an toàn!</td></tr>';
    } else {
      el.violationsTableBody.innerHTML = violations.slice(0, 30).map(v => {
        const over = v.current_speed - v.speed_limit;
        const coords = (v.latitude && v.longitude) ? `${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}` : '--';
        return `<tr>
          <td>${v.timestamp}</td>
          <td><strong style="color: var(--danger-red)">${v.current_speed} km/h</strong></td>
          <td>${v.speed_limit} km/h</td>
          <td><span class="badge-danger">+${over} km/h</span></td>
          <td>${coords}</td>
        </tr>`;
      }).join('');
    }

    const trips = getLocalTrips();
    if (trips.length === 0) {
      el.tripsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có lịch sử chuyến đi nào.</td></tr>';
    } else {
      el.tripsTableBody.innerHTML = trips.slice(0, 30).map(t => {
        return `<tr>
          <td>${t.start_time}</td>
          <td>${t.end_time || '--'}</td>
          <td><strong>${t.distance_km} km</strong></td>
          <td>${t.max_speed_kmh} km/h</td>
          <td>${t.avg_speed_kmh} km/h</td>
          <td><span class="${t.violations_count > 0 ? 'badge-danger' : 'badge-safe'}">${t.violations_count}</span></td>
        </tr>`;
      }).join('');
    }
  }

  // Settings Modal
  el.btnSettings.addEventListener('click', () => {
    el.settingsModal.classList.add('show');
  });

  el.btnCloseSettings.addEventListener('click', () => {
    el.settingsModal.classList.remove('show');
  });

  el.btnSaveSettings.addEventListener('click', () => {
    state.warningBuffer = parseInt(el.settingWarningBuffer.value, 10) || 5;
    state.voiceAlertEnabled = el.settingVoiceAlert.checked;
    state.beepAlertEnabled = el.settingBeepAlert.checked;
    state.highAccuracy = el.settingHighAccuracy.checked;

    try {
      localStorage.setItem('csg_setting_warning_buffer', state.warningBuffer);
      localStorage.setItem('csg_setting_voice_alert', state.voiceAlertEnabled);
      localStorage.setItem('csg_setting_beep_alert', state.beepAlertEnabled);
      localStorage.setItem('csg_setting_high_accuracy', state.highAccuracy);
    } catch (e) {}

    el.settingsModal.classList.remove('show');
  });

  // Service Worker Registration for Offline Cache
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW reg fail:', err));
    });
  }

  // Khởi động
  function initApp() {
    try {
      const savedBuffer = localStorage.getItem('csg_setting_warning_buffer');
      if (savedBuffer) {
        state.warningBuffer = parseInt(savedBuffer, 10);
        el.settingWarningBuffer.value = state.warningBuffer;
      }
      const savedVoice = localStorage.getItem('csg_setting_voice_alert');
      if (savedVoice !== null) {
        state.voiceAlertEnabled = savedVoice === 'true';
        el.settingVoiceAlert.checked = state.voiceAlertEnabled;
      }
      const savedBeep = localStorage.getItem('csg_setting_beep_alert');
      if (savedBeep !== null) {
        state.beepAlertEnabled = savedBeep === 'true';
        el.settingBeepAlert.checked = state.beepAlertEnabled;
      }
    } catch (e) {}

    initLiveMap();
    startGpsTracking();
    updateSpeedDisplay(0);
  }

  window.addEventListener('DOMContentLoaded', initApp);

})();
