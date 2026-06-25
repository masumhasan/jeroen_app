# Android Release Build Guide

## Prerequisites

- Android Studio installed with Android SDK
- Java 17+ installed
- `adb` available (comes with Android SDK platform-tools)
- Phone with **USB debugging enabled** (Settings → Developer Options → USB Debugging)

---

## Step 1 — Update the API URL (if backend changed)

Edit `src/services/api.ts` and `src/utils/imageUrl.ts` to point to the correct backend:

```ts
// src/services/api.ts
export const baseURL = 'http://<YOUR_EC2_IP>:5000/api';

// src/utils/imageUrl.ts
export const API_HOST = 'http://<YOUR_EC2_IP>:5000';
```

Current backend: `http://13.61.82.71:5000`

---

## Step 2 — Sync native files (run after changing app.json)

Only needed when `app.json` is changed (permissions, icons, plugins, etc.):

```bash
cd C:\20300\github\lisa\jeroen_app
npx expo prebuild --clean
```

> **Note:** This regenerates the entire `android/` folder from `app.json`. Skip this step if only JS/TS files changed.

---

## Step 3 — Build the release APK

```bash
cd C:\20300\github\lisa\jeroen_app\android
./gradlew assembleRelease
```

If the build fails with a **file lock error** on a lint cache file (common when the emulator or Android Studio is open):

```bash
# Stop all Gradle daemons first
./gradlew --stop

# Then rebuild, skipping the problematic lint task
./gradlew assembleRelease -x lintVitalAnalyzeRelease
```

Build time: ~10 minutes on first run, ~2-3 minutes on subsequent runs (incremental).

Output APK location:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Step 4 — Install on a physical device

Connect phone via USB (USB debugging on), then:

```bash
adb install app\build\outputs\apk\release\app-release.apk
```

If `adb` is not found:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install app\build\outputs\apk\release\app-release.apk
```

To install over an existing version (same package name):

```bash
adb install -r app\build\outputs\apk\release\app-release.apk
```

---

## Common Issues

### App cannot reach backend (Network Error)
- `android:usesCleartextTraffic="true"` must be in `android/app/src/main/AndroidManifest.xml`
- This is already set. If it disappears after `expo prebuild --clean`, it means `app.json` needs `"android": { "usesCleartextTraffic": true }` (already added).

### Build fails — file locked by another process
```bash
./gradlew --stop
./gradlew assembleRelease -x lintVitalAnalyzeRelease
```

### adb device not found
- Unplug and replug USB
- Check Developer Options → USB Debugging is on
- Accept the "Allow USB debugging?" prompt on the phone
- Try: `adb devices` to confirm the device is listed

### App shows blank/crash on launch
- The JS bundle is baked into the APK at build time — make sure the correct backend URL is set in Step 1 before building
- Check `adb logcat` for runtime errors

---

## Full clean rebuild (when in doubt)

```bash
cd C:\20300\github\lisa\jeroen_app

# 1. Regenerate native files
npx expo prebuild --clean

# 2. Stop any running Gradle daemons
cd android && ./gradlew --stop

# 3. Build
./gradlew assembleRelease -x lintVitalAnalyzeRelease

# 4. Install
adb install -r app\build\outputs\apk\release\app-release.apk
```
