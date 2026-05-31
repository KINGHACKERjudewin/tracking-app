import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import SpreadsheetGrid, { Column, GridRow } from '../components/SpreadsheetGrid';
import TaskEntryModal, { TaskData } from '../components/TaskEntryModal';
import { taskService } from '../services/api';

const COLUMNS: Column[] = [
  { key: 'title',    label: 'Task',     width: 160, type: 'text' },
  { key: 'category', label: 'Category', width: 110, type: 'badge' },
  { key: 'priority', label: 'Priority', width: 100, type: 'priority' },
  { key: 'dueDate',  label: 'Due',      width: 90,  type: 'date',   align: 'center' },
  { key: 'estTime',  label: 'Est.',     width: 70,  type: 'time',   align: 'center' },
  { key: 'status',   label: 'Status',   width: 120, type: 'status' },
];

type Filter = 'All' | 'Todo' | 'In Progress' | 'Done';
const FILTERS: Filter[] = ['All', 'Todo', 'In Progress', 'Done'];
const FILTER_COLORS: Record<Filter, string> = {
  All: colors.primary, Todo: colors.textMuted, 'In Progress': colors.warning, Done: colors.success,
};

export default function ProductivityScreen() {
  const [filter, setFilter]       = useState<Filter>('All');
  const [tasks, setTasks]         = useState<GridRow[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await taskService.getAll();
      const rows: GridRow[] = res.data.map((t: any) => ({
        id:       t.id,
        title:    t.title,
        category: t.category,
        priority: t.priority,
        dueDate:  t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        estTime:  t.estimated_hours > 0 ? `${t.estimated_hours}h${t.estimated_minutes > 0 ? ` ${t.estimated_minutes}m` : ''}` : '—',
        status:   t.status,
      }));
      setTasks(rows);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'All' ? tasks.length : tasks.filter(t => t.status === f).length;
    return acc;
  }, {} as Record<Filter, number>);

  const done = tasks.filter(t => t.status === 'Done').length;
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const handleSave = async (data: TaskData) => {
    try {
      await taskService.create({
        title:             data.title,
        category:          data.category,
        priority:          data.priority,
        status:            data.status,
        due_date:          data.dueDate.toISOString().split('T')[0],
        estimated_hours:   data.estimatedHours,
        estimated_minutes: data.estimatedMinutes,
        notes:             data.notes,
      });
      await load();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await taskService.remove(id);
      setTasks(t => t.filter(r => r.id !== id));
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Productivity</Text>
            <Text style={styles.screenSub}>{tasks.length} tasks · {done} completed</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <LinearGradient colors={[colors.primary, '#9C91FF']} style={styles.addBtnGrad}>
              <Ionicons name="add" size={22} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {tasks.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <Text style={styles.progressLabel}>Completion Rate</Text>
              <Text style={styles.progressPct}>{pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${pct}%` as any }]} />
            </View>
            <View style={styles.progressStats}>
              {[
                { label: 'Todo',        count: counts.Todo,           color: colors.textMuted },
                { label: 'In Progress', count: counts['In Progress'], color: colors.warning },
                { label: 'Done',        count: counts.Done,           color: colors.success },
              ].map(s => (
                <View key={s.label} style={styles.progressStat}>
                  <Text style={[styles.progressStatNum, { color: s.color }]}>{s.count}</Text>
                  <Text style={styles.progressStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {FILTERS.map(f => {
            const isActive = filter === f;
            return (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterTab, isActive && { backgroundColor: FILTER_COLORS[f] + '20', borderColor: FILTER_COLORS[f] }]}>
                <Text style={[styles.filterTabText, isActive && { color: FILTER_COLORS[f] }]}>{f}</Text>
                <View style={[styles.filterBadge, { backgroundColor: isActive ? FILTER_COLORS[f] : colors.border }]}>
                  <Text style={[styles.filterBadgeText, { color: isActive ? colors.white : colors.textMuted }]}>{counts[f]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.gridSection}>
          {loading ? (
            <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>
          ) : (
            <SpreadsheetGrid columns={COLUMNS} data={filtered} onRowDelete={handleDelete} emptyText="No tasks yet — tap + to add one" />
          )}
        </View>
      </ScrollView>

      <TaskEntryModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  screenSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  addBtn: { borderRadius: 14, overflow: 'hidden' },
  addBtnGrad: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  progressCard: { marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  progressPct: { fontSize: 13, fontWeight: '700', color: colors.primary },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-around' },
  progressStat: { alignItems: 'center', gap: 2 },
  progressStatNum: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  progressStatLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  filterRow: { marginVertical: 12 },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterTabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterBadge: { minWidth: 20, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8, alignItems: 'center' },
  filterBadgeText: { fontSize: 10, fontWeight: '700' },
  gridSection: { paddingHorizontal: 16 },
  loader: { paddingVertical: 40, alignItems: 'center' },
});
