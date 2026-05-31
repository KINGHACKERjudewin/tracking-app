import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  value: { hour: number; minute: number; period: 'AM' | 'PM' };
  onChange: (v: { hour: number; minute: number; period: 'AM' | 'PM' }) => void;
}

const SIZE = 260;
const CENTER = SIZE / 2;
const HAND_LEN = 88;
const NUM_RADIUS = 96;

function angleForHour(h: number) {
  return ((h % 12) / 12) * 2 * Math.PI - Math.PI / 2;
}
function angleForMinute(m: number) {
  return (m / 60) * 2 * Math.PI - Math.PI / 2;
}

export default function ClockTimePicker({ value, onChange }: Props) {
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');

  const setFromAngle = useCallback((px: number, py: number) => {
    const dx = px - CENTER;
    const dy = py - CENTER;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const normalised = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    if (mode === 'hour') {
      let h = Math.round((normalised / (2 * Math.PI)) * 12);
      if (h === 0) h = 12;
      onChange({ ...value, hour: h });
      setMode('minute');
    } else {
      const m = Math.round((normalised / (2 * Math.PI)) * 60) % 60;
      const snapped = Math.round(m / 5) * 5 % 60;
      onChange({ ...value, minute: snapped });
    }
  }, [mode, value, onChange]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: e => setFromAngle(e.nativeEvent.locationX, e.nativeEvent.locationY),
    onPanResponderMove: e => setFromAngle(e.nativeEvent.locationX, e.nativeEvent.locationY),
  });

  const handAngle = mode === 'hour'
    ? angleForHour(value.hour)
    : angleForMinute(value.minute);

  const handX = CENTER + HAND_LEN * Math.cos(handAngle);
  const handY = CENTER + HAND_LEN * Math.sin(handAngle);

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const labels = mode === 'hour' ? hours : minutes;

  const displayHour = value.hour === 0 ? 12 : value.hour > 12 ? value.hour - 12 : value.hour;
  const displayMinute = String(value.minute).padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Digital display */}
      <View style={styles.digital}>
        <TouchableOpacity onPress={() => setMode('hour')} style={[styles.timeSegment, mode === 'hour' && styles.timeSegmentActive]}>
          <Text style={[styles.timeText, mode === 'hour' && styles.timeTextActive]}>
            {String(displayHour).padStart(2, '0')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.colon}>:</Text>
        <TouchableOpacity onPress={() => setMode('minute')} style={[styles.timeSegment, mode === 'minute' && styles.timeSegmentActive]}>
          <Text style={[styles.timeText, mode === 'minute' && styles.timeTextActive]}>
            {displayMinute}
          </Text>
        </TouchableOpacity>
        <View style={styles.periodToggle}>
          {(['AM', 'PM'] as const).map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => onChange({ ...value, period: p })}
              style={[styles.periodBtn, value.period === p && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, value.period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mode label */}
      <Text style={styles.modeLabel}>Select {mode === 'hour' ? 'Hour' : 'Minute'}</Text>

      {/* Clock Face */}
      <View style={styles.clockWrap} {...panResponder.panHandlers}>
        <Svg width={SIZE} height={SIZE}>
          {/* Outer ring */}
          <Circle cx={CENTER} cy={CENTER} r={CENTER - 4} fill={colors.surfaceElevated} stroke={colors.border} strokeWidth={1.5} />

          {/* Hand */}
          <Line x1={CENTER} y1={CENTER} x2={handX} y2={handY} stroke={colors.primary} strokeWidth={3} strokeLinecap="round" />

          {/* Center dot */}
          <Circle cx={CENTER} cy={CENTER} r={5} fill={colors.primary} />

          {/* Hand tip */}
          <Circle cx={handX} cy={handY} r={22} fill={colors.primary} />
          <SvgText x={handX} y={handY + 5} textAnchor="middle" fill={colors.white} fontSize={13} fontWeight="700">
            {mode === 'hour' ? displayHour : displayMinute}
          </SvgText>

          {/* Numbers */}
          {labels.map((label, i) => {
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const x = CENTER + NUM_RADIUS * Math.cos(angle);
            const y = CENTER + NUM_RADIUS * Math.sin(angle);
            const isSelected = mode === 'hour'
              ? label === displayHour
              : label === value.minute;
            return (
              <G key={label}>
                {isSelected && <Circle cx={x} cy={y} r={18} fill={colors.primaryDim} />}
                <SvgText
                  x={x} y={y + 5}
                  textAnchor="middle"
                  fill={isSelected ? colors.primary : colors.textSecondary}
                  fontSize={13}
                  fontWeight={isSelected ? '700' : '400'}
                >
                  {String(label).padStart(label >= 10 ? 2 : 1, ' ')}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  digital: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  timeSegment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSegmentActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  timeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  timeTextActive: {
    color: colors.primary,
  },
  colon: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  periodToggle: {
    marginLeft: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
  },
  periodBtnActive: {
    backgroundColor: colors.primaryDim,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  periodTextActive: {
    color: colors.primary,
  },
  modeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  clockWrap: {
    width: SIZE,
    height: SIZE,
  },
});
