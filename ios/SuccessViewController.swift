import UIKit
import IDentityMediumSDK
import SelfieCaptureMedium
import IDCaptureMedium


class SuccessViewController: UIViewController {
    var validateIdResult: ValidateIdResult?                             // 20
    var validateIdMatchFaceResult: ValidateIdMatchFaceResult?           // 10
    var customerEnrollResult: CustomerEnrollResult?                     // 50
    var customerEnrollBiometricsResult: CustomerEnrollBiometricsResult? // 175
    var customerVerificationResult: CustomerVerificationResult?         // 105
    var customerIdentifyResult: CustomerIdentifyResult?                 // 185
    var liveFaceCheckResult: LiveFaceCheckResult?                       // 660

    var frontDetectedData: DetectedData?
    var backDetectedData: DetectedData?

    var texts: String!
    var textObfuscated: String!
  
  override func viewDidLoad() {
        super.viewDidLoad()
      
        // pretty print the request object
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
    
    if validateIdResult != nil ||
        validateIdMatchFaceResult != nil ||
        customerEnrollResult != nil {
        guard frontDetectedData != nil else {
            texts = "ERROR"
            return
        }
    }
      
    if let _ = validateIdResult, var request = IDentitySDK.customerValidateIdRequest {
        // stub out the base64 image text for logging
        request.customerData.idData.idImageFront = "..."
        if request.customerData.idData.idImageBack != nil {
            request.customerData.idData.idImageBack = "..."
        }
        
        let requestObfuscated = request
        
        if let data = try? encoder.encode(request.customerData),
           let json = String(data: data, encoding: .utf8)  {
            texts = json
        } else {
            texts = "ERROR"
        }
        
        if let dataObfuscated = try? encoder.encode(requestObfuscated),
           let jsonObfuscated = String(data: dataObfuscated, encoding: .utf8)  {
            textObfuscated = jsonObfuscated
        } else {
            textObfuscated = "ERROR"
        }
    } else if let _ = validateIdMatchFaceResult, var request = IDentitySDK.customerValidateIdFaceMatchRequest {
        // stub out the base64 image texts for logging
        request.customerData.idData.idImageFront = "..."
        if request.customerData.idData.idImageBack != nil {
            request.customerData.idData.idImageBack = "..."
        }
        
        request.customerData.biometricData.selfie = "..."
    
        let requestObfuscated = request
      
        if let data = try? encoder.encode(request.customerData),
           let json = String(data: data, encoding: .utf8)  {
            texts = json
        } else {
            texts = "ERROR"
        }
      
        if let dataObfuscated = try? encoder.encode(requestObfuscated),
           let jsonObfuscated = String(data: dataObfuscated, encoding: .utf8)  {
            textObfuscated = jsonObfuscated
        } else {
            textObfuscated = "ERROR"
        }
    } else if let _ = customerEnrollResult, var request = IDentitySDK.customerEnrollRequest {
        // stub out the base64 image text for logging
        request.customerData.idData.idImageFront = "..."
        if request.customerData.idData.idImageBack != nil {
            request.customerData.idData.idImageBack = "..."
        }
        let requestObfuscated = request
      
        if let data = try? encoder.encode(request),
           let json = String(data: data, encoding: .utf8)  {
            texts = json
        } else {
            texts = "ERROR"
        }
      
        if let dataObfuscated = try? encoder.encode(requestObfuscated),
           let jsonObfuscated = String(data: dataObfuscated, encoding: .utf8)  {
            textObfuscated = jsonObfuscated
        } else {
            textObfuscated = "ERROR"
        }
    } else if let _ = customerEnrollBiometricsResult, let request = IDentitySDK.customerEnrollBiometricsRequest {
        let requestObfuscated = request
      
        if let data = try? encoder.encode(request),
           let json = String(data: data, encoding: .utf8)  {
            texts = json
        } else {
            texts = "ERROR"
        }
      
        if let dataObfuscated = try? encoder.encode(requestObfuscated),
           let jsonObfuscated = String(data: dataObfuscated, encoding: .utf8)  {
            textObfuscated = jsonObfuscated
        } else {
            textObfuscated = "ERROR"
        }
    } else if let _ = customerVerificationResult, let request = IDentitySDK.customerVerifyRequest {
        let requestObfuscated = request
      
        if let data = try? encoder.encode(request),
           let json = String(data: data, encoding: .utf8)  {
            texts = json
        } else {
            texts = "ERROR"
        }
      
        if let dataObfuscated = try? encoder.encode(requestObfuscated),
           let jsonObfuscated = String(data: dataObfuscated, encoding: .utf8)  {
            textObfuscated = jsonObfuscated
        } else {
            textObfuscated = "ERROR"
        }
    } else if let _ = customerIdentifyResult, let request = IDentitySDK.customerIdentifyRequest {
        let requestObfuscated = request
      
        if let data = try? encoder.encode(request),
           let json = String(data: data, encoding: .utf8)  {
            texts = json
        } else {
            texts = "ERROR"
        }
      
        if let dataObfuscated = try? encoder.encode(requestObfuscated),
           let jsonObfuscated = String(data: dataObfuscated, encoding: .utf8)  {
            textObfuscated = jsonObfuscated
        } else {
            textObfuscated = "ERROR"
        }
    } else if let _ = liveFaceCheckResult, let request = IDentitySDK.customerLiveCheckRequest {
        let requestObfuscated = request
      
        if let data = try? encoder.encode(request),
           let json = String(data: data, encoding: .utf8)  {
            texts = json
        } else {
            texts = "ERROR"
        }
      
        if let dataObfuscated = try? encoder.encode(requestObfuscated),
           let jsonObfuscated = String(data: dataObfuscated, encoding: .utf8)  {
            textObfuscated = jsonObfuscated
        } else {
            textObfuscated = "ERROR"
        }
    }
      
    }

  override func viewWillAppear(_ animated: Bool) {
    self.sendData()
    self.dismiss()
  }

  private func sendData() {
    let dict2:NSMutableDictionary? = ["data" : self.texts ?? ["data" : "error"]]
    let iDMissionSDK = IDMissionSDK()
    iDMissionSDK.getEvent2("DataCallback", dict: dict2 ?? ["data" : "error"])
  }
  
    func dismiss() {
        dismiss(animated: true, completion: nil)
    }
}
