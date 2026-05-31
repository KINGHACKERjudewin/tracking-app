import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import DatePickerModal from './DatePickerModal';

export interface BudgetData {
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: Date;
  notes: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: BudgetData) => void;
}

const INCOME_CATEGORIES  = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Shopping', 'Health', 'Entertainment', 'Subscriptions', 'Other'];

export default function BudgetEntryModal({ visible, onClose, onSave }: Props) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDate, setShowDate] = useState(false);

  const categories = type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!description.trim() || !amount) return;
    const num = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    onSave({ description, amount: type === 'Expense' ? -num : num, type, category, date, notes });
    setDescription(''); setAmount(''); setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>New Entry</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Type toggle */}
            <View style={styles.typeToggle}>
              {(['Expense', 'Income'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeBtn,
                    type === t && { backgroundColor: t === 'Income' ? colors.incomeDim : colors.expenseDim, borderColor: t === 'Income' ? colors.income : colors.expense },
                  ]}
                  onPress={() => { setType(t); setCategory(t === 'Income' ? 'Salary' : 'Food'); }}
                >
                  <Ionicons
                    name={t === 'Income' ? 'arrow-up-circle' : 'arrow-down-circle'}
                    size={18}
                    color={type === t ? (t === 'Income' ? colors.income : colors.expense) : colors.textMuted}
                  />
                  <Text style={[styles.typeBtnText, type === t && { color: t === 'Income' ? colors.income : colors.expense }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currencySymbol, { color: type === 'Income' ? colors.income : colors.expense }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: type === 'Income' ? colors.income : colors.expense }]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="What was this for?"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.catGrid}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.catChip, category === c && styles.catChipActive]}
                >
                  <Text style={[styles.catChipText, category === c && styles.catChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.fieldBtn} onPress={() => setShowDate(true)}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={styles.fieldBtnText}>
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any notes..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: type === 'Income' ? colors.success : colors.primary }]}
              onPress={handleSave}
            >
              <Ionicons name={type === 'Income' ? 'arrow-up-circle' : 'arrow-down-circle'} size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>Save {type}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <DatePickerModal visible={showDate} value={date} onChange={setDate} onClose={() => setShowDate(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: colors.border, paddingBottom: 40, maxHeight: '90%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  typeToggle: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5, borderColor: colors.border,
  },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
  currencySymbol: { fontSize: 24, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '700', paddingVertical: 12 },
  input: { backgroundColor: colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
  notesInput: { minHeight: 60, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  catChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  catChipTextActive: { color: colors.primary, fontWeight: '700' },
  fieldBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  fieldBtnText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15, marginTop: 24, marginBottom: 8 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
