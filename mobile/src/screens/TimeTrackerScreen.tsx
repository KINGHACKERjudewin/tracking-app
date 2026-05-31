import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { timeService } from '../services/api';

const CLOCK_SIZE = 260;
const CENTER     = CLOCK_SIZE / 2;

function AnalogClock({ date }: { date: Date }) {
  const h = date.getHours() % 12;
  const m = date.getMinutes();
  const s = date.getSeconds();
  const secAngle  = (s / 60) * 360 - 90;
  const minAngle  = (m / 60) * 360 + (s / 60) * 6 - 90;
  const hourAngle = (h / 12) * 360 + (m / 60) * 30 - 90;
  const toXY = (deg: number, r: number) => ({
    x: CENTER + r * Math.cos((deg * Math.PI) / 180),
    y: CENTER + r * Math.sin((deg * Math.PI) / 180),
  });
  const secTip  = toXY(secAngle, 95);
  const minTip  = toXY(minAngle, 78);
  const hourTip = toXY(hourAngle, 55);
  return (
    <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
      <Circle cx={CENTER} cy={CENTER} r={CENTER - 4} fill={colors.surfaceElevated} stroke={colors.border} strokeWidth={1.5} />
      <Circle cx={CENTER} cy={CENTER} r={CENTER - 20} fill="none" stroke={colors.border} strokeWidth={0.5} strokeDasharray="2 8" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const r1 = CENTER - 10, r2 = CENTER - 20;
        return <Line key={i} x1={CENTER + r1 * Math.cos(angle)} y1={CENTER + r1 * Math.sin(angle)} x2={CENTER + r2 * Math.cos(angle)} y2={CENTER + r2 * Math.sin(angle)} stroke={i % 3 === 0 ? colors.textSecondary : colors.border} strokeWidth={i % 3 === 0 ? 2 : 1} strokeLinecap="round" />;
      })}
      <Line x1={CENTER} y1={CENTER} x2={hourTip.x} y2={hourTip.y} stroke={colors.textPrimary} strokeWidth={4} strokeLinecap="round" />
      <Line x1={CENTER} y1={CENTER} x2={minTip.x}  y2={minTip.y}  stroke={colors.primary}     strokeWidth={3} strokeLinecap="round" />
      <Line x1={CENTER} y1={CENTER} x2={secTip.x}  y2={secTip.y}  stroke={colors.error}       strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={CENTER} cy={CENTER} r={5} fill={colors.error} />
      <Circle cx={CENTER} cy={CENTER} r={2} fill={colors.textPrimary} />
    </Svg>
  );
}

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimeTrackerScreen() {
  const [now, setNow]             = useState(new Date());
  const [running, setRunning]     = useState(false);
  const [paused, setPaused]       = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [sessions, setSessions]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const startRef = useRef<number>(0);
  const accRef   = useRef<number>(0);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (running && !paused) {
      startRef.current = Date.now() - accRef.current;
      interval = setInterval(() => setElapsed(Date.now() - startRef.current), 200);
    }
    return () => clearInterval(interval);
  }, [running, paused]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await timeService.getSessions();
      setSessions(res.data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleStart = async () => {
    try {
      const res = await timeService.start({ task_name: 'Focus Session' });
      setActiveId(res.data.id);
      accRef.current = 0;
      setElapsed(0);
      setRunning(true);
      setPaused(false);
    } catch {}
  };

  const handlePause  = () => { accRef.current = elapsed; setPaused(true); };
  const handleResume = () => setPaused(false);

  const handleStop = async () => {
    if (activeId) {
      try { await timeService.stop(activeId, {}); } catch {}
      setActiveId(null);
    }
    setRunning(false);
    setPaused(false);
    setElapsed(0);
    accRef.current = 0;
    await load();
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalToday = sessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Time Tracker</Text>
        <LinearGradient colors={['#1C1E30', '#141623']} style={styles.clockCard}>
          <AnalogClock date={now} />
          <Text style={styles.digitalTime}>{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
          <Text style={styles.dateLabel}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </LinearGradient>

        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>{running ? (paused ? 'Paused' : 'Running') : 'Ready'}</Text>
          <Text style={[styles.timerDisplay, running && { color: colors.primary }]}>{formatElapsed(elapsed)}</Text>
          <View style={styles.controls}>
            {!running ? (
              <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                <LinearGradient colors={[colors.primary, '#9C91FF']} style={styles.startBtnGrad}>
                  <Ionicons name="play" size={28} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.runningControls}>
                <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.warningDim, borderColor: colors.warning + '50' }]} onPress={paused ? handleResume : handlePause}>
                  <Ionicons name={paused ? 'play' : 'pause'} size={22} color={colors.warning} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.errorDim, borderColor: colors.error + '50' }]} onPress={handleStop}>
                  <Ionicons name="stop" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.todaySummary}>
            <View style={styles.todayStat}>
              <Text style={styles.todayVal}>{formatDuration(totalToday)}</Text>
              <Text style={styles.todayLabel}>Today Total</Text>
            </View>
            <View style={styles.todayDivider} />
            <View style={styles.todayStat}>
              <Text style={styles.todayVal}>{sessions.length}</Text>
              <Text style={styles.todayLabel}>Sessions</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: 20 }} />
          ) : sessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="timer-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>No sessions yet — press play to start</Text>
            </View>
          ) : sessions.slice(0, 10).map((s, i) => (
            <View key={s.id} style={styles.sessionRow}>
              <View style={[styles.sessionIndex, { backgroundColor: colors.primaryDim }]}>
                <Text style={styles.sessionIndexText}>{sessions.length - i}</Text>
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTask}>{s.task_name}</Text>
                <Text style={styles.sessionStart}>{new Date(s.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={styles.sessionDuration}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={styles.sessionDurationText}>{formatDuration(s.duration_seconds ?? 0)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 16 },
  clockCard: { borderRadius: 24, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  digitalTime: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, letterSpacing: 2, marginTop: 12 },
  dateLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  timerCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 16, alignItems: 'center' },
  timerLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  timerDisplay: { fontSize: 48, fontWeight: '800', color: colors.textPrimary, letterSpacing: 2 },
  controls: { width: '100%', alignItems: 'center', marginVertical: 20 },
  startBtn: { borderRadius: 36, overflow: 'hidden' },
  startBtnGrad: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  runningControls: { flexDirection: 'row', gap: 20 },
  controlBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  todaySummary: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  todayStat: { alignItems: 'center', gap: 3 },
  todayVal: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  todayLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  todayDivider: { width: 1, height: 32, backgroundColor: colors.border },
  section: { marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  emptyCard: { alignItems: 'center', paddingVertical: 28, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, gap: 8 },
  emptyText: { fontSize: 13, color: colors.textMuted },
  sessionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 12 },
  sessionIndex: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sessionIndexText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  sessionInfo: { flex: 1 },
  sessionTask: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  sessionStart: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  sessionDuration: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceElevated, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  sessionDurationText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5 },
});
