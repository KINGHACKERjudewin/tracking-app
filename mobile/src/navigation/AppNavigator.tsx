import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

import LoginScreen    from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen    from '../screens/DashboardScreen';
import ProductivityScreen from '../screens/ProductivityScreen';
import BudgetScreen       from '../screens/BudgetScreen';
import TimeTrackerScreen  from '../screens/TimeTrackerScreen';
import ReportsScreen      from '../screens/ReportsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
}

function TabIcon({ name, focused, label }: TabIconProps) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      {focused && (
        <LinearGradient colors={[colors.primary + '30', colors.primary + '10']} style={StyleSheet.absoluteFill} />
      )}
      <Ionicons name={name} size={22} color={focused ? colors.primary : colors.textMuted} />
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: 'Dashboard',    icon: 'home',       iconFilled: 'home'           },
    { key: 'Productivity', icon: 'checkbox-outline', iconFilled: 'checkbox'  },
    { key: 'Budget',       icon: 'wallet-outline',   iconFilled: 'wallet'    },
    { key: 'TimeTracker',  icon: 'timer-outline',    iconFilled: 'timer'     },
    { key: 'Reports',      icon: 'bar-chart-outline', iconFilled: 'bar-chart' },
  ];

  return (
    <View style={[tabStyles.bar, { paddingBottom: insets.bottom + 6 }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const tab = tabs.find(t => t.key === route.name) ?? tabs[0];
        const label = route.name === 'TimeTracker' ? 'Timer' : route.name;

        return (
          <TouchableOpacity
            key={route.key}
            style={tabStyles.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <TabIcon name={(focused ? tab.iconFilled : tab.icon) as any} focused={focused} label={label} />
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard"    component={DashboardScreen} />
      <Tab.Screen name="Productivity" component={ProductivityScreen} />
      <Tab.Screen name="Budget"       component={BudgetScreen} />
      <Tab.Screen name="TimeTracker"  component={TimeTrackerScreen} />
      <Tab.Screen name="Reports"      component={ReportsScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrapActive: {
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.primary,
  },
});
