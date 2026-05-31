import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { taskService, budgetService, timeService } from '../services/api';

type Period = 'Week' | 'Month' | 'Year';

function EmptyChart({ message }: { message: string }) {
  return (
    <View style={styles.emptyChart}>
      <Ionicons name="bar-chart-outline" size={32} color={colors.textMuted} />
      <Text style={styles.emptyChartText}>{message}</Text>
    </View>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const [period, setPeriod]   = useState<Period>('Month');
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState({
    totalTasks: 0, doneTasks: 0, todoTasks: 0, inProgressTasks: 0,
    income: 0, expense: 0, balance: 0,
    totalSessions: 0, totalSeconds: 0,
    categoryBreakdown: [] as { category: string; total: number }[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const now   = new Date();
      const month = now.getMonth() + 1;
      const year  = now.getFullYear();

      const [tRes, sRes, timeRes] = await Promise.all([
        taskService.getAll(),
        budgetService.summary(),
        timeService.getSessions(),
      ]);

      const tasks    = tRes.data;
      const sessions = timeRes.data;

      // Category breakdown from budget
      const catMap: Record<string, number> = {};
      const allBudget = await budgetService.getAll();
      allBudget.data.filter((e: any) => e.type === 'Expense').forEach((e: any) => {
        catMap[e.category] = (catMap[e.category] ?? 0) + Math.abs(parseFloat(e.amount));
      });
      const categoryBreakdown = Object.entries(catMap)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setData({
        totalTasks:       tasks.length,
        doneTasks:        tasks.filter((t: any) => t.status === 'Done').length,
        todoTasks:        tasks.filter((t: any) => t.status === 'Todo').length,
        inProgressTasks:  tasks.filter((t: any) => t.status === 'In Progress').length,
        income:           sRes.data.income,
        expense:          sRes.data.expense,
        balance:          sRes.data.balance,
        totalSessions:    sessions.length,
        totalSeconds:     sessions.reduce((s: number, r: any) => s + (r.duration_seconds ?? 0), 0),
        categoryBreakdown,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const completionRate = data.totalTasks ? Math.round((data.doneTasks / data.totalTasks) * 100) : 0;

  const CAT_COLORS = [colors.primary, colors.secondary, colors.gold, colors.success, colors.warning];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reports</Text>

        {loading ? (
          <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : (
          <>
            {/* Productivity Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Productivity</Text>
              {data.totalTasks === 0 ? (
                <EmptyChart message="No tasks yet — add tasks to see stats" />
              ) : (
                <>
                  <View style={styles.bigStat}>
                    <Text style={styles.bigStatValue}>{completionRate}%</Text>
                    <Text style={styles.bigStatLabel}>Completion Rate</Text>
                  </View>
                  <StatRow label="Total Tasks"   value={String(data.totalTasks)}      color={colors.textSecondary} />
                  <StatRow label="Done"          value={String(data.doneTasks)}        color={colors.success} />
                  <StatRow label="In Progress"   value={String(data.inProgressTasks)} color={colors.warning} />
                  <StatRow label="Todo"          value={String(data.todoTasks)}        color={colors.textMuted} />
                </>
              )}
            </View>

            {/* Budget Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Finance</Text>
              {data.income === 0 && data.expense === 0 ? (
                <EmptyChart message="No transactions yet — add budget entries to see stats" />
              ) : (
                <>
                  <View style={styles.bigStat}>
                    <Text style={[styles.bigStatValue, { color: data.balance >= 0 ? colors.income : colors.expense }]}>
                      {data.balance >= 0 ? '+' : ''}{fmt(data.balance)}
                    </Text>
                    <Text style={styles.bigStatLabel}>Net Balance</Text>
                  </View>
                  <StatRow label="Total Income"   value={fmt(data.income)}   color={colors.income} />
                  <StatRow label="Total Expenses" value={fmt(data.expense)}  color={colors.expense} />
                  {data.categoryBreakdown.length > 0 && (
                    <>
                      <Text style={styles.subTitle}>Top Expense Categories</Text>
                      {data.categoryBreakdown.map((c, i) => (
                        <StatRow key={c.category} label={c.category} value={fmt(c.total)} color={CAT_COLORS[i % CAT_COLORS.length]} />
                      ))}
                    </>
                  )}
                </>
              )}
            </View>

            {/* Time Summary */}
            <View style={[styles.card, { marginBottom: 8 }]}>
              <Text style={styles.cardTitle}>Time Tracking</Text>
              {data.totalSessions === 0 ? (
                <EmptyChart message="No sessions yet — start the timer to track time" />
              ) : (
                <>
                  <View style={styles.bigStat}>
                    <Text style={styles.bigStatValue}>{fmtTime(data.totalSeconds)}</Text>
                    <Text style={styles.bigStatLabel}>Total Time Tracked</Text>
                  </View>
                  <StatRow label="Total Sessions" value={String(data.totalSessions)} color={colors.primary} />
                  <StatRow label="Avg per Session" value={fmtTime(data.totalSeconds / data.totalSessions)} color={colors.secondary} />
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 16 },
  loader: { paddingTop: 80, alignItems: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  bigStat: { alignItems: 'center', paddingVertical: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  bigStatValue: { fontSize: 36, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  bigStatLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  statDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  statLabel: { flex: 1, fontSize: 13, color: colors.textSecondary },
  statValue: { fontSize: 14, fontWeight: '700' },
  subTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
  emptyChart: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyChartText: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
