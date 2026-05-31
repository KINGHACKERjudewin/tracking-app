import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const SAMPLE_TASKS = [
  { id: '1', title: 'Review Q2 report',    category: 'Work',     priority: 'High',   status: 'In Progress' },
  { id: '2', title: 'Gym session',         category: 'Health',   priority: 'Medium', status: 'Todo' },
  { id: '3', title: 'Read 30 pages',       category: 'Learning', priority: 'Low',    status: 'Todo' },
  { id: '4', title: 'Weekly team standup', category: 'Work',     priority: 'High',   status: 'Done' },
];

const SAMPLE_TRANSACTIONS = [
  { id: '1', description: 'Salary',       amount:  5000, category: 'Salary',  type: 'Income'  },
  { id: '2', description: 'Netflix',      amount:   -15, category: 'Sub.',    type: 'Expense' },
  { id: '3', description: 'Groceries',    amount:  -120, category: 'Food',    type: 'Expense' },
  { id: '4', description: 'Freelance UI', amount:   800, category: 'Freelance', type: 'Income' },
];

const STATUS_COLORS: Record<string, string> = {
  'In Progress': colors.primary,
  Todo: colors.textMuted,
  Done: colors.success,
  Overdue: colors.error,
};

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <LinearGradient
          colors={['#1C1E30', '#141623']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{GREETING()}</Text>
              <Text style={styles.userName}>{user?.name ?? 'User'} 👋</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn}>
              <LinearGradient colors={[colors.primary, '#9C91FF']} style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>{today}</Text>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <Text style={styles.progressPct}>75%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.progressFill, { width: '75%' }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Balance"
              value="$5,665"
              icon="wallet-outline"
              gradient={['#1a1069', '#21D4FD'] as unknown as readonly [string, string]}
              trend={{ value: '+12%', positive: true }}
            />
            <StatCard
              title="Tasks Done"
              value="12 / 16"
              icon="checkmark-circle-outline"
              gradient={['#0f3443', '#34e89e'] as unknown as readonly [string, string]}
              trend={{ value: '+3 today', positive: true }}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Hours Today"
              value="6.5h"
              icon="time-outline"
              gradient={['#41295a', '#2F0743'] as unknown as readonly [string, string]}
              subtitle="Goal: 8h"
            />
            <StatCard
              title="Streak"
              value="14 days"
              icon="flame-outline"
              gradient={['#f7971e', '#ffd200'] as unknown as readonly [string, string]}
              trend={{ value: 'Best: 21', positive: true }}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              { label: 'Add Task',   icon: 'add-circle-outline', color: colors.primary,   screen: 'Productivity' },
              { label: 'Add Entry',  icon: 'card-outline',        color: colors.success,   screen: 'Budget' },
              { label: 'Start Timer', icon: 'timer-outline',     color: colors.warning,   screen: 'TimeTracker' },
              { label: 'Reports',    icon: 'bar-chart-outline',   color: colors.secondary, screen: 'Reports' },
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
          {SAMPLE_TASKS.map(task => (
            <View key={task.id} style={styles.taskRow}>
              <View style={[styles.taskDot, { backgroundColor: STATUS_COLORS[task.status] }]} />
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                <Text style={styles.taskMeta}>{task.category} · {task.priority}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[task.status] + '20' }]}>
                <Text style={[styles.statusPillText, { color: STATUS_COLORS[task.status] }]}>{task.status}</Text>
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
          {SAMPLE_TRANSACTIONS.map(t => (
            <View key={t.id} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: t.type === 'Income' ? colors.incomeDim : colors.expenseDim }]}>
                <Ionicons
                  name={t.type === 'Income' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={t.type === 'Income' ? colors.income : colors.expense}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc} numberOfLines={1}>{t.description}</Text>
                <Text style={styles.txCat}>{t.category}</Text>
              </View>
              <Text style={[styles.txAmount, { color: t.type === 'Income' ? colors.income : colors.expense }]}>
                {t.type === 'Income' ? '+' : ''}{t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
              </Text>
            </View>
          ))}
        </View>
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
  dateText: { fontSize: 12, color: colors.textMuted, marginBottom: 20 },
  avatarBtn: { marginTop: 4 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: colors.white },
  progressSection: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  progressPct: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
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
