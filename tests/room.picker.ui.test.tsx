import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '@/App';
import { RoomFilters } from '@/components/RoomFilters';
import { RoomPicker } from '@/components/RoomPicker';
import { sampleRooms } from '@/sampleData';
import { buildRoomCriteria, collectEquipment, filterRooms } from '@/utils/roomFilters';

function buttonContaining(html: string, text: string): string {
  const chunk = html.split('<button').find((part) => part.includes(text));
  if (!chunk) throw new Error(`No button rendered containing "${text}"`);
  return chunk;
}

describe('room selection UI', () => {
  it('U01 renders every catalog room and its equipment on the main page', () => {
    const html = renderToStaticMarkup(<App />);
    for (const room of sampleRooms) {
      expect(html).toContain(room.name);
    }
    expect(html).toContain('Projector · Computer · Whiteboard');
  });

  it('U02 renders every equipment option as a filter toggle', () => {
    const html = renderToStaticMarkup(
      <RoomFilters
        attendees=""
        onAttendeesChange={() => {}}
        equipmentOptions={collectEquipment(sampleRooms)}
        selectedEquipment={['Projector']}
        onToggleEquipment={() => {}}
        onClear={() => {}}
        isActive
      />
    );
    for (const item of collectEquipment(sampleRooms)) {
      expect(html).toContain(item);
    }
    expect(buttonContaining(html, 'Projector')).toContain('aria-pressed="true"');
    expect(buttonContaining(html, 'Smart TV')).toContain('aria-pressed="false"');
    expect(html).toContain('Clear filters');
  });

  it('U03 disables blocked rooms in the picker so they cannot be selected', () => {
    const html = renderToStaticMarkup(
      <RoomPicker rooms={sampleRooms} selectedId={null} onSelect={() => {}} />
    );
    expect(buttonContaining(html, 'Allen Hall 204')).toContain('disabled=""');
    expect(buttonContaining(html, 'Tech Center A')).not.toContain('disabled=""');
  });

  it('U04 shows the empty state message when no rooms match', () => {
    const html = renderToStaticMarkup(
      <RoomPicker rooms={[]} selectedId={null} onSelect={() => {}} />
    );
    expect(html).toContain('No rooms match your filters');
    expect(html).not.toContain('seats');
  });

  it('U05 integration: attendee and equipment criteria flow into the rendered picker', () => {
    const matching = filterRooms(sampleRooms, buildRoomCriteria('40', ['Smart TV']));
    const html = renderToStaticMarkup(
      <RoomPicker rooms={matching} selectedId={null} onSelect={() => {}} />
    );
    expect(html).toContain('Tech Center A');
    expect(html).not.toContain('Allen Hall 101');
    expect(html).not.toContain('Library Study Rm 3');
  });

  it('U06 integration: impossible criteria produce the empty state through the full chain', () => {
    const matching = filterRooms(sampleRooms, buildRoomCriteria('61', []));
    const html = renderToStaticMarkup(
      <RoomPicker rooms={matching} selectedId={null} onSelect={() => {}} />
    );
    expect(html).toContain('No rooms match your filters');
  });
});
