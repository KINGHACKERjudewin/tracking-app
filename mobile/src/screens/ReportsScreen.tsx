import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Text as SvgText, Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

type Period = 'Week' | 'Month' | 'Year';

const PROD_DATA = {
  Week:  [3, 5, 2, 7, 4, 6, 5],
  Month: [18, 22, 15, 25, 20, 28, 16, 24, 30, 22, 18, 26],
  Year:  [85, 92, 78, 104, 95, 112, 98, 105, 88, 116, 102, 120],
};

const BUDGET_CATS = [
  { label: 'Food',      value: 132, color: colors.warning },
  { label: 'Transport', value: 38,  color: colors.secondary },
  { label: 'Housing',   value: 85,  color: colors.primary },
  { label: 'Health',    value: 45,  color: colors.success },
  { label: 'Other',     value: 28,  color: colors.gold },
];

const WEEK_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['1','4','8','12','16','20','24','28'];
const YEAR_LABELS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function BarChart({ data, labels, color1, color2 }: { data: number[]; labels: string[]; color1: string; color2: string }) {
  const max = Math.max(...data);
  const W = 320, H = 140, PAD = 24, BAR_W = Math.max(8, (W - PAD * 2) / data.length - 6);

  return (
    <Svg width={W} height={H + 20}>
      {data.map((v, i) => {
        const barH = (v / max) * H;
        const x = PAD + i * ((W - PAD * 2) / data.length) + ((W - PAD * 2) / data.length - BAR_W) / 2;
        const y = H - barH;
        const labelI = Math.floor(i * (labels.length / data.length));
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={BAR_W} height={barH} rx={4} fill={color1} opacity={0.8} />
            {i % Math.ceil(data.length / labels.length) === 0 && (
              <SvgText x={x + BAR_W / 2} y={H + 16} textAnchor="middle" fontSize={9} fill={colors.textMuted}>
                {labels[labelI] ?? ''}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function DonutChart({ data }: { data: typeof BUDGET_CATS }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 70, CX = 90, CY = 90;
  let cumAngle = -Math.PI / 2;
  const arcs = data.map(d => {
    const frac  = d.value / total;
    const angle = frac * 2 * Math.PI;
    const x1 = CX + R * Math.cos(cumAngle);
    const y1 = CY + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = CX + R * Math.cos(cumAngle);
    const y2 = CY + R * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const IR = 46;
    const ix1 = CX + IR * Math.cos(cumAngle - angle);
    const iy1 = CY + IR * Math.sin(cumAngle - angle);
    const ix2 = CX + IR * Math.cos(cumAngle);
    const iy2 = CY + IR * Math.sin(cumAngle);
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${IR} ${IR} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { ...d, path, frac };
  });

  return (
    <View style={styles.donutWrap}>
      <Svg width={180} height={180}>
        {arcs.map(a => <Path key={a.label} d={a.path} fill={a.color} />)}
        <Circle cx={CX} cy={CY} r={40} fill={colors.surface} />
        <SvgText x={CX} y={CY - 6} textAnchor="middle" fill={colors.textPrimary} fontSize={14} fontWeight="700">$328</SvgText>
        <SvgText x={CX} y={CY + 10} textAnchor="middle" fill={colors.textMuted} fontSize={9}>Total spent</SvgText>
      </Svg>
      <View style={styles.legend}>
        {data.map(d => (
          <View key={d.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text style={styles.legendLabel}>{d.label}</Text>
            <Text style={styles.legendValue}>${d.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const [period, setPeriod] = useState<Period>('Week');
  const data = PROD_DATA[period];
  const labels = period === 'Week' ? WEEK_LABELS : period === 'Month' ? MONTH_LABELS : YEAR_LABELS;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reports</Text>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {(['Week', 'Month', 'Year'] as Period[]).map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            >
              <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Productivity chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Tasks Completed</Text>
              <Text style={styles.cardSub}>
                {period === 'Week' ? 'This week' : period === 'Month' ? 'This month' : 'This year'}
              </Text>
            </View>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatVal}>{data.reduce((a, b) => a + b, 0)}</Text>
              <Text style={styles.cardStatLabel}>total</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart data={data} labels={labels} color1={colors.primary} color2={colors.secondary} />
          </ScrollView>
          <View style={styles.chartStats}>
            {[
              { label: 'Average', value: Math.round(data.reduce((a, b) => a + b, 0) / data.length) },
              { label: 'Best',    value: Math.max(...data) },
              { label: 'Worst',   value: Math.min(...data) },
            ].map(s => (
              <View key={s.label} style={styles.chartStat}>
                <Text style={styles.chartStatVal}>{s.value}</Text>
                <Text style={styles.chartStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Budget breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Spending Breakdown</Text>
              <Text style={styles.cardSub}>By category this month</Text>
            </View>
          </View>
          <DonutChart data={BUDGET_CATS} />
        </View>

        {/* Insight cards */}
        <View style={styles.insightRow}>
          {[
            { title: 'Most Productive', value: 'Thursday', icon: '🏆', sub: '7 tasks done' },
            { title: 'Top Expense',     value: 'Housing',  icon: '🏠', sub: '$85 spent' },
          ].map(ins => (
            <LinearGradient key={ins.title} colors={['#1C1E30', '#141623']} style={styles.insightCard}>
              <Text style={styles.insightIcon}>{ins.icon}</Text>
              <Text style={styles.insightTitle}>{ins.title}</Text>
              <Text style={styles.insightValue}>{ins.value}</Text>
              <Text style={styles.insightSub}>{ins.sub}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Time tracking summary */}
        <View style={[styles.card, { marginBottom: 8 }]}>
          <Text style={styles.cardTitle}>Time Tracked This Week</Text>
          <View style={styles.timeBar}>
            {[
              { label: 'Mon', hours: 6.5, color: colors.primary },
              { label: 'Tue', hours: 7.2, color: colors.primary },
              { label: 'Wed', hours: 4.0, color: colors.warning },
              { label: 'Thu', hours: 8.0, color: colors.success },
              { label: 'Fri', hours: 5.5, color: colors.primary },
              { label: 'Sat', hours: 2.0, color: colors.textMuted },
              { label: 'Sun', hours: 1.0, color: colors.textMuted },
            ].map(d => (
              <View key={d.label} style={styles.timeBarItem}>
                <Text style={styles.timeBarHours}>{d.hours}h</Text>
                <View style={styles.timeBarTrack}>
                  <View style={[styles.timeBarFill, { height: `${(d.hours / 8) * 100}%` as any, backgroundColor: d.color }]} />
                </View>
                <Text style={styles.timeBarLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 16 },
  periodRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  periodBtnActive: { backgroundColor: colors.surfaceElevated },
  periodBtnText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  periodBtnTextActive: { color: colors.textPrimary },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cardStat: { alignItems: 'flex-end' },
  cardStatVal: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  cardStatLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  chartStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  chartStat: { alignItems: 'center', gap: 2 },
  chartStatVal: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  chartStatLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  donutWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  legendValue: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  insightRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  insightCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  insightIcon: { fontSize: 22, marginBottom: 6 },
  insightTitle: { fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  insightValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  insightSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  timeBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, marginTop: 12 },
  timeBarItem: { alignItems: 'center', flex: 1, gap: 4 },
  timeBarHours: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },
  timeBarTrack: { flex: 1, width: 20, backgroundColor: colors.surfaceElevated, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  timeBarFill: { width: '100%', borderRadius: 4 },
  timeBarLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },
});
