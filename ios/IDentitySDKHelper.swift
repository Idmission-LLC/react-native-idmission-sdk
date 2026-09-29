import Foundation
import IDentityMediumSDK
import SelfieCaptureMedium
import IDCaptureMedium

// `public` is required (not just @objc): the pod builds with DEFINES_MODULE = YES,
// so Swift only emits *public* @objc declarations into the generated
// `react_native_idmission_sdk-Swift.h` that IDMissionSDK.m imports.
@objc public class IDentitySDKHelper : NSObject{

  // Options set from JS via setSDKOptions(); applied on the next initializeSDK().
  // Defaults match the native IDentity app.
  private static var isGPSEnabled = true
  private static var isGeolocationRequired = false
  private static var isScreenRecordingEnabled = false

  @objc public static func setOptions(_ options: NSDictionary) {
    if let value = options["enableGPS"] as? Bool { isGPSEnabled = value }
    if let value = options["geolocationRequired"] as? Bool { isGeolocationRequired = value }
    if let value = options["enableScreenRecording"] as? Bool { isScreenRecordingEnabled = value }
  }

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
    
    let urlString = data["apiBaseUrl"] as! String
    let substring = "http"
    if urlString.contains(substring) {
      let apiBaseUrl:String = data["apiBaseUrl"] as! String
      let debug:String = data["debug"] as! String
      let accessToken:String = data["accessToken"] as! String
      
      UserDefaults.standard.set(String(apiBaseUrl), forKey: "apiBaseUrl")
      UserDefaults.standard.set(String(accessToken), forKey: "accessToken")
        
        if(debug.contains("y")){
            IDCapture.options.isDebugMode = true
            SelfieCapture.options.isDebugMode = true
            DocumentCapture.options.isDebugMode = true
        }else{
            IDCapture.options.isDebugMode = false
            SelfieCapture.options.isDebugMode = false
            DocumentCapture.options.isDebugMode = false
        }
      
    var authUrl = "https://auth.idmission.com/"

    if apiBaseUrl.contains("lab") {
          authUrl = "https://labauth.idmission.com:9043/"
    } else if apiBaseUrl.contains("demo") {
          authUrl = "https://demoauth.idmission.com/"
    } else if apiBaseUrl.contains("uat") {
          authUrl = "https://uatauth.idmission.com/"
    } else if apiBaseUrl.contains("kyc") {
          authUrl = "https://auth.idmission.com/"
    }

    //API Auth URL
    let defaultAuthUrl = "\(authUrl)auth/realms/identity/protocol/openid-connect/token"
    UserDefaults.standard.set(defaultAuthUrl, forKey: "authenticationURL")
    
    IDentitySDK.apiBaseUrl = UserDefaults.standard.string(forKey: "apiBaseUrl") ?? ""
      IDentitySDK.isScreenRecordingEnabled(Self.isScreenRecordingEnabled)
      IDentitySDK.initializeSDK(language: UserDefaults.SDKlanguage, isGPSEnabled: Self.isGPSEnabled, geolocationRequired: Self.isGeolocationRequired, isUpdateModelsData: UserDefaults.isUpdateModelData, accessToken: UserDefaults.accessToken) { error in
          if let error = error {
              print("!!! initialize SDK ERROR: \(error.localizedDescription)")
              self.sendData(text: "Error")
          } else {
              print("!!! initialize SDK SUCCESS")
              self.sendData(text: "SDK successfully initialized")
          }
      }
    }else{
      self.sendData(text: "Error")
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
