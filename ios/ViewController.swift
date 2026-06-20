import UIKit
import IDentityMediumSDK
import SelfieCaptureMedium
import IDCaptureMedium

var validateIdResult2: ValidateIdResult?                             // 20
var validateIdMatchFaceResult2: ValidateIdMatchFaceResult?           // 10
var customerEnrollResult2: CustomerEnrollResult?                     // 50
var customerEnrollBiometricsResult2: CustomerEnrollBiometricsResult? // 175
var customerVerificationResult2: CustomerVerificationResult?         // 105
var customerIdentifyResult2: CustomerIdentifyResult?                 // 185
var liveFaceCheckResult2: LiveFaceCheckResult?                       // 660

class ViewController: UIViewController {
  var texts: String!
  
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }

    // MARK: - IBAction Methods

    // 20 - ID Validation
    func startIDValidation(instance: UIViewController) {
        // start ID capture, presenting it from this view controller
      var commonCustomerData = CommonCustomerDataRequest()
      var options = AdditionalCustomerWFlagCommonData()
      options.sendInputImagesInResponse = .no
      options.sendProcessedImagesInResponse = .no
      IDentitySDK.idValidation(from: instance, customerDataOptions: commonCustomerData,options: options, captureBack: CaptureBack.auto) { result1 in
          switch result1 {
          case .success(let validateIdResult):
              self.emptyResults()
              validateIdResult2 = validateIdResult
              // pass the API request to the success view controller
              let successViewController = SuccessViewController()
              successViewController.validateIdResult = validateIdResult
              successViewController.frontDetectedData = validateIdResult.front
              successViewController.backDetectedData = validateIdResult.back
              let navigationController = UINavigationController(rootViewController: successViewController)
              instance.present(navigationController, animated: true)
          case .failure(let error):
              print(error.localizedDescription)
              self.sendData(text: error.localizedDescription)
          }
      }
    }
  
    // 10 - ID Validation and Match Face
    func startIDValidationAndMatchFace(instance: UIViewController) {
      var commonCustomerData = CommonCustomerDataRequest()
      var options = AdditionalCustomerWFlagCommonData()
      options.sendInputImagesInResponse = .no
      options.sendProcessedImagesInResponse = .no
      IDentitySDK.idValidationAndMatchFace(from: instance, customerDataOptions: commonCustomerData,options: options, captureBack: CaptureBack.auto) { result1 in
          switch result1 {
          case .success(let validateIdMatchFaceResult):
                  self.emptyResults()
                  validateIdMatchFaceResult2=validateIdMatchFaceResult
                  // pass the API request to the success view controller
                  let successViewController = SuccessViewController()
                  successViewController.validateIdMatchFaceResult = validateIdMatchFaceResult
                  successViewController.frontDetectedData = validateIdMatchFaceResult.front
                  successViewController.backDetectedData = validateIdMatchFaceResult.back
                  let navigationController = UINavigationController(rootViewController: successViewController)
                  instance.present(navigationController, animated: true)
          case .failure(let error):
              print(error.localizedDescription)
              self.sendData(text: error.localizedDescription)
          }
      }
    }

    // 50 - ID Validation And Customer Enroll
      func startIDValidationAndCustomerEnroll(uniqueNumber: String, instance: UIViewController) {
        let personalData = PersonalCustomerCommonRequestEnrollData(uniqueNumber: uniqueNumber)
        var options = AdditionalCustomerWFlagCommonData()
        options.sendInputImagesInResponse = .no
        options.sendProcessedImagesInResponse = .no
        IDentitySDK.idValidationAndCustomerEnroll(from: instance, personalData: personalData, options: options) { result1 in
            switch result1 {
            case .success(let customerEnrollResult):
                    self.emptyResults()
                    customerEnrollResult2=customerEnrollResult
                    // pass the API request to the success view controller
                    let successViewController = SuccessViewController()
                    successViewController.customerEnrollResult = customerEnrollResult
                    successViewController.frontDetectedData = customerEnrollResult.front
                    successViewController.backDetectedData = customerEnrollResult.back
                let navigationController = UINavigationController(rootViewController: successViewController)
                    instance.present(navigationController, animated: true, completion: nil)
            case .failure(let error):
                print(error.localizedDescription)
                self.sendData(text: error.localizedDescription)
            }
        }
      }
  
    // 175 - Customer Enroll Biometrics
    func startCustomerEnrollBiometrics(uniqueNumber: String, instance: UIViewController) {
      let personalData = PersonalCustomerEnrollBiometricsRequestData(uniqueNumber: uniqueNumber)
      let commonCustomerData = CommonCustomerDataRequest()
      let options = AdditionalCustomerEnrollBiometricRequestData()
      
      IDentitySDK.customerEnrollBiometrics(from: instance, customerDataOptions: commonCustomerData, personalData: personalData, options: options) { result1 in
          switch result1 {
          case .success(let customerEnrollBiometricsResult):
                  self.emptyResults()
                  customerEnrollBiometricsResult2=customerEnrollBiometricsResult
                  // pass the API request to the success view controller
                  let successViewController = SuccessViewController()
                  successViewController.customerEnrollBiometricsResult = customerEnrollBiometricsResult
                  let navigationController = UINavigationController(rootViewController: successViewController)
              instance.present(navigationController, animated: true, completion: nil)
          case .failure(let error):
              print(error.localizedDescription)
              self.sendData(text: error.localizedDescription)
          }
      }
    }

    // 105 - Customer Verification
    func startCustomerVerification(uniqueNumber: String, instance: UIViewController) {
      let commonCustomerData = CommonCustomerDataRequest()
      let options = AdditionalCustomerCommonData()
      let personalData = PersonalCustomerVerifyData(uniqueNumber: uniqueNumber)
      
      IDentitySDK.customerVerification(from: instance, customerDataOptions: commonCustomerData, personalData: personalData, options: options) { result1 in
          switch result1 {
          case .success(let customerVerificationResult):
                  self.emptyResults()
                  customerVerificationResult2=customerVerificationResult
                  // pass the API request to the success view controller
                  let successViewController = SuccessViewController()
                  successViewController.customerVerificationResult = customerVerificationResult
                  let navigationController = UINavigationController(rootViewController: successViewController)
              instance.present(navigationController, animated: true, completion: nil)
          case .failure(let error):
              print(error.localizedDescription)
              self.sendData(text: error.localizedDescription)
          }
      }
    }

    // 185 - Identify Customer
    func startIdentifyCustomer(instance: UIViewController) {
      let commonCustomerData = CommonCustomerDataRequest()
      let options = AdditionalCustomerCommonData()
      IDentitySDK.identifyCustomer(from: instance, customerDataOptions: commonCustomerData, options: options) { result1 in
      switch result1 {
      case .success(let customerIdentifyResult):
              self.emptyResults()
              customerIdentifyResult2=customerIdentifyResult
              // pass the API request to the success view controller
              let successViewController = SuccessViewController()
              successViewController.customerIdentifyResult = customerIdentifyResult
              let navigationController = UINavigationController(rootViewController: successViewController)
          instance.present(navigationController, animated: true, completion: nil)
      case .failure(let error):
          print(error.localizedDescription)
          self.sendData(text: error.localizedDescription)
      }
     }
    }

    // 660 - Live Face Check
    func startLiveFaceCheck(instance: UIViewController) {
        // start selfie capture, presenting it from this view controller
      IDentitySDK.liveFaceCheck(from: instance) { result1 in
          switch result1 {
          case .success(let liveFaceCheckResult):
                  self.emptyResults()
                  liveFaceCheckResult2=liveFaceCheckResult
                  // pass the API request to the success view controller
                  let successViewController = SuccessViewController()
                  successViewController.liveFaceCheckResult = liveFaceCheckResult
                  let navigationController = UINavigationController(rootViewController: successViewController)
              instance.present(navigationController, animated: true, completion: nil)
          case .failure(let error):
              print(error.localizedDescription)
              self.sendData(text: error.localizedDescription)
          }
      }
    }

  func submitResult(instance: UIViewController) {
    submit()
  }
  
  @objc func submit() {
      if let validateIdResult = validateIdResult2 {
          validateIdResult.finalSubmit { result in
              self.navigationItem.leftBarButtonItem = nil
              validateIdResult2 = nil
              switch result {
              case .success(let response):
                  let encoder = JSONEncoder()
                  encoder.outputFormatting = .prettyPrinted
                  if let data = try? encoder.encode(response), let json = String(data: data, encoding: .utf8) {
                      self.texts = json
                  }
                  self.sendData(text: self.texts)
              case .failure(let error):
                  self.texts = error.localizedDescription
                  self.sendData(text: self.texts)
              }
          }
      } else if let validateIdMatchFaceResult = validateIdMatchFaceResult2 {
          validateIdMatchFaceResult.finalSubmit { result in
              self.navigationItem.leftBarButtonItem = nil
              validateIdMatchFaceResult2 = nil
              switch result {
              case .success(let response):
                  let encoder = JSONEncoder()
                  encoder.outputFormatting = .prettyPrinted
                  if let data = try? encoder.encode(response), let json = String(data: data, encoding: .utf8) {
                    self.texts = json
                  }
                self.sendData(text: self.texts)
              case .failure(let error):
                  self.texts = error.localizedDescription
                self.sendData(text: self.texts)
              }
          }
      } else if let customerEnrollResult = customerEnrollResult2 {
          customerEnrollResult.finalSubmit { result in
              self.navigationItem.leftBarButtonItem = nil
              customerEnrollResult2 = nil
              switch result {
              case .success(let response):
                  let encoder = JSONEncoder()
                  encoder.outputFormatting = .prettyPrinted
                  if let data = try? encoder.encode(response), let json = String(data: data, encoding: .utf8) {
                    //self.texts = json + "\n\n\(hostDataString)- - -\n\n"
                    self.texts = json
                  }
                self.sendData(text: self.texts)
              case .failure(let error):
                  self.texts = error.localizedDescription
                self.sendData(text: self.texts)
              }
          }
      } else if let customerEnrollBiometricsResult = customerEnrollBiometricsResult2 {
          customerEnrollBiometricsResult.finalSubmit { result in
              self.navigationItem.leftBarButtonItem = nil
              customerEnrollBiometricsResult2 = nil
              switch result {
              case .success(let response):
                  let encoder = JSONEncoder()
                  encoder.outputFormatting = .prettyPrinted
                  if let data = try? encoder.encode(response), let json = String(data: data, encoding: .utf8) {
                      self.texts = json
                  }
                self.sendData(text: self.texts)
              case .failure(let error):
                  self.texts = error.localizedDescription
                self.sendData(text: self.texts)
              }
          }
      } else if let customerVerificationResult = customerVerificationResult2 {
          customerVerificationResult.finalSubmit { result in
              self.navigationItem.leftBarButtonItem = nil
              customerVerificationResult2 = nil
              switch result {
              case .success(var response):
                  // stub out the base64 image text for logging
                  response.responseCustomerVerifyData?.extractedPersonalData?.enrolledFaceImage = "..."

                  let encoder = JSONEncoder()
                  encoder.outputFormatting = .prettyPrinted
                  if let data = try? encoder.encode(response), let json = String(data: data, encoding: .utf8) {
                      self.texts = json
                  }
                self.sendData(text: self.texts)
              case .failure(let error):
                  self.texts = error.localizedDescription
                self.sendData(text: self.texts)
              }
          }
      } else if let customerIdentifyResult = customerIdentifyResult2 {
          customerIdentifyResult.finalSubmit { result in
              self.navigationItem.leftBarButtonItem = nil
              customerIdentifyResult2 = nil
              switch result {
              case .success(var response):
                  // stub out the base64 image text for logging
                  response.responseCustomerData?.extractedPersonalData?.enrolledFaceImage = "..."

                  let encoder = JSONEncoder()
                  encoder.outputFormatting = .prettyPrinted
                  if let data = try? encoder.encode(response), let json = String(data: data, encoding: .utf8) {
                      self.texts = json
                  }
                self.sendData(text: self.texts)
              case .failure(let error):
                  self.texts = error.localizedDescription
                self.sendData(text: self.texts)
              }
          }
      } else if let liveFaceCheckResult = liveFaceCheckResult2 {
          liveFaceCheckResult.finalSubmit { result in
              self.navigationItem.leftBarButtonItem = nil
              liveFaceCheckResult2 = nil
              switch result {
              case .success(let response):
                  let encoder = JSONEncoder()
                  encoder.outputFormatting = .prettyPrinted
                  if let data = try? encoder.encode(response), let json = String(data: data, encoding: .utf8) {
                      self.texts = json
                  }
                self.sendData(text: self.texts)
              case .failure(let error):
                  self.texts = error.localizedDescription
                self.sendData(text: self.texts)
              }
          }
      }
  }
  
    private func sendData(text: String) {
      let dict2:NSMutableDictionary? = ["data" : text ]
      let iDMissionSDK = IDMissionSDK()
      iDMissionSDK.getEvent2("DataCallback", dict: dict2 ?? ["data" : "error"])
      //iDMissionSDK.getEvent2("DataCallback", dict: dict2 ?? ["data" : "error"])
    }
  
  func emptyResults(){
    validateIdResult2 = nil
    validateIdMatchFaceResult2 = nil
    customerEnrollResult2 = nil
    customerEnrollBiometricsResult2 = nil
    customerVerificationResult2 = nil
    customerIdentifyResult2 = nil
    liveFaceCheckResult2 = nil
  }
}
