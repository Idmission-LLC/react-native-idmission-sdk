package com.idmtest

import android.os.Build
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

/**
 * Test-only module: reports the Android build toolchain versions so the Home
 * screen can show which Kotlin/Gradle/SDK configuration this APK was built with.
 */
class AppVersionInfoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AppVersionInfo"

  @ReactMethod
  fun getVersionInfo(promise: Promise) {
    val info = Arguments.createMap().apply {
      putString("kotlinVersion", BuildConfig.KOTLIN_VERSION)
      putString("kotlinPluginVersion", BuildConfig.KOTLIN_PLUGIN_VERSION)
      // Version of the kotlin-stdlib packaged in the APK.
      putString("kotlinStdlibVersion", KotlinVersion.CURRENT.toString())
      putString("gradleVersion", BuildConfig.GRADLE_VERSION)
      putString("agpVersion", BuildConfig.AGP_VERSION)
      putInt("compileSdkVersion", BuildConfig.COMPILE_SDK_VERSION)
      putInt("targetSdkVersion", reactApplicationContext.applicationInfo.targetSdkVersion)
      putInt("minSdkVersion", BuildConfig.MIN_SDK_VERSION)
      putString("deviceAndroidVersion", "${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
      putBoolean("newArchEnabled", BuildConfig.IS_NEW_ARCHITECTURE_ENABLED)
      putBoolean("hermesEnabled", BuildConfig.IS_HERMES_ENABLED)
    }
    promise.resolve(info)
  }
}

class AppVersionInfoPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
      listOf(AppVersionInfoModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
      emptyList()
}
