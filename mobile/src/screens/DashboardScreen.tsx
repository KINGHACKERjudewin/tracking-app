import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { taskService, budgetService } from '../services/api';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const STATUS_COLORS: Record<string, string> = {
  'In Progress': colors.primary,
  Todo: colors.textMuted,
  Done: colors.success,
  Overdue: colors.error,
};

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const [tasks, setTasks]               = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary]           = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, bRes, sRes] = await Promise.all([
        taskService.getAll(),
        budgetService.getAll(),
        budgetService.summary(),
      ]);
      setTasks(tRes.data.slice(0, 5));
      setTransactions(bRes.data.slice(0, 5));
      setSummary(sRes.data);
    } catch {
      // silent — user sees empty state
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const done  = tasks.filter(t => t.status === 'Done').length;
  const total = tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const fmt = (n: number) =>
    Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <LinearGradient colors={['#1C1E30', '#141623']} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{GREETING()}</Text>
              <Text style={styles.userName}>{user?.name ?? 'User'} 👋</Text>
            </View>
            <LinearGradient colors={[colors.primary, '#9C91FF']} style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.dateText}>{today}</Text>
          {total > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Today's Progress</Text>
                <Text style={styles.progressPct}>{pct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${pct}%` as any }]} />
              </View>
            </View>
          )}
        </LinearGradient>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  title="Balance"
                  value={fmt(summary.balance)}
                  icon="wallet-outline"
                  gradient={['#1a1069', '#21D4FD'] as unknown as readonly [string, string]}
                  trend={summary.balance >= 0 ? { value: 'Positive', positive: true } : { value: 'Negative', positive: false }}
                />
                <StatCard
                  title="Tasks Done"
                  value={total ? `${done} / ${total}` : '0 tasks'}
                  icon="checkmark-circle-outline"
                  gradient={['#0f3443', '#34e89e'] as unknown as readonly [string, string]}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  title="Income"
                  value={fmt(summary.income)}
                  icon="arrow-up-circle-outline"
                  gradient={['#134e5e', '#71b280'] as unknown as readonly [string, string]}
                />
                <StatCard
                  title="Expenses"
                  value={fmt(summary.expense)}
                  icon="arrow-down-circle-outline"
                  gradient={['#4b0f1f', '#ff416c'] as unknown as readonly [string, string]}
                />
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                {[
                  { label: 'Add Task',    icon: 'add-circle-outline',  color: colors.primary,   screen: 'Productivity' },
                  { label: 'Add Entry',   icon: 'card-outline',         color: colors.success,   screen: 'Budget' },
                  { label: 'Start Timer', icon: 'timer-outline',        color: colors.warning,   screen: 'TimeTracker' },
                  { label: 'Reports',     icon: 'bar-chart-outline',    color: colors.secondary, screen: 'Reports' },
                ].map(a => (
                  <TouchableOpacity key={a.label} style={styles.quickBtn} onPress={() => navigation.navigate(a.screen)}>
                    <View style={[styles.quickIcon, { backgroundColor: a.color + '20' }]}>
                      <Ionicons name={a.icon as any} size={22} color={a.color} />
                    </View>
                    <Text style={styles.quickLabel}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Tasks */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Tasks</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Productivity')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {tasks.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="checkbox-outline" size={28} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No tasks yet</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Productivity')}>
                    <Text style={styles.emptyAction}>Add your first task</Text>
                  </TouchableOpacity>
                </View>
              ) : tasks.map(task => (
                <View key={task.id} style={styles.taskRow}>
                  <View style={[styles.taskDot, { backgroundColor: STATUS_COLORS[task.status] ?? colors.textMuted }]} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.taskMeta}>{task.category} · {task.priority}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: (STATUS_COLORS[task.status] ?? colors.textMuted) + '20' }]}>
                    <Text style={[styles.statusPillText, { color: STATUS_COLORS[task.status] ?? colors.textMuted }]}>{task.status}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Transactions */}
            <View style={[styles.section, { marginBottom: 24 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {transactions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="wallet-outline" size={28} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No transactions yet</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
                    <Text style={styles.emptyAction}>Add your first entry</Text>
                  </TouchableOpacity>
                </View>
              ) : transactions.map(t => (
                <View key={t.id} style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: t.type === 'Income' ? colors.incomeDim : colors.expenseDim }]}>
                    <Ionicons name={t.type === 'Income' ? 'arrow-up' : 'arrow-down'} size={16} color={t.type === 'Income' ? colors.income : colors.expense} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc} numberOfLines={1}>{t.description}</Text>
                    <Text style={styles.txCat}>{t.category}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: t.type === 'Income' ? colors.income : colors.expense }]}>
                    {t.type === 'Income' ? '+' : ''}{parseFloat(t.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },
  headerGradient: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  greeting: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  dateText: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: colors.white },
  progressSection: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  progressPct: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  statsGrid: { paddingHorizontal: 16, marginTop: 20, gap: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickBtn: { alignItems: 'center', gap: 8 },
  quickIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  emptyCard: { alignItems: 'center', paddingVertical: 28, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, gap: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted },
  emptyAction: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 10 },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  taskMeta: { fontSize: 11, color: colors.textMuted },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 12 },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  txCat: { fontSize: 11, color: colors.textMuted },
  txAmount: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
});
