import { ThirdPartyUpdatesLibraryCheck } from '../ThirdPartyUpdatesLibraryCheck';

const additionalProjectProps = {
  projectRoot: '/tmp/project',
  hasUnusedStaticConfig: false,
  staticConfigPath: null,
  dynamicConfigPath: null,
};

const expWithUpdates = {
  name: 'name',
  slug: 'slug',
  sdkVersion: '58.0.0',
  updates: { url: 'https://u.expo.dev/00000000-0000-0000-0000-000000000000' },
};

describe('runAsync', () => {
  it('returns isSuccessful = true if expo-updates is not installed', async () => {
    const check = new ThirdPartyUpdatesLibraryCheck();
    const result = await check.runAsync({
      pkg: {
        name: 'name',
        version: '1.0.0',
        dependencies: { 'react-native-update': '^10.0.0' },
      },
      exp: expWithUpdates,
      ...additionalProjectProps,
    });
    expect(result.isSuccessful).toBeTruthy();
    expect(result.issues).toEqual([]);
  });

  it('returns isSuccessful = true if only expo-updates is installed', async () => {
    const check = new ThirdPartyUpdatesLibraryCheck();
    const result = await check.runAsync({
      pkg: {
        name: 'name',
        version: '1.0.0',
        dependencies: { 'expo-updates': '~58.0.0' },
      },
      exp: expWithUpdates,
      ...additionalProjectProps,
    });
    expect(result.isSuccessful).toBeTruthy();
    expect(result.issues).toEqual([]);
  });

  it('returns isSuccessful = false if expo-updates is enabled alongside react-native-update', async () => {
    const check = new ThirdPartyUpdatesLibraryCheck();
    const result = await check.runAsync({
      pkg: {
        name: 'name',
        version: '1.0.0',
        dependencies: { 'expo-updates': '~58.0.0', 'react-native-update': '^10.0.0' },
      },
      exp: expWithUpdates,
      ...additionalProjectProps,
    });
    expect(result.isSuccessful).toBeFalsy();
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain('"react-native-update"');
    expect(result.advice).toHaveLength(1);
  });

  it('lists every conflicting library', async () => {
    const check = new ThirdPartyUpdatesLibraryCheck();
    const result = await check.runAsync({
      pkg: {
        name: 'name',
        version: '1.0.0',
        dependencies: {
          'expo-updates': '~58.0.0',
          'react-native-update': '^10.0.0',
          'react-native-code-push': '^9.0.0',
        },
      },
      exp: expWithUpdates,
      ...additionalProjectProps,
    });
    expect(result.isSuccessful).toBeFalsy();
    expect(result.issues[0]).toContain('"react-native-update", "react-native-code-push"');
  });

  it('returns isSuccessful = true if expo-updates is disabled in the app config', async () => {
    const check = new ThirdPartyUpdatesLibraryCheck();
    const result = await check.runAsync({
      pkg: {
        name: 'name',
        version: '1.0.0',
        dependencies: { 'expo-updates': '~58.0.0', 'react-native-update': '^10.0.0' },
      },
      exp: { ...expWithUpdates, updates: { ...expWithUpdates.updates, enabled: false } },
      ...additionalProjectProps,
    });
    expect(result.isSuccessful).toBeTruthy();
    expect(result.issues).toEqual([]);
  });

  it('returns isSuccessful = true if expo-updates has no update URL', async () => {
    const check = new ThirdPartyUpdatesLibraryCheck();
    const result = await check.runAsync({
      pkg: {
        name: 'name',
        version: '1.0.0',
        dependencies: { 'expo-updates': '~58.0.0', 'react-native-update': '^10.0.0' },
      },
      exp: { name: 'name', slug: 'slug', sdkVersion: '58.0.0' },
      ...additionalProjectProps,
    });
    expect(result.isSuccessful).toBeTruthy();
    expect(result.issues).toEqual([]);
  });
});
