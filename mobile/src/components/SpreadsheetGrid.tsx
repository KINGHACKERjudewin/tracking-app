import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export interface Column {
  key: string;
  label: string;
  width: number;
  type: 'text' | 'badge' | 'amount' | 'date' | 'status' | 'priority' | 'time';
  align?: 'left' | 'right' | 'center';
}

export interface GridRow {
  id: string;
  [key: string]: any;
}

interface Props {
  columns: Column[];
  data: GridRow[];
  onRowPress?: (row: GridRow) => void;
  onRowDelete?: (id: string) => void;
  emptyText?: string;
  fixedColumnKey?: string;
}

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Work:      { bg: colors.primaryDim,    text: colors.primary },
  Personal:  { bg: colors.secondaryDim,  text: colors.secondary },
  Health:    { bg: colors.successDim,    text: colors.success },
  Finance:   { bg: colors.goldDim,       text: colors.gold },
  Learning:  { bg: 'rgba(245,166,35,0.12)', text: colors.warning },
  Other:     { bg: colors.surfaceHigh,   text: colors.textSecondary },
  Food:      { bg: 'rgba(245,166,35,0.12)', text: colors.warning },
  Transport: { bg: colors.secondaryDim,  text: colors.secondary },
  Shopping:  { bg: colors.primaryDim,    text: colors.primary },
  Housing:   { bg: colors.goldDim,       text: colors.gold },
  Income:    { bg: colors.incomeDim,     text: colors.income },
  Expense:   { bg: colors.expenseDim,    text: colors.expense },
  Salary:    { bg: colors.incomeDim,     text: colors.income },
  Freelance: { bg: colors.successDim,    text: colors.success },
};

function PriorityBadge({ value }: { value: string }) {
  const map: Record<string, { color: string; icon: string }> = {
    High:   { color: colors.error,   icon: 'arrow-up' },
    Medium: { color: colors.warning, icon: 'remove' },
    Low:    { color: colors.success, icon: 'arrow-down' },
  };
  const cfg = map[value] ?? map.Medium;
  return (
    <View style={[styles.priorityBadge, { borderColor: cfg.color + '50', backgroundColor: cfg.color + '18' }]}>
      <Ionicons name={cfg.icon as any} size={10} color={cfg.color} />
      <Text style={[styles.priorityText, { color: cfg.color }]}>{value}</Text>
    </View>
  );
}

function StatusDot({ value }: { value: string }) {
  const map: Record<string, string> = {
    Todo:        colors.textMuted,
    'In Progress': colors.primary,
    Done:        colors.success,
    Overdue:     colors.error,
  };
  const color = map[value] ?? colors.textMuted;
  return (
    <View style={styles.statusRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{value}</Text>
    </View>
  );
}

function Cell({ col, value }: { col: Column; value: any }) {
  const align = col.align ?? 'left';
  const textAlign = align as any;

  if (col.type === 'priority') return <PriorityBadge value={String(value)} />;
  if (col.type === 'status')   return <StatusDot value={String(value)} />;

  if (col.type === 'badge') {
    const cfg = BADGE_COLORS[value] ?? { bg: colors.surfaceHigh, text: colors.textSecondary };
    return (
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.text }]} numberOfLines={1}>{value}</Text>
      </View>
    );
  }

  if (col.type === 'amount') {
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    const isIncome = num >= 0;
    const display = `${isIncome ? '+' : ''}${num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}`;
    return (
      <Text style={[styles.amountText, { color: isIncome ? colors.income : colors.expense, textAlign }]} numberOfLines={1}>
        {display}
      </Text>
    );
  }

  return (
    <Text style={[styles.cellText, { textAlign }]} numberOfLines={1}>
      {value ?? '—'}
    </Text>
  );
}

export default function SpreadsheetGrid({
  columns, data, onRowPress, onRowDelete, emptyText = 'No entries yet', fixedColumnKey,
}: Props) {
  const fixedCol = fixedColumnKey ? columns.find(c => c.key === fixedColumnKey) : columns[0];
  const scrollCols = columns.filter(c => c.key !== fixedCol?.key);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        {fixedCol && (
          <View style={[styles.headerCell, { width: fixedCol.width }]}>
            <Text style={styles.headerText}>{fixedCol.label}</Text>
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
          <View style={styles.headerScrollRow}>
            {scrollCols.map(col => (
              <View key={col.key} style={[styles.headerCell, { width: col.width, alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }]}>
                <Text style={styles.headerText}>{col.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Rows */}
      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="grid-outline" size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        data.map((row, index) => (
          <TouchableOpacity
            key={row.id}
            activeOpacity={0.7}
            onPress={() => onRowPress?.(row)}
            style={[styles.dataRow, index % 2 === 1 && styles.dataRowAlt]}
          >
            {fixedCol && (
              <View style={[styles.dataCell, { width: fixedCol.width }]}>
                <Cell col={fixedCol} value={row[fixedCol.key]} />
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.headerScrollRow}>
                {scrollCols.map(col => (
                  <View key={col.key} style={[styles.dataCell, { width: col.width, alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }]}>
                    <Cell col={col} value={row[col.key]} />
                  </View>
                ))}
                {onRowDelete && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onRowDelete(row.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  headerScrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCell: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: 52,
  },
  dataRowAlt: {
    backgroundColor: colors.surfaceElevated + '60',
  },
  dataCell: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '400',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    backgroundColor: colors.errorDim,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
