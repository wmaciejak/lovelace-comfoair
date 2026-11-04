import { describe, expect, it } from 'vitest';
import { statusChip } from '../src/helpers';

describe('honest device status', () => {
  it.each(['filter', 'bypass', 'preheat', 'season'] as const)('does not interpret missing %s data as a healthy state', kind => {
    for (const state of [undefined, 'unknown', 'unavailable']) {
      const chip = statusChip(kind, state, undefined, 'en');
      expect(chip.sub).toBe('Unavailable');
      expect(chip.active).toBe(false);
      if (kind === 'season') expect(chip.label).not.toBe('Summer');
    }
  });
  it('does not interpret an unavailable fan mode as off', () => {
    expect(statusChip('fan', undefined, undefined, 'en').sub).toBe('Unavailable');
  });
});
