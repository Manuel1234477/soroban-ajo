import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useGroupStore } from '../../store/groupStore';
import { useAuthStore } from '../../store/authStore';
import { useTokenStore } from '../../store/tokenStore';
import { useTheme } from '../../hooks/useTheme';
import { contribute } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';

export function ContributeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedGroup } = useGroupStore();
  const { session } = useAuthStore();
  const { tokens, selectedTokenId, setSelectedToken, convertAmount, getUsdValue } = useTokenStore();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const group = selectedGroup;
  if (!group) return null;

  const selectedToken = tokens.find((t) => t.id === (group.contributionTokenId || 'native')) || tokens[0];
  const contributionAmount = group.contributionAmount;
  const usdValue = getUsdValue(contributionAmount, selectedToken.id);
  const alternativeAmount = selectedTokenId !== selectedToken.id
    ? convertAmount(contributionAmount, selectedToken.id, selectedTokenId)
    : null;
  const alternativeToken = tokens.find((t) => t.id === selectedTokenId);

  const handleContribute = async () => {
    const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
    if (biometricAvailable) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Confirm contribution of ${contributionAmount} ${selectedToken.code}`,
        fallbackLabel: 'Use Passcode',
      });
      if (!result.success) return;
    }

    setLoading(true);
    try {
      await contribute(group.id, contributionAmount, 'SIGNED_XDR_PLACEHOLDER', selectedToken.id);
      Alert.alert('Success', 'Contribution submitted successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Contribution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface[50] }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={[styles.summaryCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.label, { color: colors.surface[500] }]}>Group</Text>
          <Text style={[styles.value, { color: colors.surface[800] }]}>{group.name}</Text>

          <Text style={[styles.label, { color: colors.surface[500], marginTop: Spacing.md }]}>Token</Text>
          <View style={styles.tokenRow}>
            {tokens.map((token) => (
              <TouchableOpacity
                key={token.id}
                style={[
                  styles.tokenChip,
                  {
                    backgroundColor: selectedTokenId === token.id ? colors.primary : colors.surface[100],
                    borderColor: selectedTokenId === token.id ? colors.primary : colors.surface[300],
                  },
                ]}
                onPress={() => setSelectedToken(token.id)}
              >
                <Text
                  style={[
                    styles.tokenChipText,
                    { color: selectedTokenId === token.id ? colors.white : colors.surface[700] },
                  ]}
                >
                  {token.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.surface[500], marginTop: Spacing.md }]}>Amount</Text>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {contributionAmount} {selectedToken.code}
          </Text>
          {alternativeAmount && (
            <Text style={[styles.alternative, { color: colors.surface[500] }]}>
              ≈ {alternativeAmount.toFixed(2)} {alternativeToken?.code} (${usdValue.toFixed(2)} USD)
            </Text>
          )}
          {!alternativeAmount && (
            <Text style={[styles.usdValue, { color: colors.surface[400] }]}>
              ≈ ${usdValue.toFixed(2)} USD
            </Text>
          )}

          <Text style={[styles.label, { color: colors.surface[500], marginTop: Spacing.md }]}>From Wallet</Text>
          <Text style={[styles.value, { color: colors.surface[800] }]} numberOfLines={1}>
            {session?.address ?? '—'}
          </Text>
        </Card>

        <Card style={[styles.infoCard, { backgroundColor: colors.surface[100] }]} padding="sm">
          <Text style={[styles.infoText, { color: colors.surface[600] }]}>
            Your contribution will be recorded on the Stellar blockchain via a Soroban smart contract.
            Biometric confirmation is required to authorize the transaction.
          </Text>
        </Card>

        <Button
          title={`Contribute ${contributionAmount} ${selectedToken.code}`}
          onPress={handleContribute}
          loading={loading}
          size="lg"
          style={styles.btn}
        />
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="ghost"
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  summaryCard: { gap: Spacing.xs },
  label: { ...Typography.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { ...Typography.body },
  amount: { ...Typography.h2 },
  alternative: { ...Typography.bodySmall, marginTop: Spacing.xs },
  usdValue: { ...Typography.bodySmall, marginTop: Spacing.xs },
  tokenRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  tokenChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tokenChipText: { ...Typography.label },
  infoCard: {},
  infoText: { ...Typography.bodySmall, lineHeight: 20 },
  btn: { width: '100%' },
});