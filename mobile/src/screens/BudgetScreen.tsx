import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import SpreadsheetGrid, { Column, GridRow } from '../components/SpreadsheetGrid';
import BudgetEntryModal, { BudgetData } from '../components/BudgetEntryModal';
import { budgetService } from '../services/api';

const COLUMNS: Column[] = [
  { key: 'description', label: 'Description', width: 150, type: 'text' },
  { key: 'category',    label: 'Category',    width: 110, type: 'badge' },
  { key: 'type',        label: 'Type',        width: 90,  type: 'badge',   align: 'center' },
  { key: 'date',        label: 'Date',        width: 90,  type: 'date',    align: 'center' },
  { key: 'amount',      label: 'Amount',      width: 100, type: 'amount',  align: 'right' },
];

type Filter = 'All' | 'Income' | 'Expense';

function BalanceSummary({ income, expense }: { income: number; expense: number }) {
  const balance = income - expense;
  const pct = income ? Math.min(Math.round((expense / income) * 100), 100) : 0;
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <LinearGradient colors={['#1C1E30', '#141623']} style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>Net Balance</Text>
      <Text style={[styles.summaryBalance, { color: balance >= 0 ? colors.income : colors.expense }]}>
        {balance >= 0 ? '+' : ''}{fmt(balance)}
      </Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.incomeDim }]}>
            <Ionicons name="arrow-up" size={14} color={colors.income} />
          </View>
          <View>
            <Text style={styles.summaryItemLabel}>Income</Text>
            <Text style={[styles.summaryItemValue, { color: colors.income }]}>{fmt(income)}</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.expenseDim }]}>
            <Ionicons name="arrow-down" size={14} color={colors.expense} />
          </View>
          <View>
            <Text style={styles.summaryItemLabel}>Expenses</Text>
            <Text style={[styles.summaryItemValue, { color: colors.expense }]}>{fmt(expense)}</Text>
          </View>
        </View>
      </View>
      {income > 0 && (
        <>
          <View style={styles.spendBar}>
            <View style={[styles.spendFill, { width: `${pct}%` as any, backgroundColor: pct > 80 ? colors.error : colors.warning }]} />
          </View>
          <Text style={styles.spendLabel}>{pct}% of income spent</Text>
        </>
      )}
    </LinearGradient>
  );
}

export default function BudgetScreen() {
  const [filter, setFilter]       = useState<Filter>('All');
  const [entries, setEntries]     = useState<GridRow[]>([]);
  const [summary, setSummary]     = useState({ income: 0, expense: 0 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([budgetService.getAll(), budgetService.summary()]);
      const rows: GridRow[] = eRes.data.map((e: any) => ({
        id:          e.id,
        description: e.description,
        category:    e.category,
        type:        e.type,
        date:        new Date(e.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount:      parseFloat(e.amount),
      }));
      setEntries(rows);
      setSummary({ income: sRes.data.income, expense: sRes.data.expense });
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = filter === 'All' ? entries : entries.filter(e => e.type === filter);

  const handleSave = async (data: BudgetData) => {
    try {
      await budgetService.create({
        description: data.description,
        amount:      data.amount,
        type:        data.type,
        category:    data.category,
        entry_date:  data.date.toISOString().split('T')[0],
        notes:       data.notes,
      });
      await load();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await budgetService.remove(id);
      setEntries(e => e.filter(r => r.id !== id));
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Budget</Text>
            <Text style={styles.screenSub}>{entries.length} transactions</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <LinearGradient colors={[colors.success, '#2EE89A']} style={styles.addBtnGrad}>
              <Ionicons name="add" size={22} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <BalanceSummary income={summary.income} expense={summary.expense} />
        </View>

        <View style={styles.filterRow}>
          {(['All', 'Income', 'Expense'] as Filter[]).map(f => {
            const isActive = filter === f;
            const fc = f === 'Income' ? colors.income : f === 'Expense' ? colors.expense : colors.primary;
            return (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterTab, isActive && { backgroundColor: fc + '18', borderColor: fc }]}>
                {f !== 'All' && <Ionicons name={f === 'Income' ? 'arrow-up-circle' : 'arrow-down-circle'} size={14} color={isActive ? fc : colors.textMuted} />}
                <Text style={[styles.filterTabText, isActive && { color: fc }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.gridSection}>
          {loading ? (
            <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>
          ) : (
            <SpreadsheetGrid columns={COLUMNS} data={filtered} onRowDelete={handleDelete} emptyText="No entries yet — tap + to add one" />
          )}
        </View>
      </ScrollView>

      <BudgetEntryModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
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
  summaryCard: { borderRadius: 20, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  summaryLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  summaryBalance: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 18 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  summaryItemLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  summaryItemValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  summaryDivider: { width: 1, height: 36, backgroundColor: colors.border },
  spendBar: { marginTop: 16, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  spendFill: { height: '100%', borderRadius: 2 },
  spendLabel: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 12 },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterTabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  gridSection: { paddingHorizontal: 16 },
  loader: { paddingVertical: 40, alignItems: 'center' },
});
