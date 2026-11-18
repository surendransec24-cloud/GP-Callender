import { formatHumanDate, parseDateKey, createLocalDate, toDateKey } from '../services/leavesService';

function formatIcsDate(dateKey) {
  // Returns YYYYMMDD
  return dateKey.replace(/-/g, '');
}

function getNextDay(dateKey) {
  const p = parseDateKey(dateKey);
  const d = createLocalDate(p.year, p.month, p.day);
  d.setDate(d.getDate() + 1);
  return toDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Generate RFC 5545 iCalendar content
 * @param {Array} eventsList - array of event objects
 * @param {string} calName - calendar title
 */
export function generateIcs(eventsList, calName = 'BIT Holiday & GP Calendar') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bannari Amman Institute of Technology//BIT Calendar App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    'X-WR-TIMEZONE:Asia/Kolkata'
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  eventsList.forEach((ev, idx) => {
    const isRange = ev.type === 'GP';
    const startDate = isRange ? ev.start : ev.date;
    const endDate = isRange ? ev.end : ev.date;

    const dtStart = formatIcsDate(startDate);
    const dtEnd = formatIcsDate(getNextDay(endDate)); // all-day DTEND is exclusive

    let summary = ev.name || (ev.festival ? `${ev.festival.name} GP Leave` : 'GP Leave');
    if (ev.startAN) summary += ' (AN Start)';
    if (ev.status === 'Tentative') summary += ' [Tentative]';

    let desc = `${summary} - Bannari Amman Institute of Technology, Sathyamangalam.`;
    if (ev.status === 'Tentative') {
      desc += '\\nNote: Tentative schedule subject to official college notification.';
    }
    if (ev.startAN) {
      desc += `\\nLeave starts in the afternoon (AN) on ${startDate}.`;
    }
    if (ev.festival && ev.festival.name) {
      desc += `\\nFestival: ${ev.festival.name}`;
    }
    if (ev.messClosure) {
      desc += `\\nMess Closed: From ${ev.messClosure.from} to ${ev.messClosure.to}.`;
    }

    const uid = `bit-leave-${startDate}-${idx}@bitsathy.ac.in`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push('LOCATION:Bannari Amman Institute of Technology, Sathyamangalam, Tamil Nadu');
    lines.push(`STATUS:${ev.status === 'Confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger browser file download
 */
export function downloadIcsFile(filename, icsContent) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

