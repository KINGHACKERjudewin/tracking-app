import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ClockTimePicker from './ClockTimePicker';
import DatePickerModal from './DatePickerModal';

export interface TaskData {
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: Date;
  estimatedHours: number;
  estimatedMinutes: number;
  notes: string;
  status: 'Todo' | 'In Progress' | 'Done';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: TaskData) => void;
  initial?: Partial<TaskData>;
}

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Other'];
const PRIORITIES = ['High', 'Medium', 'Low'] as const;
const STATUSES   = ['Todo', 'In Progress', 'Done'] as const;

export default function TaskEntryModal({ visible, onClose, onSave, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'Work');
  const [priority, setPriority] = useState<TaskData['priority']>(initial?.priority ?? 'Medium');
  const [status, setStatus] = useState<TaskData['status']>(initial?.status ?? 'Todo');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? new Date());
  const [time, setTime] = useState({ hour: initial?.estimatedHours ?? 1, minute: initial?.estimatedMinutes ?? 0, period: 'AM' as const });
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [showClock, setShowClock] = useState(false);
  const [showDate, setShowDate] = useState(false);

  const priorityColors: Record<string, string> = {
    High: colors.error, Medium: colors.warning, Low: colors.success,
  };
  const statusColors: Record<string, string> = {
    Todo: colors.textMuted, 'In Progress': colors.primary, Done: colors.success,
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, category, priority, dueDate, estimatedHours: time.hour, estimatedMinutes: time.minute, notes, status });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>New Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.chip, category === c && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Priority</Text>
                {PRIORITIES.map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[styles.selectRow, priority === p && { backgroundColor: priorityColors[p] + '18', borderColor: priorityColors[p] + '50' }]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: priorityColors[p] }]} />
                    <Text style={[styles.selectText, priority === p && { color: priorityColors[p] }]}>{p}</Text>
                    {priority === p && <Ionicons name="checkmark" size={14} color={priorityColors[p]} style={styles.check} />}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Status</Text>
                {STATUSES.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[styles.selectRow, status === s && { backgroundColor: statusColors[s] + '18', borderColor: statusColors[s] + '50' }]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: statusColors[s] }]} />
                    <Text style={[styles.selectText, status === s && { color: statusColors[s] }]} numberOfLines={1}>{s}</Text>
                    {status === s && <Ionicons name="checkmark" size={14} color={statusColors[s]} style={styles.check} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity style={styles.fieldBtn} onPress={() => setShowDate(true)}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={styles.fieldBtnText}>
                {dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Estimated Time</Text>
            <TouchableOpacity style={styles.fieldBtn} onPress={() => setShowClock(!showClock)}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.fieldBtnText}>
                {time.hour}h {String(time.minute).padStart(2, '0')}m
              </Text>
            </TouchableOpacity>

            {showClock && (
              <View style={styles.clockContainer}>
                <ClockTimePicker value={time} onChange={setTime} />
              </View>
            )}

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any notes..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Task</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <DatePickerModal visible={showDate} value={dueDate} onChange={setDueDate} onClose={() => setShowDate(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  label: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.textPrimary,
  },
  notesInput: { minHeight: 72, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.border, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  selectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.surfaceElevated, borderWidth: 1,
    borderColor: colors.border, marginBottom: 6,
  },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  selectText: { fontSize: 12, color: colors.textSecondary, flex: 1, fontWeight: '500' },
  check: { marginLeft: 'auto' },
  fieldBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surfaceElevated, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  fieldBtnText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  clockContainer: {
    alignItems: 'center', paddingVertical: 16,
    backgroundColor: colors.surfaceElevated, borderRadius: 16,
    marginTop: 8, borderWidth: 1, borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginTop: 24, marginBottom: 8,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
