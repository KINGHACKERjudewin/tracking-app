import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import SpreadsheetGrid, { Column, GridRow } from '../components/SpreadsheetGrid';
import TaskEntryModal, { TaskData } from '../components/TaskEntryModal';

const COLUMNS: Column[] = [
  { key: 'title',     label: 'Task',     width: 160, type: 'text' },
  { key: 'category',  label: 'Category', width: 110, type: 'badge' },
  { key: 'priority',  label: 'Priority', width: 100, type: 'priority' },
  { key: 'dueDate',   label: 'Due',      width: 90,  type: 'date', align: 'center' },
  { key: 'estTime',   label: 'Est.',     width: 70,  type: 'time', align: 'center' },
  { key: 'status',    label: 'Status',   width: 120, type: 'status' },
];

const SAMPLE: GridRow[] = [
  { id: '1', title: 'Redesign onboarding flow',   category: 'Work',     priority: 'High',   dueDate: 'Jun 5',  estTime: '4h',  status: 'In Progress' },
  { id: '2', title: 'Write monthly report',        category: 'Work',     priority: 'Medium', dueDate: 'Jun 8',  estTime: '2h',  status: 'Todo' },
  { id: '3', title: 'Morning run',                 category: 'Health',   priority: 'Medium', dueDate: 'Daily',  estTime: '45m', status: 'Done' },
  { id: '4', title: 'Finish React Native course',  category: 'Learning', priority: 'Low',    dueDate: 'Jun 20', estTime: '3h',  status: 'In Progress' },
  { id: '5', title: 'Review pull requests',        category: 'Work',     priority: 'High',   dueDate: 'Jun 4',  estTime: '1h',  status: 'Done' },
  { id: '6', title: 'Meal prep Sunday',            category: 'Health',   priority: 'Low',    dueDate: 'Jun 7',  estTime: '1h',  status: 'Todo' },
];

type Filter = 'All' | 'Todo' | 'In Progress' | 'Done';
const FILTERS: Filter[] = ['All', 'Todo', 'In Progress', 'Done'];

const FILTER_COLORS: Record<Filter, string> = {
  All: colors.primary,
  Todo: colors.textMuted,
  'In Progress': colors.warning,
  Done: colors.success,
};

export default function ProductivityScreen() {
  const [filter, setFilter] = useState<Filter>('All');
  const [tasks, setTasks] = useState<GridRow[]>(SAMPLE);
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'All' ? tasks.length : tasks.filter(t => t.status === f).length;
    return acc;
  }, {} as Record<Filter, number>);

  const handleSave = (data: TaskData) => {
    const row: GridRow = {
      id: Date.now().toString(),
      title: data.title,
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      estTime: `${data.estimatedHours}h${data.estimatedMinutes > 0 ? ` ${data.estimatedMinutes}m` : ''}`,
      status: data.status,
    };
    setTasks(t => [row, ...t]);
  };

  const done   = tasks.filter(t => t.status === 'Done').length;
  const pct    = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
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

        {/* Progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Completion Rate</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${pct}%` as any }]}
            />
          </View>
          <View style={styles.progressStats}>
            {[
              { label: 'Todo',        count: counts.Todo,          color: colors.textMuted },
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

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {FILTERS.map(f => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterTab, isActive && { backgroundColor: FILTER_COLORS[f] + '20', borderColor: FILTER_COLORS[f] }]}
              >
                <Text style={[styles.filterTabText, isActive && { color: FILTER_COLORS[f] }]}>{f}</Text>
                <View style={[styles.filterBadge, { backgroundColor: isActive ? FILTER_COLORS[f] : colors.border }]}>
                  <Text style={[styles.filterBadgeText, { color: isActive ? colors.white : colors.textMuted }]}>{counts[f]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Grid */}
        <View style={styles.gridSection}>
          <SpreadsheetGrid
            columns={COLUMNS}
            data={filtered}
            onRowDelete={id => setTasks(t => t.filter(r => r.id !== id))}
            emptyText={`No ${filter === 'All' ? '' : filter.toLowerCase() + ' '}tasks`}
          />
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
});
