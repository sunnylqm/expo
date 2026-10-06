import type { DoctorCheck, DoctorCheckParams, DoctorCheckResult } from './checks.types';

/**
 * Over-the-air update libraries that pick the JS bundle to launch through the same
 * native hooks as expo-updates (`ExpoReactDelegateHandler.bundleURL` on iOS,
 * `ReactNativeHostHandler.getJSBundleFile` on Android).
 */
const THIRD_PARTY_UPDATES_LIBRARIES = ['react-native-update', 'react-native-code-push'];

export class ThirdPartyUpdatesLibraryCheck implements DoctorCheck {
  description =
    'Check that expo-updates is not enabled alongside another over-the-air update library';

  sdkVersionRange = '>=50.0.0';

  async runAsync({ pkg, exp }: DoctorCheckParams): Promise<DoctorCheckResult> {
    const dependencies = { ...pkg.devDependencies, ...pkg.dependencies };
    if (!dependencies['expo-updates']) {
      return { isSuccessful: true, issues: [], advice: [] };
    }

    const otherLibraries = THIRD_PARTY_UPDATES_LIBRARIES.filter((name) => !!dependencies[name]);
    if (otherLibraries.length === 0) {
      return { isSuccessful: true, issues: [], advice: [] };
    }

    // expo-updates only takes over bundle loading when it is enabled and has an update URL.
    // Without either, it falls back to its disabled controller and yields to other handlers.
    if (exp.updates?.enabled === false || !exp.updates?.url) {
      return { isSuccessful: true, issues: [], advice: [] };
    }

    const list = otherLibraries.map((name) => `"${name}"`).join(', ');

    return {
      isSuccessful: false,
      issues: [
        `expo-updates is enabled alongside ${list}. Both decide which JS bundle the app launches, and expo-updates takes precedence, so updates downloaded by ${list} will not be applied.`,
      ],
      advice: [
        `Use a single update library. To keep ${list}, uninstall expo-updates or set "updates.enabled" to false in your app config (in projects that don't use Continuous Native Generation, also set "EXUpdatesEnabled" in Expo.plist and "expo.modules.updates.ENABLED" in AndroidManifest.xml to false). To use EAS Update, uninstall ${list}.`,
      ],
    };
  }
}
