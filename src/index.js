import { NativeModules, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  "The package 'react-native-idmission-sdk' doesn't seem to be linked. Make sure: \n\n" +
  '- You rebuilt the app after installing the package\n' +
  '- For iOS, you ran `pod install` in the `ios/` directory\n' +
  '- You are not using Expo Go (a custom dev client or bare workflow is required)\n';

/**
 * Native module bridge. Exposes the IDmission IDentity SDK service flows.
 *
 * Method signatures mirror the native implementation:
 *   initializeSDK(apiBaseUrl, authUrl, debug, accessToken, options?)
 *   serviceID20() / serviceID10() / serviceID185() / serviceID660()
 *   serviceID50(uniqueCustomerNumber) / serviceID175(uniqueCustomerNumber) / serviceID105(uniqueCustomerNumber)
 *   submitResult()
 *   getSDKInfo() -> Promise<{ version: string, models: { name: string, value: string }[] }>
 *
 * `authUrl` is deprecated and ignored (the SDK no longer uses it); it is kept so
 * existing calls keep working.
 *
 * `options` is optional: { language, enableGPS, geolocationRequired,
 * isUpdateModelsData, enableScreenRecording } with defaults 'en', true, false,
 * true, false. `language` is 'en' or 'es' (Android also 'my' and 'ar').
 * Omitted keys keep their default, and calling initializeSDK with four
 * arguments still works. getSDKInfo() returns an empty `models` list until the
 * SDK has been initialized.
 *
 * Results of initializeSDK / service / submit calls are delivered
 * asynchronously through the `DataCallback` event (see {@link addDataCallbackListener}).
 */
const nativeModule = NativeModules.IDMissionSDK;

export const IDMissionSDK = nativeModule
  ? Object.assign(Object.create(nativeModule), {
      // The native method always takes the options argument; fill it in so
      // existing four-argument calls keep working.
      initializeSDK: (apiBaseUrl, authUrl, debug, accessToken, options = {}) =>
        nativeModule.initializeSDK(apiBaseUrl, authUrl, debug, accessToken, options || {}),
    })
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * Shared emitter for native SDK events. Returns `null` until the native
 * module is linked, so callers can guard during early development.
 */
export const IDMissionEventEmitter = NativeModules.IDMissionSDK
  ? new NativeEventEmitter(NativeModules.IDMissionSDK)
  : null;

/**
 * Subscribe to the SDK `DataCallback` event. The native side emits this for
 * every initialize / service / submit result, with a `{ data: string }` payload.
 *
 * @param {(event: { data: string }) => void} listener
 * @returns {import('react-native').EmitterSubscription} subscription — call
 *          `.remove()` to unsubscribe.
 */
export function addDataCallbackListener(listener) {
  if (!IDMissionEventEmitter) {
    throw new Error(LINKING_ERROR);
  }
  return IDMissionEventEmitter.addListener('DataCallback', listener);
}

export default IDMissionSDK;
