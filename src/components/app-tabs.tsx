import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

import { getTabIcon } from './navigation/tabIcons';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const home = getTabIcon('index');
  const vehicles = getTabIcon('vehicles');
  const maintenances = getTabIcon('maintenances');
  const designSystem = getTabIcon('design-system');

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{home.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={home.sf} md={home.md} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="vehicles">
        <NativeTabs.Trigger.Label>{vehicles.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={vehicles.sf} md={vehicles.md} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="maintenances">
        <NativeTabs.Trigger.Label>{maintenances.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={maintenances.sf} md={maintenances.md} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="design-system">
        <NativeTabs.Trigger.Label>{designSystem.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={designSystem.sf} md={designSystem.md} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
