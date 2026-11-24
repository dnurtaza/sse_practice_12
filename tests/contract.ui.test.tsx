import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Root from '@/Root';
import { ContractChecker, ContractResultPanel } from '@/components/ContractChecker';
import { runSharedTests } from '@/contract/runSharedTests';
import { checkContract } from '@/contract/checkContract';
import { CONTRACT_NOW_MINUTES, CONTRACT_ROOM } from '@/contract/fixture';

describe('Practice #12 contract UI', () => {
  it('C-UI1 renders start time, duration and room-status controls and the read-only booking', () => {
    const html = renderToStaticMarkup(<ContractChecker />);
    expect(html).toContain('aria-label="Start time"');
    expect(html).toContain('aria-label="Duration in minutes"');
    expect(html).toContain('aria-label="Room blocked"');
    expect(html).toContain('10:00–11:00');
    expect(html).toContain('CS101 Lecture');
  });

  it('C-UI2 shell shows the Practice #12 checker by default', () => {
    const html = renderToStaticMarkup(<Root />);
    expect(html).toContain('Check Allen Hall 101');
  });

  it('C-UI3 in-app test runner reports 8/8 passed', () => {
    const rows = runSharedTests();
    expect(rows).toHaveLength(8);
    expect(rows.every((r) => r.pass)).toBe(true);
  });

  it('C-UI4 result panel escapes user-controlled text (no raw HTML injection)', () => {
    const html = renderToStaticMarkup(
      <ContractResultPanel result={{ available: false, reasonCode: 'INVALID_START', message: '<img src=x onerror=alert(1)>', validationError: true }} />
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('C-UI5 validation errors render as "Check your input", not as Unavailable', () => {
    const r = checkContract({ startTime: '11:30', durationMinutes: 0, blocked: false }, CONTRACT_ROOM, CONTRACT_NOW_MINUTES);
    const html = renderToStaticMarkup(<ContractResultPanel result={r} />);
    expect(html).toContain('Check your input');
    expect(html).toContain('INVALID_DURATION');
  });
});
