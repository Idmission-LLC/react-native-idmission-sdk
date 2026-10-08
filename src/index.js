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
 *   initializeSDK(apiBaseUrl, accessToken, options?)
 *   initializeSDK(apiBaseUrl, authUrl, debug, accessToken)  -- earlier form, still supported
 *   serviceID20() / serviceID10() / serviceID185() / serviceID660()
 *   serviceID50(uniqueCustomerNumber) / serviceID175(uniqueCustomerNumber) / serviceID105(uniqueCustomerNumber)
 *   submitResult()
 *   getSDKInfo() -> Promise<{ version: string, models: { name: string, value: string }[] }>
 *
 * `options` is optional: { language, enableGPS, geolocationRequired,
 * isUpdateModelsData, enableScreenRecording, enableDebugMode } with defaults
 * 'en', true, false, true, false, false. `language` is 'en' or 'es' (Android
 * also 'my' and 'ar'). Omitted keys keep their default. getSDKInfo() returns
 * an empty `models` list until the SDK has been initialized.
 *
 * Results of initializeSDK / service / submit calls are delivered
 * asynchronously through the `DataCallback` event (see {@link addDataCallbackListener}).
 */
const nativeModule = NativeModules.IDMissionSDK;

export const IDMissionSDK = nativeModule
  ? Object.assign(Object.create(nativeModule), {
      initializeSDK: (apiBaseUrl, ...args) => {
        // Earlier releases took (apiBaseUrl, authUrl, debug, accessToken).
        // That form is recognised by the debug string in third position;
        // authUrl was unused then too. The debug check matches the earlier
        // releases: any value containing 'y'.
        if (typeof args[1] === 'string') {
          const [, debug, accessToken, options] = args;
          return nativeModule.initializeSDK(apiBaseUrl, accessToken, {
            ...(options || {}),
            enableDebugMode: debug.includes('y'),
          });
        }
        // The native method always takes the options argument; fill it in so
        // two-argument calls (apiBaseUrl, accessToken) work.
        const [accessToken, options] = args;
        return nativeModule.initializeSDK(apiBaseUrl, accessToken, options || {});
      },
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
