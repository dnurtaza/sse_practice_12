export default {
  // ---- Fixed fictional data (same as the code-based solution) ----------------
  room: { id: 'r1', name: 'Allen Hall 101' },
  bookings: [{ id: 'b1', start: 600, end: 660, purpose: 'CS101 Lecture' }], // 10:00–11:00
  nowMinutes: 540, // reference "current time" 09:00
  maxDuration: 120,

  toHHMM(m) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  },

  // ---- Rule engine: inputs -> { available, reasonCode, message, validationError }
  evaluate(startTime, durationRaw, blocked) {
    const fail = (reasonCode, message, validationError) => ({ available: false, reasonCode, message, validationError });
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(startTime || '').trim());
    if (!match) return fail('INVALID_START', 'Enter a start time in HH:MM format.', true);
    const start = Number(match[1]) * 60 + Number(match[2]);

    const raw = String(durationRaw === undefined || durationRaw === null ? '' : durationRaw).trim();
    const duration = raw === '' ? NaN : Number(raw);
    if (!Number.isInteger(duration) || duration <= 0)
      return fail('INVALID_DURATION', 'Duration must be a whole number of minutes greater than 0.', true);
    if (duration > this.maxDuration)
      return fail('TOO_LONG', 'Duration must be at most ' + this.maxDuration + ' minutes (you entered ' + duration + ').', true);
    if (start <= this.nowMinutes)
      return fail('PAST_TIME', 'Start time must be in the future (after ' + this.toHHMM(this.nowMinutes) + ').', true);
    const end = start + duration;
    if (end > 1440) return fail('OUT_OF_DAY', 'The booking must end by 24:00 on the same day.', true);

    const slot = this.toHHMM(start) + '–' + this.toHHMM(end);
    if (blocked) return fail('BLOCKED', 'Unavailable: ' + this.room.name + ' is blocked and cannot be booked.', false);
    const clash = this.bookings.find((b) => start < b.end && end > b.start);
    if (clash)
      return fail('OVERLAP', 'Unavailable: ' + slot + ' overlaps with existing booking "' + clash.purpose + '" (' +
        this.toHHMM(clash.start) + '–' + this.toHHMM(clash.end) + ').', false);
    return { available: true, reasonCode: 'AVAILABLE', message: 'Available: ' + this.room.name + ' is free ' + slot + '.', validationError: false };
  },

  // ---- Button "Check" (onClick: {{Checker.check()}}) ---------------------------
  check() {
    const result = this.evaluate(StartInput.text, DurationInput.text, BlockedSwitch.isSwitchedOn);
    return storeValue('result', result);
  },

  reset() {
    resetWidget('StartInput');
    resetWidget('DurationInput');
    resetWidget('BlockedSwitch');
    return storeValue('result', undefined);
  },

  // ---- Button "Run all tests" (onClick: {{Checker.runTests()}}) ----------------
  cases: [
    { id: 'T1', title: 'Valid free interval', start: '11:30', duration: 60, blocked: false, avail: true, code: 'AVAILABLE' },
    { id: 'T2', title: 'Overlap with existing booking', start: '10:30', duration: 60, blocked: false, avail: false, code: 'OVERLAP' },
    { id: 'T3', title: 'Blocked room', start: '11:30', duration: 60, blocked: true, avail: false, code: 'BLOCKED' },
    { id: 'T4', title: 'Duration = 0', start: '11:30', duration: 0, blocked: false, avail: false, code: 'INVALID_DURATION' },
    { id: 'T5', title: 'Duration = 121', start: '11:30', duration: 121, blocked: false, avail: false, code: 'TOO_LONG' },
    { id: 'T6', title: 'Past start time', start: '08:00', duration: 60, blocked: false, avail: false, code: 'PAST_TIME' },
    { id: 'T7', title: 'Adjacent, non-overlapping', start: '11:00', duration: 60, blocked: false, avail: true, code: 'AVAILABLE' },
  ],

  testRows() {
    const before = JSON.stringify(this.bookings);
    const rows = this.cases.map((c) => {
      const r = this.evaluate(c.start, c.duration, c.blocked);
      const pass = r.available === c.avail && r.reasonCode === c.code;
      return {
        id: c.id,
        case: c.title + ' (' + c.start + ', ' + c.duration + ' min' + (c.blocked ? ', blocked' : '') + ')',
        expected: (c.avail ? 'Available' : 'Unavailable') + ' · ' + c.code,
        observed: (r.available ? 'Available' : 'Unavailable') + ' · ' + r.reasonCode,
        result: pass ? 'PASS' : 'FAIL',
      };
    });
    const unchanged = JSON.stringify(this.bookings) === before;
    rows.push({ id: 'T8', case: 'Booking data unchanged after T1–T7', expected: 'unchanged', observed: unchanged ? 'unchanged' : 'CHANGED', result: unchanged ? 'PASS' : 'FAIL' });
    return rows;
  },

  runTests() {
    return storeValue('tests', this.testRows());
  },
};
