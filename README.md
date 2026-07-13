# React Native IDmission SDK

![Android](https://img.shields.io/badge/platform-Android-green) ![iOS](https://img.shields.io/badge/platform-iOS-blue) ![React Native](https://img.shields.io/badge/React%20Native-0.83%2B-blue)

React Native module wrapping the **IDmission Identity SDK** for Android and iOS. Provides identity verification, government ID document capture, face match, liveness detection, and biometric enrollment — all via a single JavaScript API.

## Installation

Install directly from the git repository with npm:

```bash
npm install git+https://github.com/Idmission-LLC/react-native-idmission-sdk.git#v11.1.13
```

or with Yarn:

```bash
yarn add git+https://github.com/Idmission-LLC/react-native-idmission-sdk.git#v11.1.13
```

The native module is **autolinked** — no manual native file copying is required. After installing:

```bash
# iOS only
cd ios && pod install && cd ..
```

> A small amount of Android (Maven repository) and iOS (Podfile) configuration is required because the IDmission native SDK is distributed through a private registry. See the [Integration Guide](INTEGRATION_GUIDE.md).

## Requirements

| Platform | Minimum |
|----------|---------|
| React Native | 0.83+ |
| Node | 20 |
| Android | API 26 (Android 8.0), compileSdk 36 |
| iOS | 15.6, CocoaPods + `cocoapods-user-defined-build-types` |

## Usage

```js
import { IDMissionSDK, addDataCallbackListener } from 'react-native-idmission-sdk';

// 1. Subscribe to results (initialize, every service, and submit emit here)
const subscription = addDataCallbackListener((event) => {
  console.log('IDmission result:', event.data);
});

// 2. Initialise once before calling any service
IDMissionSDK.initializeSDK(apiBaseUrl, authUrl, debug, accessToken);

// 3. Call a service
IDMissionSDK.serviceID10();

// 4. Submit the result
IDMissionSDK.submitResult();

// 5. Clean up when done
subscription.remove();
```

## Available services

- **ID 20** — ID document validation
- **ID 10** — ID validation + face match
- **ID 50** — ID validation + customer enrollment
- **ID 175** — Biometric enrollment
- **ID 105** — Customer verification
- **ID 185** — Identify customer
- **ID 660** — Live face check

## Documentation

For full Android and iOS setup, SDK initialization, service usage, and troubleshooting, see the [Integration Guide](INTEGRATION_GUIDE.md).

A working example app is included in [`example/`](example/).

## Native SDK versions

- Android: `idmission-mediumsdk 11.1.13.2.08`
- iOS: `IDentityMediumSDK2.0 11.1.13.2.3`
