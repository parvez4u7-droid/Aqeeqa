import { AqeeqaInvitationData } from '../types/wedding';

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function formatIcsDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    date.getHours()
  )}${pad(date.getMinutes())}00`;
}

export function downloadWeddingIcs(data: AqeeqaInvitationData): void {
  const start = new Date(data.targetDateTime);
  const validStart = Number.isNaN(start.getTime()) ? new Date() : start;
  const end = new Date(validStart.getTime() + 4 * 60 * 60 * 1000);

  const summary = `${data.occasionTitle || 'Aqeeqa Mubarak'} — ${data.childName}`;
  const location = `${data.venueName}, ${data.venueAddress}`;
  const description = `${data.invitationLead} ${data.grandfatherName} & ${data.fatherName} ${data.invitationMessage} ${data.childName}.\n\n${data.aqeeqaDay}, ${data.aqeeqaDate} (${data.aqeeqaTime}) at ${data.venueName}, ${data.venueAddress}`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Royal Aqeeqa Digital Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${data.slug}@royal-aqeeqa-invitation`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${formatIcsDate(validStart)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.slug || 'aqeeqa-invitation'}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
