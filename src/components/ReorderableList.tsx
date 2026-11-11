import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { dragTarget } from './reorder';

type Props<T> = {
  items: T[];
  keyOf: (item: T) => string;
  labelOf: (item: T) => string;
  /** Every row must be this tall so the list knows where a dragged row lands. */
  rowHeight: number;
  onMove: (from: number, to: number) => void;
  /** Lets the parent stop scrolling while a row is being dragged. */
  onDragChange?: (dragging: boolean) => void;
  renderRow: (item: T, handle: ReactNode, index: number) => ReactNode;
};

/** A list whose rows can be reordered by dragging the ≡ handle. */
export function ReorderableList<T>({
  items,
  keyOf,
  labelOf,
  rowHeight,
  onMove,
  onDragChange,
  renderRow,
}: Props<T>) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  // Gesture callbacks outlive renders, so they read the latest values from a ref.
  const latest = useRef({ items, onMove, onDragChange });
  useEffect(() => {
    latest.current = { items, onMove, onDragChange };
  });

  const keys = items.map(keyOf);

  return (
    <View>
      {items.map((item, index) => {
        const key = keys[index];
        const isDragging = dragging === key;
        return (
          <View
            key={key}
            style={[
              { height: rowHeight },
              isDragging && { transform: [{ translateY: offset }], zIndex: 10 },
              isDragging && styles.lifted,
            ]}
          >
            {renderRow(
              item,
              <DragHandle
                itemKey={key}
                label={labelOf(item)}
                rowHeight={rowHeight}
                latest={latest}
                keyOf={keyOf}
                onStart={() => {
                  setDragging(key);
                  setOffset(0);
                }}
                onDrag={setOffset}
                onEnd={() => {
                  setDragging(null);
                  setOffset(0);
                }}
                canMoveUp={index > 0}
                canMoveDown={index < items.length - 1}
              />,
              index,
            )}
          </View>
        );
      })}
    </View>
  );
}

function DragHandle<T>({
  itemKey,
  label,
  rowHeight,
  latest,
  keyOf,
  onStart,
  onDrag,
  onEnd,
  canMoveUp,
  canMoveDown,
}: {
  itemKey: string;
  label: string;
  rowHeight: number;
  latest: RefObject<{
    items: T[];
    onMove: (from: number, to: number) => void;
    onDragChange?: (dragging: boolean) => void;
  }>;
  keyOf: (item: T) => string;
  onStart: () => void;
  onDrag: (offset: number) => void;
  onEnd: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const gesture = useRef({ start: 0, current: 0 });
  const callbacks = useRef({ onStart, onDrag, onEnd });
  useEffect(() => {
    callbacks.current = { onStart, onDrag, onEnd };
  });

  const indexNow = () => latest.current.items.findIndex((i) => keyOf(i) === itemKey);

  // Created once; its callbacks only read refs when a gesture happens, never while rendering.
  // The lint rule can't tell these are event callbacks, so it's switched off for this line.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const index = indexNow();
        gesture.current = { start: index, current: index };
        latest.current.onDragChange?.(true);
        callbacks.current.onStart();
      },
      onPanResponderMove: (_, { dy }) => {
        const { start, current } = gesture.current;
        const target = dragTarget(start, dy, rowHeight, latest.current.items.length);
        if (target !== current) {
          latest.current.onMove(current, target);
          gesture.current.current = target;
        }
        callbacks.current.onDrag(dy - (gesture.current.current - start) * rowHeight);
      },
      onPanResponderRelease: () => {
        latest.current.onDragChange?.(false);
        callbacks.current.onEnd();
      },
      onPanResponderTerminate: () => {
        latest.current.onDragChange?.(false);
        callbacks.current.onEnd();
      },
    }),
  );

  const actions = [
    ...(canMoveUp ? [{ name: 'moveUp', label: 'Move up' }] : []),
    ...(canMoveDown ? [{ name: 'moveDown', label: 'Move down' }] : []),
  ];

  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`Reorder ${label}`}
      accessibilityActions={actions}
      onAccessibilityAction={(e) => {
        const index = indexNow();
        latest.current.onMove(index, index + (e.nativeEvent.actionName === 'moveUp' ? -1 : 1));
      }}
      hitSlop={10}
      style={styles.handle}
    >
      <MaterialCommunityIcons name="drag-horizontal-variant" size={28} color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  handle: { padding: 8, cursor: 'grab' } as object,
  lifted: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
