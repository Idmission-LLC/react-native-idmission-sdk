package com.idmtest

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      // IDMissionPackage is autolinked from the react-native-idmission-sdk package.
      packageList = PackageList(this).packages,
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
