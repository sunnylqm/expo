---
'expo-doctor': patch
---

Warn when `expo-updates` is enabled alongside another over-the-air update library (`react-native-update` or `react-native-code-push`). Both select the JS bundle the app launches through the same native hooks, and `expo-updates` takes precedence, so updates downloaded by the other library are silently ignored.
