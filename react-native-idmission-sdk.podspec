require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-idmission-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/Idmission-LLC/react-native-idmission-sdk"
  s.license      = { :file => "LICENSE" }
  s.authors      = { "IDmission" => "support@idmission.com" }
  s.platforms    = { :ios => "15.6" }
  s.source       = { :git => "https://github.com/Idmission-LLC/react-native-idmission-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.swift_version = "5.0"

  # React Native core
  s.dependency "React-Core"

  # IDmission native iOS SDK
  s.dependency "IDentityMediumSDK2.0"
  s.dependency "IDentityMediumModels"

  # The IDmission SDK's public .swiftinterface imports these ML Kit modules
  # (from its OCR / image-labeling / face code), so any module that imports
  # IDentityMediumSDK must also see them — otherwise the build fails with
  # "No such module 'MLKitTextRecognition'". This mirrors the Flutter plugin's
  # podspec, which declares the same dependencies and builds cleanly.
  s.dependency "GoogleMLKit/TextRecognition"
  s.dependency "GoogleMLKit/ImageLabeling"
  s.dependency "GoogleMLKit/FaceDetection"

  # The module mixes Objective-C and Swift, so it must define a clang module
  # (this produces the `react_native_idmission_sdk-Swift.h` header imported by
  # IDMissionSDK.m). EXCLUDED_ARCHS keeps the simulator build clean.
  s.pod_target_xcconfig = {
    "DEFINES_MODULE" => "YES",
    "EXCLUDED_ARCHS[sdk=iphonesimulator*]" => "i386"
  }
end
