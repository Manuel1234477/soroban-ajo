import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/store/authStore';
import { useBiometrics } from '../src/hooks/useBiometrics';
import { useTheme, ThemeProvider } from '../src/hooks/useTheme';
import { BiometricPrompt } from '../src/components/BiometricPrompt';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { TwoFactorScreen } from '../src/screens/auth/TwoFactorScreen';
import { Button } from '../src/components/ui/Button';
import { Spacing, Typography } from '../src/constants/theme';

SplashScreen.preventAutoHideAsync();

function BiometricGate() {
  const { requiresBiometric, unlockWithBiometric, logout } = useAuthStore();
  const { supportedTypes, authenticate } = useBiometrics();
  const { colors } = useTheme();
  const [showPrompt, setShowPrompt] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuth = async () => {
    setIsAuthenticating(true);
    const success = await authenticate('Unlock Ajo');
    setIsAuthenticating(false);
    if (success) {
      unlockWithBiometric();
    }
  };

  if (!requiresBiometric) return null;

  return (
    <View style={[gateStyles.container, { backgroundColor: colors.surface[50] }]}>
      <Text style={[gateStyles.title, { color: colors.surface[900] }]}>Ajo is locked</Text>
      <Text style={[gateStyles.sub, { color: colors.surface[500] }]}>Authenticate to continue</Text>
      <Button title="Unlock" onPress={handleAuth} loading={isAuthenticating} size="lg" style={gateStyles.btn} />
      <Button title="Sign Out" onPress={logout} variant="ghost" style={gateStyles.btn} />
      <BiometricPrompt
        visible={showPrompt}
        supportedTypes={supportedTypes}
        promptMessage="Unlock Ajo"
        onAuthenticate={handleAuth}
        onDismiss={() => setShowPrompt(false)}
        isLoading={isAuthenticating}
      />
    </View>
  );
}

const gateStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  title: { ...Typography.h2 },
  sub: { ...Typography.body },
  btn: { width: '100%' },
});

function AppContent() {
  const { initialize, isLoading, requiresBiometric, twoFactorChallenge } = useAuthStore();
  const { isDark } = useTheme();
  const { colors } = useTheme();
  const handleDeepLink = () => {};

  useEffect(() => {
    initialize().finally(() => SplashScreen.hideAsync());

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink();
    });

    return () => {
      subscription.remove();
    };
  }, [initialize]);

  if (isLoading) return null;

  if (requiresBiometric) return <BiometricGate />;

  if (twoFactorChallenge) return <TwoFactorScreen />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="groups/[id]/index" options={{ headerShown: true, title: 'Group Details' }} />
        <Stack.Screen name="groups/[id]/contribute" options={{ headerShown: true, title: 'Make Contribution' }} />
        <Stack.Screen name="groups/create" options={{ headerShown: true, title: 'Create Group' }} />
        <Stack.Screen name="qr" options={{ headerShown: true, title: 'Scan QR Code', presentation: 'modal' }} />
        <Stack.Screen name="biometric-settings" options={{ headerShown: true, title: 'Biometric Authentication' }} />
        <Stack.Screen name="group-qr/[id]" options={{ headerShown: true, title: 'Group QR Code', presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
