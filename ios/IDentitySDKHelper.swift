import Foundation
import IDentityMediumSDK
import SelfieCaptureMedium
import IDCaptureMedium

class IDentitySDKHelper : NSObject{
  
  @IBAction func initializeSDK(data: NSDictionary, instances: UIViewController) {
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
      IDentitySDK.initializeSDK(language: UserDefaults.SDKlanguage, isUpdateModelsData: UserDefaults.isUpdateModelData, accessToken: UserDefaults.accessToken) { error in
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
  @IBAction func startIDValidations(instances: UIViewController) {
    ViewController().startIDValidation(instance: instances);
  }
 
  // 10 - ID Validation and Match Face
  @IBAction func startIDValidationAndMatchFaces(instances: UIViewController) {
    ViewController().startIDValidationAndMatchFace(instance: instances);
  }
  
  // 50 - ID Validation And Customer Enroll
  @IBAction func startIDValidationAndCustomerEnrolls(uniqueNumbers: String, instances: UIViewController) {
    if(uniqueNumbers.count>1){
    ViewController().startIDValidationAndCustomerEnroll(uniqueNumber: uniqueNumbers, instance: instances);
    } else {
      self.sendData(text: "Unique custome number is required")
    }
  }
  
  // 175 - Customer Enroll Biometrics
  @IBAction func startCustomerEnrollBiometricss(uniqueNumbers: String, instances: UIViewController) {
    if(uniqueNumbers.count>1){
    ViewController().startCustomerEnrollBiometrics(uniqueNumber: uniqueNumbers, instance: instances);
    } else {
      self.sendData(text: "Unique custome number is required")
    }
  }
  
  // 105 - Customer Verification
  @IBAction func startCustomerVerifications(uniqueNumbers: String, instances: UIViewController) {
    if(uniqueNumbers.count>1){
      ViewController().startCustomerVerification(uniqueNumber: uniqueNumbers, instance: instances);
    } else {
      self.sendData(text: "Unique custome number is required")
    }
  }
  
  // 185 - Identify Customer
  @IBAction func startIdentifyCustomers(instances: UIViewController) {
    ViewController().startIdentifyCustomer(instance: instances);
  }
  
  // 660 - Live Face Check
  @IBAction func startLiveFaceChecks(instances: UIViewController) {
    ViewController().startLiveFaceCheck(instance: instances);
  }
  
  @IBAction func submitResult(instances: UIViewController) {
    ViewController().submitResult(instance: instances);
  }
  
  private func sendData(text: String) {
    let dict2:NSMutableDictionary? = ["data" : text ]
    let iDMissionSDK = IDMissionSDK()
    iDMissionSDK.getEvent2("DataCallback", dict: dict2 ?? ["data" : "error"])
  }
}
