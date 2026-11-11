import { dragTarget } from './reorder';

describe('dragTarget', () => {
  it('moves one row for every row height dragged', () => {
    expect(dragTarget(1, 0, 70, 4)).toBe(1);
    expect(dragTarget(1, 70, 70, 4)).toBe(2);
    expect(dragTarget(1, -70, 70, 4)).toBe(0);
  });

  it('switches rows halfway across', () => {
    expect(dragTarget(0, 34, 70, 4)).toBe(0);
    expect(dragTarget(0, 36, 70, 4)).toBe(1);
  });

  it('stays inside the list', () => {
    expect(dragTarget(2, 1000, 70, 4)).toBe(3);
    expect(dragTarget(2, -1000, 70, 4)).toBe(0);
  });
});
