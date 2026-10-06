import Foundation
import IDentityMediumSDK
import SelfieCaptureMedium
import IDCaptureMedium

// `public` is required (not just @objc): the pod builds with DEFINES_MODULE = YES,
// so Swift only emits *public* @objc declarations into the generated
// `react_native_idmission_sdk-Swift.h` that IDMissionSDK.m imports.
@objc public class IDentitySDKHelper : NSObject{

  // SDK version plus the ML model file names in use. Model names are empty
  // until the SDK has been initialized (models are downloaded on init).
  @objc public static func sdkInfo() -> NSDictionary {
    let models: [(String, String)] = [
      ("Face Detector", IDentitySDK.faceDetectorModelName),
      ("Face Landmarks", IDentitySDK.faceLandmarkModelName),
      ("Face BlendedShapes", IDentitySDK.faceBlendedShapesModelName),
      ("Liveness", IDentitySDK.livenessModelName),
      ("Focus Face", IDentitySDK.focusFaceModelName),
      ("Face Mask", IDentitySDK.faceMaskModelName),
      ("Focus", IDentitySDK.focusModelName),
      ("Doc Realness", IDentitySDK.docRealnessModelName),
      ("Doc Detection", IDentitySDK.docDetectionModelName),
      ("PaddleOCR Detection", IDentitySDK.paddleOCRDetectionModelName),
      ("PaddleOCR Recognition", IDentitySDK.paddleOCRRecognitionModelName),
    ]
    return [
      "version": IDentitySDK.version,
      "models": models
        .filter { !$0.1.isEmpty }
        .map { ["name": $0.0, "value": $0.1] },
    ]
  }

  @objc public func initializeSDK(data: NSDictionary, instances: UIViewController) {
    IDCapture.options.enableInstructionScreen = false
    SelfieCapture.options.enableInstructionScreen = false
    
    // SDK options passed to initializeSDK. Defaults match the native IDentity app.
    let options = data["options"] as? NSDictionary
    let isGPSEnabled = options?["enableGPS"] as? Bool ?? true
    let isGeolocationRequired = options?["geolocationRequired"] as? Bool ?? false
    let isUpdateModelsData = options?["isUpdateModelsData"] as? Bool ?? true
    let isScreenRecordingEnabled = options?["enableScreenRecording"] as? Bool ?? false
    // Unknown or missing languages fall back to English.
    var language = Language(rawValue: (options?["language"] as? String ?? "en").lowercased()) ?? .en
    if language == .none { language = .en }

    guard let apiBaseUrl = data["apiBaseUrl"] as? String, apiBaseUrl.contains("http"),
          let accessToken = data["accessToken"] as? String else {
      self.sendData(text: "Error")
      return
    }

    let debug = options?["enableDebugMode"] as? Bool ?? false
    IDCapture.options.isDebugMode = debug
    SelfieCapture.options.isDebugMode = debug
    DocumentCapture.options.isDebugMode = debug

    IDentitySDK.apiBaseUrl = apiBaseUrl
    IDentitySDK.isScreenRecordingEnabled(isScreenRecordingEnabled)
    IDentitySDK.initializeSDK(language: language, isGPSEnabled: isGPSEnabled, geolocationRequired: isGeolocationRequired, isUpdateModelsData: isUpdateModelsData, accessToken: accessToken) { error in
      if let error = error {
        print("!!! initialize SDK ERROR: \(error.localizedDescription)")
        self.sendData(text: "Error")
      } else {
        print("!!! initialize SDK SUCCESS")
        self.sendData(text: "SDK Successfully Initialized")
      }
    }
  }

  // 20 - ID Validation
  @objc public func startIDValidations(instances: UIViewController) {
    ViewController().startIDValidation(instance: instances);
  }
 
  // 10 - ID Validation and Match Face
  @objc public func startIDValidationAndMatchFaces(instances: UIViewController) {
    ViewController().startIDValidationAndMatchFace(instance: instances);
  }
  
  // 50 - ID Validation And Customer Enroll
  @objc public func startIDValidationAndCustomerEnrolls(uniqueNumbers: String, instances: UIViewController) {
    if(uniqueNumbers.count>1){
    ViewController().startIDValidationAndCustomerEnroll(uniqueNumber: uniqueNumbers, instance: instances);
    } else {
      self.sendData(text: "Unique custome number is required")
    }
  }
  
  // 175 - Customer Enroll Biometrics
  @objc public func startCustomerEnrollBiometricss(uniqueNumbers: String, instances: UIViewController) {
    if(uniqueNumbers.count>1){
    ViewController().startCustomerEnrollBiometrics(uniqueNumber: uniqueNumbers, instance: instances);
    } else {
      self.sendData(text: "Unique custome number is required")
    }
  }
  
  // 105 - Customer Verification
  @objc public func startCustomerVerifications(uniqueNumbers: String, instances: UIViewController) {
    if(uniqueNumbers.count>1){
      ViewController().startCustomerVerification(uniqueNumber: uniqueNumbers, instance: instances);
    } else {
      self.sendData(text: "Unique custome number is required")
    }
  }
  
  // 185 - Identify Customer
  @objc public func startIdentifyCustomers(instances: UIViewController) {
    ViewController().startIdentifyCustomer(instance: instances);
  }
  
  // 660 - Live Face Check
  @objc public func startLiveFaceChecks(instances: UIViewController) {
    ViewController().startLiveFaceCheck(instance: instances);
  }
  
  @objc public func submitResult(instances: UIViewController) {
    ViewController().submitResult(instance: instances);
  }
  
  private func sendData(text: String) {
    let dict2:NSMutableDictionary? = ["data" : text ]
    let iDMissionSDK = IDMissionSDK()
    iDMissionSDK.getEvent2("DataCallback", dict: dict2 ?? ["data" : "error"])
  }
}
