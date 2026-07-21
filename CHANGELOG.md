# Changelog

## 11.1.13

**Android native SDK: 11.1.13.2.08**
**iOS native SDK: 11.1.13.2.3**

### Android
* Bumped `idmission-mediumsdk` to 11.1.13.2.08

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
