import defaultLeaves from '../../data/leaves.json';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

const LOCAL_STORAGE_GP_KEY = 'bit_calendar_custom_gps_v2';

/**
 * Get all leaves merged with custom/admin added GP leaves
 */
export async function getAllLeaves() {
  const customGps = getCustomGpsFromLocal();
  let firestoreGps = [];

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'gps'));
      firestoreGps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Could not fetch Firestore GP leaves (using offline/local):', err.message);
    }
  }

  // Merge order: base default leaves < local custom < firestore custom (confirmed overrides tentative)
  const allEvents = [...defaultLeaves];

  const mergedCustom = [...customGps];
  firestoreGps.forEach(fgp => {
    const idx = mergedCustom.findIndex(c => c.id === fgp.id || (c.start === fgp.start && c.end === fgp.end));
    if (idx >= 0) {
      mergedCustom[idx] = fgp;
    } else {
      mergedCustom.push(fgp);
    }
  });

  mergedCustom.forEach(customItem => {
    // Override any overlapping tentative holidays or add new GP
    const existingIndex = allEvents.findIndex(
      e => e.start === customItem.start && e.end === customItem.end
    );
    if (existingIndex >= 0) {
      allEvents[existingIndex] = customItem;
    } else {
      allEvents.push(customItem);
    }
  });

  return allEvents;
}

/**
 * Save a newly announced or updated GP leave
 */
export async function saveGpLeave(gpData) {
  const id = gpData.id || `gp-${Date.now()}`;
  const record = {
    ...gpData,
    id,
    type: 'GP',
    status: 'Confirmed', // Admin entries are Confirmed
    updatedAt: new Date().toISOString()
  };

  // 1. Save locally
  const current = getCustomGpsFromLocal();
  const existingIdx = current.findIndex(c => c.id === id || (c.start === record.start && c.end === record.end));
  if (existingIdx >= 0) {
    current[existingIdx] = record;
  } else {
    current.push(record);
  }
  localStorage.setItem(LOCAL_STORAGE_GP_KEY, JSON.stringify(current));

  // 2. Save to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'gps', id), record, { merge: true });
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
    }
  }

  return record;
}

export function getCustomGpsFromLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// --- Date Utilities (timezone-safe integer date parsing) ---
export function parseDateKey(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10), // 1-12
    day: parseInt(parts[2], 10)
  };
}

export function toDateKey(year, month, day) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function createLocalDate(year, month, day) {
  return new Date(year, month - 1, day);
}

export function getDaysBetween(dateStrA, dateStrB) {
  const da = parseDateKey(dateStrA);
  const db = parseDateKey(dateStrB);
  const dateA = createLocalDate(da.year, da.month, da.day);
  const dateB = createLocalDate(db.year, db.month, db.day);
  const diffTime = dateB.getTime() - dateA.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function formatHumanDate(dateStr, includeWeekday = true) {
  const dp = parseDateKey(dateStr);
  if (!dp) return '';
  const date = createLocalDate(dp.year, dp.month, dp.day);
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  if (includeWeekday) opts.weekday = 'short';
  return date.toLocaleDateString('en-IN', opts);
}

export function formatFullDate(dateStr) {
  const dp = parseDateKey(dateStr);
  if (!dp) return '';
  const date = createLocalDate(dp.year, dp.month, dp.day);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Quick day indexer
 */
export function buildEventsLookup(allEvents) {
  const lookup = new Map();

  allEvents.forEach((ev, idx) => {
    const eventId = ev.id || `ev-${idx}`;
    if (ev.type === 'HOLIDAY') {
      registerSingleDay(lookup, ev.date, {
        id: eventId,
        type: 'HOLIDAY',
        name: ev.name,
        startDate: ev.date,
        endDate: ev.date,
        status: ev.status || 'Tentative',
        raw: ev
      });
    } else if (ev.type === 'GP') {
      const totalDays = getDaysBetween(ev.start, ev.end);
      const s = parseDateKey(ev.start);
      const curDate = createLocalDate(s.year, s.month, s.day);

      for (let d = 0; d < totalDays; d++) {
        const y = curDate.getFullYear();
        const m = curDate.getMonth() + 1;
        const day = curDate.getDate();
        const dateKey = toDateKey(y, m, day);

        const isStartDay = (d === 0);
        const isAN = isStartDay && Boolean(ev.startAN);

        let isFestival = false;
        let festivalName = '';

        if (ev.festival) {
          if (ev.festival.date) {
            if (ev.festival.endDate) {
              if (dateKey >= ev.festival.date && dateKey <= ev.festival.endDate) {
                isFestival = true;
                festivalName = ev.festival.name;
              }
            } else if (dateKey === ev.festival.date) {
              isFestival = true;
              festivalName = ev.festival.name;
            }
          } else {
            isFestival = true;
            festivalName = ev.festival.name;
          }
        }

        registerGpDay(lookup, dateKey, {
          id: eventId,
          type: 'GP',
          name: ev.festival ? `${ev.festival.name} GP Leave` : 'GP Leave',
          startDate: ev.start,
          endDate: ev.end,
          startAN: Boolean(ev.startAN),
          isAN,
          isFestival,
          festivalName,
          status: ev.status || 'Confirmed',
          totalDays,
          messClosure: ev.messClosure || null,
          raw: ev
        });

        curDate.setDate(curDate.getDate() + 1);
      }
    }
  });

  return lookup;
}

function registerSingleDay(map, dateKey, eventObj) {
  if (!map.has(dateKey)) {
    map.set(dateKey, {
      dateKey,
      events: [],
      isHoliday: true,
      holidayName: eventObj.name,
      isGP: false,
      isAN: false,
      isFestival: false,
      festivalName: '',
      hasMessClosure: false,
      messClosure: null,
      status: eventObj.status
    });
  }
  const item = map.get(dateKey);
  item.events.push(eventObj);
}

function registerGpDay(map, dateKey, meta) {
  if (!map.has(dateKey)) {
    map.set(dateKey, {
      dateKey,
      events: [],
      isHoliday: false,
      holidayName: '',
      isGP: true,
      isAN: meta.isAN,
      isFestival: meta.isFestival,
      festivalName: meta.festivalName,
      hasMessClosure: Boolean(meta.messClosure),
      messClosure: meta.messClosure,
      status: meta.status
    });
  } else {
    const item = map.get(dateKey);
    item.isGP = true;
    if (meta.isAN) item.isAN = true;
    if (meta.isFestival) {
      item.isFestival = true;
      item.festivalName = meta.festivalName;
    }
    if (meta.messClosure) {
      item.hasMessClosure = true;
      item.messClosure = meta.messClosure;
    }
    if (meta.status === 'Confirmed') {
      item.status = 'Confirmed';
    }
  }
  map.get(dateKey).events.push(meta);
}

