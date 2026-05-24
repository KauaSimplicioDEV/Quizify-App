import { Redirect, Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { HomeTheme } from '@/constants/home-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { AUTH_LOGIN } from '@/lib/routes';

function TabBarBackground() {
  if (Platform.OS === 'web') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: HomeTheme.tabBarBg }]} />;
  }
  return <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />;
}

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const {
    tabBarHorizontalInset,
    tabBarHeight,
    tabBarLabelSize,
    tabBarIconSize,
    tabBarMaxWidth,
  } = useResponsive();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href={AUTH_LOGIN} />;
  }

  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: HomeTheme.link,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarStyle: {
          position: 'absolute',
          left: tabBarHorizontalInset,
          right: tabBarHorizontalInset,
          maxWidth: tabBarMaxWidth,
          alignSelf: 'center',
          bottom: bottomPad,
          height: tabBarHeight,
          borderRadius: tabBarHeight / 2,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: HomeTheme.glassBorder,
          backgroundColor: 'transparent',
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          paddingTop: 8,
        },
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: { fontSize: tabBarLabelSize, fontWeight: '700' },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={tabBarIconSize} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trophies"
        options={{
          title: 'Troféus',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={tabBarIconSize} name="trophy.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rank"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={tabBarIconSize} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={tabBarIconSize} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
