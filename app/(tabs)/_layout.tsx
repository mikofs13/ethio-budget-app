import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useFinance } from '@/store/FinanceStore';

export default function TabLayout() {
  const { colors } = useFinance();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
        tabBarStyle: {
          backgroundColor: colors.tab,
          borderTopColor: colors.line,
          height: 68,
          paddingBottom: 9,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="grid" color={color} />,
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: 'Import',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="scan" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="receipt" color={color} />,
        }}
      />
    </Tabs>
  );
}
