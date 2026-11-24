import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TimeForm } from '@/components/TimeForm';
import { MAX_BOOKING_DURATION_MINUTES } from '@/booking';
import { isSelectableEnd } from '@/utils/time';

const noop = () => {};

function endOptionValues(startTime: string, currentMinutes = 540): string[] {
  const html = renderToStaticMarkup(
    <TimeForm
      startTime={startTime}
      endTime=""
      onStartTimeChange={noop}
      onEndTimeChange={noop}
      currentMinutes={currentMinutes}
      onCheck={noop}
      onReset={noop}
      disabled={false}
    />
  );
  const endSelect = html.split('aria-label="End time"')[1].split('</select>')[0];
  return [...endSelect.matchAll(/<option value="(\d{2}:\d{2})"/g)].map((m) => m[1]);
}

describe('R2 regression: end-time dropdown respects the 120-minute cap (AC2)', () => {
  it('R2-a offers no end time later than start + 120 minutes', () => {
    const values = endOptionValues('10:00');
    expect(values[0]).toBe('10:15');
    expect(values[values.length - 1]).toBe('12:00');
    expect(values).not.toContain('12:15');
  });

  it('R2-b still allows 24:00 as the last end time near midnight', () => {
    const values = endOptionValues('23:00');
    expect(values[values.length - 1]).toBe('24:00');
  });
});

describe('R1 regression: changing the start clears an end time that is no longer valid', () => {
  const MAX = MAX_BOOKING_DURATION_MINUTES;

  it('R1-a end 11:00 is dropped when start moves to 11:30', () => {
    expect(isSelectableEnd(690, 660, MAX)).toBe(false);
  });

  it('R1-b end equal to the new start is dropped', () => {
    expect(isSelectableEnd(660, 660, MAX)).toBe(false);
  });

  it('R1-c end more than 120 minutes after the new start is dropped', () => {
    expect(isSelectableEnd(540, 690, MAX)).toBe(false);
  });

  it('R1-d a still-valid end time is kept', () => {
    expect(isSelectableEnd(600, 660, MAX)).toBe(true);
    expect(isSelectableEnd(600, 720, MAX)).toBe(true);
  });

  it('R1-e an empty start or end is never selectable', () => {
    expect(isSelectableEnd(NaN, 660, MAX)).toBe(false);
    expect(isSelectableEnd(600, NaN, MAX)).toBe(false);
  });
});
