# Changelog

## 11.1.19

**Android native SDK: 11.1.19.2.05**
**iOS native SDK: 11.1.19.2.2**

### Android
* Bumped `idmission-mediumsdk` to 11.1.19.2.05

### iOS
* Bumped IDentityMediumSDK2.0 to 11.1.19.2.2
* Removed the `GoogleMLKit/TextRecognition` dependency — the iOS SDK no longer uses Google ML Kit (21 fewer pods)
* The `cocoapods-user-defined-build-types` plugin and the `SWIFT_ENABLE_EXPLICIT_MODULES = NO` workaround are no longer required

### React Native wrapper
* `initializeSDK` accepts an optional fifth argument `{ language, enableGPS, geolocationRequired, isUpdateModelsData, enableScreenRecording }` that maps to the native SDK's initializer (defaults `'en'`, true, false, true, false; `language` is `'en'`/`'es'`, and on Android also `'my'`/`'ar'`). Existing four-argument calls are unchanged
* `authUrl` is deprecated and ignored — the native SDK no longer uses it. The argument is kept so existing calls keep working
* iOS: removed the copy of the sample app's `UserDefaults` helper; the API base URL and access token are passed directly to the SDK
* Added `getSDKInfo()`, returning the native SDK version and the ML model names in use
* iOS: capture services now return the result object exactly as the SDK returns it (e.g. `ValidateIdResult`) as JSON, generated from the object's own properties — nothing is renamed, filtered or masked. `UIImage` values are written as base64 JPEG strings. The plugin no longer returns the full API request
* Example app: **QR-code login** — a *Scan QR* button on the configuration page reads a configuration QR code (Login ID, Password, Client ID, Client Secret, URL), fills in the credentials, selects the matching environment and generates the access token (uses `react-native-camera-kit`)
* Example app: the single screen is now **two pages** — *Identity React* (configuration: credentials, token, SDK options, Initialize SDK) and *Identity Services* (the service buttons and results). Both pages use a dark app bar with a centered title, matching the Flutter example
* Example app: the access-token auth URL is now derived from the API base URL with the same table as the native IDentity apps. KYC-UK (`identity.london…`) now uses `https://auth.london.idmission.xyz/` and KYC-US (`identity.virginia…`) uses `https://auth.idmission.com/` (previously `identityauth.*`, which was wrong); the lab API base URL now includes port 9043, like iOS
* Example app: the result screen pretty-prints the result with base64 masked for display, and shows thumbnails of the captured images with a full-screen viewer
* Example app: Settings screen matches the native IDentity app (paired fields, new option switches, SDK version and model list), settings persist after a successful initialization, and the QR scanner header is fixed on iOS

## 11.1.13

**Android native SDK: 11.1.13.2.18**
**iOS native SDK: 11.1.13.2.3**

### Android
* Bumped `idmission-mediumsdk` to 11.1.13.2.18

### iOS
* Bumped IDentityMediumSDK2.0 to 11.1.13.2.3
* Removed the bundled `IDentityMediumModels` pod to reduce app size (~21 MB smaller IPA); the ML models are no longer shipped inside the app

## 11.1.7

**Android native SDK: 11.1.07.2.23 — Released 28 April 2026**
**iOS native SDK: 11.1.7.2.7**

### Android
* Added customizable properties for enhanced UI flexibility
* Updated DocumentDetect model with ID back-side prediction for improved document recognition
* Reduced overall SDK package size
* Implemented a timeout timer during capture to streamline user workflows
* Aligned prompt and error messaging on ID and Selfie screens with iOS behaviour
* Added support for separate front and back ID capture flow for improved control and user experience

### iOS
* IDentityMediumSDK2.0 version 11.1.7.2.7

### React Native wrapper
* Module is now installable directly via an `npm` git reference — no Google Drive zip download required
* Native module extracted from the sample app into a standalone, autolinked React Native package (`react-native-idmission-sdk`)
* Android sources moved to the `com.idmission.reactsdk` namespace and packaged as an Android library; the IDmission Maven dependency is declared by the package
* iOS sources packaged behind a podspec; CocoaPods autolinking installs the native module — no manual Xcode file drag-and-drop
* Added integration guide (`INTEGRATION_GUIDE.md`) covering Android and iOS setup end-to-end
