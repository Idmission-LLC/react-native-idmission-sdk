# IDmission React Native Module — Integration Guide

**Package:** `react-native-idmission-sdk`
**Android native SDK:** 11.1.19.2.05
**iOS native SDK:** 11.1.19.2.2
**Minimum React Native:** 0.83

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|-----------------|-------|
| Node | 20 | Run `node --version` to check |
| React Native | 0.83 | Bare workflow or a custom dev client — **not** Expo Go |
| Android minSdk | 26 (Android 8.0) | Required by the IDmission native SDK |
| Android compileSdk | 36 | |
| Java | 17 | |
| iOS deployment target | 15.6 | |
| CocoaPods | latest | `sudo gem install cocoapods` |

---

## Step 1 — Install the package

Install the module directly from git. No Google Drive download is required.

```bash
npm install git+https://github.com/Idmission-LLC/react-native-idmission-sdk.git#v11.1.19
```

or with Yarn:

```bash
yarn add git+https://github.com/Idmission-LLC/react-native-idmission-sdk.git#v11.1.19
```

The `#v11.1.19` suffix pins the install to the release tag — do not track `main`.

React Native **autolinking** discovers the native module automatically; you do **not** edit `MainApplication`, register a package, or drag files into Xcode.

---

## Step 2 — Android setup

### 2a. Add the IDmission Maven repository

The native SDK (`idmission-mediumsdk`) is published to IDmission's private GitLab Maven registry. Add the repository to your **project-level** `android/build.gradle`:

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url "https://gitlab.idmission.com/api/v4/projects/220/packages/maven"
            name "GitLab"
            credentials(HttpHeaderCredentials) {
                name = "Private-Token"
                value = "WESesyuSD9fQeqNEyig6"
            }
            authentication {
                header(HttpHeaderAuthentication)
            }
        }
        // Required for fingerprint capture transitive dependencies
        maven { url 'https://jitpack.io' }
    }
}
```

### 2b. Set SDK versions

Confirm your `android/build.gradle` `ext` block (or `android/app/build.gradle`) targets the versions the SDK requires:

```groovy
buildscript {
    ext {
        minSdkVersion = 26       // Required — the SDK uses APIs introduced in API 26
        compileSdkVersion = 36
        targetSdkVersion = 36
    }
}
```

> **minSdk 26 is mandatory.** A lower `minSdkVersion` fails the manifest merge against the IDmission native SDK.

### 2c. Enable multidex (if needed)

The native SDK pushes the app over the 64K method limit on some configurations. The packaged module already sets `multiDexEnabled true`; ensure your **app** module (`android/app/build.gradle`) does too:

```groovy
android {
    defaultConfig {
        multiDexEnabled true
    }
}
```

> **Physical device required:** the IDentity SDK requires a physical Android device — the Android Emulator does not support camera capture and will not run the SDK flows.

---

## Step 3 — iOS setup

### 3a. Update your Podfile

Declare the IDmission pod inside your app target in `ios/Podfile`. A complete Podfile looks like this:

```ruby
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, '15.6'
prepare_react_native_project!

# NOTE: do NOT add `use_modular_headers!` here. This wrapper mixes Objective-C and
# Swift and relies on the generated `react_native_idmission_sdk-Swift.h`; modular
# headers create a circular module dependency that makes the Swift class invisible
# to Objective-C ("Use of undeclared identifier 'IDentitySDKHelper'").
target 'YourAppName' do
  config = use_native_modules!

  pod 'IDentityMediumSDK2.0'

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )

    # Fix fmt 11.0.2 build failure on Xcode 26 / Apple Clang 21:
    # "Call to consteval function 'fmt::basic_format_string...' is not a constant
    # expression". fmt's FMT_USE_CONSTEVAL block has no #ifndef guard, so a -D flag
    # can't override it; force the first branch instead. Disabling consteval only
    # moves fmt's format-string checks from compile time to runtime.
    fmt_base = File.join(__dir__, 'Pods', 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      text = File.read(fmt_base)
      original = "#if !defined(__cpp_lib_is_constant_evaluated)\n#  define FMT_USE_CONSTEVAL 0"
      replacement = "#if 1 // Podfile patch: disable fmt consteval (Xcode 26 / Clang 21)\n#  define FMT_USE_CONSTEVAL 0"
      if text.include?(original)
        File.write(fmt_base, text.sub(original, replacement))
      end
    end
  end
end
```

Replace `YourAppName` with your app target's name.

> **Xcode 26 / Swift 6.3 users:** the `fmt` patch in `post_install` above is required. Without it the build fails with a `fmt` consteval error.

> **Upgrading from 11.1.13 or earlier?** The iOS SDK no longer depends on Google ML Kit. Remove `pod 'GoogleMLKit/TextRecognition'`, the `cocoapods-user-defined-build-types` plugin lines, and the `SWIFT_ENABLE_EXPLICIT_MODULES` `post_install` patch from your Podfile, then re-run `pod install`.

### 3b. Run pod install

```bash
cd ios
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
cd ..
```

This downloads the IDentityMediumSDK frameworks. Allow a few minutes on a clean install.

> **UTF-8 locale:** the `LANG` / `LC_ALL` prefixes avoid the CocoaPods `Unicode Normalization not appropriate for ASCII-8BIT` error. Add `export LANG=en_US.UTF-8` to your shell profile to make this permanent.

### 3c. Add required Info.plist permissions

Open `ios/YourAppName/Info.plist` and add the following keys. A missing key causes an immediate crash on iOS 14+:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required to capture identity documents and verify your face.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Microphone access may be required during identity verification.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is required to select identity documents for verification.</string>
```

---

## Step 4 — Import and subscribe to results

The native module delivers all results asynchronously through the `DataCallback` event. Subscribe once (for example in a `useEffect` or `componentDidMount`), and remember to remove the subscription on unmount.

```js
import { IDMissionSDK, addDataCallbackListener } from 'react-native-idmission-sdk';

useEffect(() => {
  const subscription = addDataCallbackListener((event) => {
    // event.data is a JSON string for results, or a status/error message
    console.log('IDmission result:', event.data);
  });
  return () => subscription.remove();
}, []);
```

---

## Step 5 — Initialize the SDK

Call `initializeSDK` once before invoking any service. The `DataCallback` event fires with `"SDK Successfully Initialized"` (or an error message) when initialization completes. You need an access token — see [Getting an access token](#getting-an-access-token) below.

```js
IDMissionSDK.initializeSDK(
  'https://kyc.idmission.com/',  // apiBaseUrl — provided by IDmission
  '',                            // authUrl — deprecated and ignored; pass '' or your old value
  'n',                           // debug: 'y' enables verbose logging, 'n' disables it
  'YOUR_ACCESS_TOKEN',           // accessToken — provided by IDmission
  {                              // options — optional, these are the defaults
    language: 'en',               // 'en' or 'es' (Android also 'my' and 'ar')
    enableGPS: true,              // capture GPS location with submissions
    geolocationRequired: false,   // block the flow if the user denies location access
    isUpdateModelsData: true,     // download the latest SDK models after credential verification
    enableScreenRecording: false, // allow screen recording / screenshots during capture
  }
);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `apiBaseUrl` | `string` | Base URL for IDmission API calls. Provided by IDmission for your environment. |
| `authUrl` | `string` | **Deprecated and ignored** — the SDK no longer uses it. Kept so existing calls keep working. |
| `debug` | `string` | `'y'` enables verbose SDK logging. Use `'n'` in production. |
| `accessToken` | `string` | Your IDmission API access token. |
| `options` | `object` (optional) | `{ language, enableGPS, geolocationRequired, isUpdateModelsData, enableScreenRecording }`. Defaults `'en'`, `true`, `false`, `true`, `false`. `language` is `'en'` or `'es'` (Android also `'my'` and `'ar'`); unknown values fall back to `'en'`. Omitted keys keep their default, and calling `initializeSDK` with four arguments still works. |

### Optional: SDK version and model names

`getSDKInfo()` returns a Promise with the native SDK version and the ML model files in use. `models` is empty until the SDK has been initialized.

```js
const { version, models } = await IDMissionSDK.getSDKInfo();
// version: e.g. "IOS_Medium_11.1.19_2_2"
// models:  [{ name: 'Face Detector', value: 'face_detection_full_range_sparse.tflite' }, ...]
```

### Getting an access token

The plugin does not create access tokens. Your app requests one from IDmission's authentication service and passes it to `initializeSDK`. You need the **Login ID**, **Password**, **Client ID** and **Client Secret** that IDmission issued to you.

**Token URL.** Replace the leading `api` in your API base URL's host with `auth`:

| API base URL | Token URL |
|--------------|-----------|
| `https://api.idmission.com/` | `https://auth.idmission.com/auth/realms/identity/protocol/openid-connect/token` |
| `https://apidemo.idmission.com/` | `https://demoauth.idmission.com/auth/realms/identity/protocol/openid-connect/token` |
| `https://apiuat.idmission.com/` | `https://uatauth.idmission.com/auth/realms/identity/protocol/openid-connect/token` |

For any other environment, use the token URL provided by IDmission.

**Request.** `POST` to the token URL with `Content-Type: application/x-www-form-urlencoded` and these fields:

| Field | Value |
|-------|-------|
| `grant_type` | `password` |
| `client_id` | Your Client ID |
| `client_secret` | Your Client Secret |
| `username` | Your Login ID |
| `password` | Your Password |
| `scope` | `api_access` |

```bash
curl -X POST 'https://auth.idmission.com/auth/realms/identity/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=password' \
  --data-urlencode 'client_id=YOUR_CLIENT_ID' \
  --data-urlencode 'client_secret=YOUR_CLIENT_SECRET' \
  --data-urlencode 'username=YOUR_LOGIN_ID' \
  --data-urlencode 'password=YOUR_PASSWORD' \
  --data-urlencode 'scope=api_access'
```

The JSON response contains the token in `access_token`. If the request fails, the response contains `error` and `error_description`.

```js
async function fetchAccessToken(tokenUrl, credentials) {
  // credentials: { client_id, client_secret, username, password }
  const body = new URLSearchParams({
    grant_type: 'password',
    scope: 'api_access',
    ...credentials,
  }).toString();

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await response.json();
  if (!json.access_token) {
    throw new Error(json.error_description || json.error || 'Token request failed');
  }
  return json.access_token;
}
```

> **Security:** do not ship the Client Secret or the user's password inside a production app. Request the token from your own backend, or have the user enter or scan the credentials at run time, and pass only the resulting `access_token` to the SDK. The `example/` app fetches the token on the device for demonstration only.

---

## Step 6 — Call identity services

Each service launches the native capture flow. When the flow finishes, call `submitResult()` to submit the captured data; the response arrives on the `DataCallback` listener.

### Service ID 20 — ID Validation

Captures and validates a government-issued ID document.

```js
IDMissionSDK.serviceID20();
// after capture completes:
IDMissionSDK.submitResult();
```

### Service ID 10 — ID Validation and Face Match

Captures an ID document and performs a liveness face match against the photo on the ID.

```js
IDMissionSDK.serviceID10();
IDMissionSDK.submitResult();
```

### Service ID 185 — Identify Customer

Identifies an unknown individual against enrolled customer profiles.

```js
IDMissionSDK.serviceID185();
IDMissionSDK.submitResult();
```

### Service ID 660 — Live Face Check

Performs a liveness detection check without document capture.

```js
IDMissionSDK.serviceID660();
IDMissionSDK.submitResult();
```

### Service ID 50 — ID Validation and Customer Enrollment

Validates an ID document and enrolls the customer biometric profile.

```js
IDMissionSDK.serviceID50(uniqueCustomerNumber); // string identifier
IDMissionSDK.submitResult();
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `uniqueCustomerNumber` | `string` | Your system's unique identifier for this customer. |

### Service ID 175 — Customer Biometric Enrollment

Enrolls or updates a customer's biometric profile without document capture.

```js
IDMissionSDK.serviceID175(uniqueCustomerNumber);
IDMissionSDK.submitResult();
```

### Service ID 105 — Customer Verification

Verifies a returning customer against their enrolled biometric profile.

```js
IDMissionSDK.serviceID105(uniqueCustomerNumber);
IDMissionSDK.submitResult();
```

---

## Step 7 — Handle the response

The `DataCallback` payload's `data` field is a JSON string for service results, or a plain status/error message. Parse defensively:

```js
addDataCallbackListener((event) => {
  try {
    const parsed = JSON.parse(event.data);
    // process structured result
  } catch (e) {
    // event.data was a status or error message, not JSON
    console.log('Status:', event.data);
  }
});
```

---

## Migrating from the zip archive install

If you previously integrated the wrapper by downloading a zip from Google Drive, switch to the git-based install:

1. **Remove copied JavaScript** that came from the zip's `react-native` folder if you no longer need it (keep your own screens).
2. **Remove copied Android sources** — delete the `IDMissionSDK.java` and `IDMissionPackage.java` files you copied into your app (typically under `android/app/src/main/java/<your-package>/`).
3. **Remove the manual package registration** — in `MainApplication.kt`/`.java`, delete the `add(IDMissionPackage())` line. Autolinking now registers the module.
4. **Revert app `build.gradle`** — remove the direct `implementation 'com.idmission.sdk2:idmission-mediumsdk:...'` line if you added it; the package declares it. Keep the Maven repository from Step 2a.
5. **Remove copied iOS sources** — delete `IDMissionSDK.h/.m` and the Swift helper files you dragged into Xcode, and remove their bridging-header entries.
6. **Install the package** as described in Step 1, then run `cd ios && pod install`.

---

## Troubleshooting

### `The package 'react-native-idmission-sdk' doesn't seem to be linked`
Rebuild the app after installing (`npm run android` / `npm run ios`). On iOS, run `pod install` in `ios/` first. Autolinking only takes effect on a fresh native build.

### `Could not resolve com.idmission.sdk2:idmission-mediumsdk`
The GitLab Maven repository or credentials are missing from your project-level `android/build.gradle`. Confirm the `Private-Token` value matches `WESesyuSD9fQeqNEyig6` (Step 2a).

### `Manifest merger failed ... uses-sdk:minSdkVersion`
Your app's `minSdkVersion` is below 26. Raise it to 26 (Step 2b).

### `pod install` fails: `Unable to find a specification for 'IDentityMediumSDK2.0'`
Run `pod repo update`, then re-run `pod install`.

### iOS build error: `Undefined symbol` / `framework not found`
Re-run `pod install --repo-update`, then clean the build folder in Xcode (**Product → Clean Build Folder**) and rebuild.

### iOS build error: `Call to consteval function 'fmt::basic_format_string...'`
Xcode 26 / Apple Clang 21 with fmt 11.0.2. Apply the `fmt/base.h` patch in the `post_install` block (Step 3a), then re-run `pod install`.

### iOS build error: `Use of undeclared identifier 'IDentitySDKHelper'`
Remove `use_modular_headers!` from your Podfile — it creates a circular module dependency that hides the wrapper's Swift class from Objective-C.

### Camera / crash on first launch (iOS)
All three of `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, and `NSPhotoLibraryUsageDescription` must be present in `Info.plist` (Step 3c).

---

## Example app

A working example app is included in [`example/`](example/). It demonstrates every service call and shows the full Podfile and Android build configuration.

```bash
cd example
npm install
# Android (physical device)
npm run android
# iOS
cd ios && LANG=en_US.UTF-8 pod install && cd ..
npm run ios
```
