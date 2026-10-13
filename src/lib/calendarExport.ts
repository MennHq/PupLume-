/**
 * PupLume iCalendar (.ics) Exporter
 * Generates an RFC 5545 compliant calendar file with daily recurring puppy routine events,
 * alarms, and details for Apple Calendar, Google Calendar, and Outlook.
 */

import { PuppyProfile, TaskItem } from '../types';

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function parseTimeToHoursAndMinutes(timeStr: string): { hours: number; minutes: number } {
  // Handles "08:00 AM", "12:30 PM", "15:00", etc.
  const clean = timeStr.trim();
  const isPM = clean.toUpperCase().includes('PM');
  const isAM = clean.toUpperCase().includes('AM');
  const [numPart] = clean.split(' ');
  const [rawH, rawM] = numPart.split(':').map((s) => parseInt(s, 10));

  let hours = isNaN(rawH) ? 9 : rawH;
  const minutes = isNaN(rawM) ? 0 : rawM;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return { hours, minutes };
}

export function generateICSContent(puppy: PuppyProfile, tasks: TaskItem[]): string {
  const now = new Date();
  const dtStamp = formatICSDate(now);

  const events = tasks.map((task, index) => {
    const { hours, minutes } = parseTimeToHoursAndMinutes(task.time);
    const durationMin = task.durationMin || 15;

    // Set today as starting day
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMin * 60000);

    const dtStart = formatICSDate(startDate);
    const dtEnd = formatICSDate(endDate);

    const uid = `task_${task.id || index}_${startDate.getTime()}@puplume.pet`;
    const summary = `🐾 ${puppy.name}: ${task.title}`;
    const description = [
      task.description || `Daily scheduled ${task.category} activity for ${puppy.name}.`,
      '',
      `Category: ${task.category.toUpperCase()}`,
      `Duration: ${durationMin} minutes`,
      `Puppy: ${puppy.name} (${puppy.breed})`,
      'Created with PupLume — AI Puppy Manager (https://puplume.pet)'
    ].join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      'RRULE:FREQ=DAILY', // Repeat daily for puppy consistency
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `CATEGORIES:${task.category.toUpperCase()}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M', // 15-minute ahead reminder
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${task.title} for ${puppy.name} in 15 minutes!`,
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n');
  });

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PupLume//AI Puppy Routine 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${puppy.name}'s PupLume Routine`,
    `X-WR-CALDESC:Daily schedule, meals, potty breaks, and training for ${puppy.name}`,
    'X-WR-TIMEZONE:UTC',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  return calendar;
}

export function exportPuppyScheduleToICS(puppy: PuppyProfile, tasks: TaskItem[]): void {
  const content = generateICSContent(puppy, tasks);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${puppy.name}-Daily-Routine-PupLume.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
