import { canAccept } from './consent';

describe('canAccept', () => {
  it('requires both agreements', () => {
    expect(canAccept(true, true)).toBe(true);
    expect(canAccept(true, false)).toBe(false);
    expect(canAccept(false, true)).toBe(false);
    expect(canAccept(false, false)).toBe(false);
  });
});
