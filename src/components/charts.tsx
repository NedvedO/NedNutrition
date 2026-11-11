import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { colors } from '../theme';

// ---- Gauge ----

const GAUGE_START = 150; // degrees, measured clockwise from 3 o'clock
const GAUGE_SWEEP = 240;

function polar(cx: number, cy: number, r: number, degrees: number): [number, number] {
  const radians = (degrees * Math.PI) / 180;
  return [cx + r * Math.cos(radians), cy + r * Math.sin(radians)];
}

export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  const largeArc = to - from > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/** An open ring that fills clockwise from 0 to 1, like a speedometer. */
export function Gauge({
  size,
  fraction,
  color,
}: {
  size: number;
  fraction: number;
  color: string;
}) {
  const stroke = 7;
  const r = size / 2 - stroke;
  const c = size / 2;
  const clamped = Math.min(Math.max(fraction, 0), 1);
  return (
    <Svg width={size} height={size}>
      <Path
        d={arcPath(c, c, r, GAUGE_START, GAUGE_START + GAUGE_SWEEP)}
        stroke={colors.surface}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
      />
      {clamped > 0.005 && (
        <Path
          d={arcPath(c, c, r, GAUGE_START, GAUGE_START + GAUGE_SWEEP * clamped)}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </Svg>
  );
}

// ---- Scaling helpers ----

/** Maps values to y positions, leaving room top and bottom. A flat series sits in the middle. */
function scaler(values: number[], height: number, padding: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return () => height / 2;
  return (v: number) => padding + (1 - (v - min) / (max - min)) * (height - padding * 2);
}

/** Measures its own width so charts can fill whatever space they're given. */
function useWidth(): [number, (e: { nativeEvent: { layout: { width: number } } }) => void] {
  const [width, setWidth] = useState(0);
  return [width, (e) => setWidth(e.nativeEvent.layout.width)];
}

// ---- Sparkline ----

/** A small line chart with a dot on each point, aligned to the right like a recent history. */
export function Sparkline({
  values,
  color,
  height = 48,
  slots = 5,
  band = false,
  square = false,
}: {
  values: number[];
  color: string;
  height?: number;
  /** How many points fit across; fewer values sit at the right edge. */
  slots?: number;
  /** Draws a soft band behind the line (used for estimates with a range). */
  band?: boolean;
  square?: boolean;
}) {
  const [width, onLayout] = useWidth();
  const shown = values.slice(-slots);
  const step = width / Math.max(slots, 2);
  const y = scaler(shown, height, 10);
  const points = shown.map((v, i) => {
    const x = width - 6 - (shown.length - 1 - i) * step;
    return [x, y(v)] as const;
  });

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && shown.length > 0 && (
        <Svg width={width} height={height}>
          {band && points.length > 1 && (
            <Rect
              x={points[0][0]}
              y={points[0][1] - 10}
              width={points[points.length - 1][0] - points[0][0]}
              height={20}
              fill={color}
              opacity={0.3}
            />
          )}
          {points.length > 1 && (
            <Polyline
              points={points.map(([x, py]) => `${x},${py}`).join(' ')}
              stroke={color}
              strokeWidth={2}
              fill="none"
            />
          )}
          {points.map(([x, py], i) =>
            square ? (
              <Rect
                key={i}
                x={x - 4}
                y={py - 4}
                width={8}
                height={8}
                stroke={color}
                strokeWidth={2}
                fill={colors.surface}
              />
            ) : (
              <Circle
                key={i}
                cx={x}
                cy={py}
                r={4.5}
                stroke={color}
                strokeWidth={2}
                fill={colors.surface}
              />
            ),
          )}
        </Svg>
      )}
    </View>
  );
}

// ---- Energy balance ----

/** Daily calories eaten (bars) against a dotted reference line (expenditure or targets). */
export function EnergyChart({
  reference,
  nutrition,
  lineColor,
  height = 200,
}: {
  reference: number[];
  nutrition: (number | null)[];
  lineColor: string;
  height?: number;
}) {
  const [width, onLayout] = useWidth();
  const eaten = nutrition.filter((n): n is number => n !== null);
  const all = [...reference, ...eaten];
  // A wide range keeps day-to-day differences gentle and leaves room for bars below the line.
  const max = Math.max(...all) * 1.15;
  const min = Math.min(...all) * 0.4;
  const y = (v: number) => height - ((v - min) / (max - min || 1)) * height;
  const step = width / Math.max(reference.length, 1);

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {nutrition.map((n, i) =>
            n === null ? null : (
              <Rect
                key={i}
                x={i * step + step * 0.2}
                y={y(n)}
                width={step * 0.6}
                height={height - y(n)}
                rx={2}
                fill={colors.calories}
              />
            ),
          )}
          <Polyline
            points={reference.map((v, i) => `${i * step + step / 2},${y(v)}`).join(' ')}
            stroke={lineColor}
            strokeWidth={3}
            strokeDasharray="0.1 7"
            strokeLinecap="round"
            fill="none"
          />
          <Line x1={0} x2={width} y1={height - 1} y2={height - 1} stroke={colors.track} />
        </Svg>
      )}
    </View>
  );
}
