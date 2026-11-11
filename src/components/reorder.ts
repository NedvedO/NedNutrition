/** Index a dragged row should move to, given how far it has been dragged. */
export function dragTarget(start: number, dy: number, rowHeight: number, count: number): number {
  return Math.min(Math.max(start + Math.round(dy / rowHeight), 0), count - 1);
}
