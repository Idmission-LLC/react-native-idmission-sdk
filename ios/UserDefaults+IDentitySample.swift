import IDentityMediumSDK

struct ServiceOptions: Codable {
    enum ManualReviewRequired: Int, Codable {
        case yes, no, forced
    }

    var manualReviewRequired: ManualReviewRequired
    var bypassAgeValidation: Bool
    var deDuplicationRequired: Bool
    var bypassNameMatching: Bool
    var postDataAPIRequired: Bool
    var sendInputImagesInPost: Bool
    var sendProcessedImagesInPost: Bool
    var needImmediateResponse: Bool
    var deduplicationSynchronous: Bool
    var verifyDataWithHost: Bool
    var idBackImageRequired: Bool
    var stripSpecialCharacters: Bool

    static var `default`: ServiceOptions {
        ServiceOptions(manualReviewRequired: .no,
                       bypassAgeValidation: false,
                       deDuplicationRequired: false,
                       bypassNameMatching: true,
                       postDataAPIRequired: false,
                       sendInputImagesInPost: false,
                       sendProcessedImagesInPost: false,
                       needImmediateResponse: false,
                       deduplicationSynchronous: false,
                       verifyDataWithHost: false,
                       idBackImageRequired: true,
                       stripSpecialCharacters: true)
    }
}

extension JSONDecoder {
    static var snakeCase: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }
}


extension UserDefaults {
  static let defaultTemplateModelBaseURL = "https://kyc.idmission.com/IDS/service/"
  static let defaultAPIBaseURL = "https://api.idmission.com/"
  static let defaultAuthenticationURL = "https://auth.idmission.com/auth/realms/identity/protocol/openid-connect/token"
    static let defaultLoginId = ""
    static let defaultPassword = ""
    static let defaultClientId = ""
    static let defaultClientSecret = ""
    static let defaultIsUpdateModeldata = true
    static let defaultLanguage: String = "en"
    static let defaultSDKLanguage = Language.en
    
    private static let templateModelBaseURLKey = "templateModelBaseURL"
    static var templateModelBaseURL: String {
        get { standard.string(forKey: templateModelBaseURLKey) ?? defaultTemplateModelBaseURL }
        set { standard.set(newValue, forKey: templateModelBaseURLKey) }
    }

    private static let apiBaseURLKey = "apiBaseURL"
    static var apiBaseURL: String {
        get { standard.string(forKey: apiBaseURLKey) ?? defaultAPIBaseURL }
        set { standard.set(newValue, forKey: apiBaseURLKey) }
    }

    private static let authenticationURLKey = "authenticationURL"
    static var authenticationURL: String {
        get { standard.string(forKey: authenticationURLKey) ?? defaultAuthenticationURL }
        set { standard.set(newValue, forKey: authenticationURLKey) }
    }

    private static let loginIdKey = "loginId"
    static var loginId: String {
        get { standard.string(forKey: loginIdKey) ?? defaultLoginId }
        set { standard.set(newValue, forKey: loginIdKey) }
    }

    private static let passwordKey = "password"
    static var password: String {
        get { standard.string(forKey: passwordKey) ?? defaultPassword }
        set { standard.set(newValue, forKey: passwordKey) }
    }

    private static let clientIdKey = "clientId"
    static var clientId: String {
        get { standard.string(forKey: clientIdKey) ?? defaultClientId }
        set { standard.set(newValue, forKey: clientIdKey) }
    }

    private static let clientSecretKey = "clientSecret"
    static var clientSecret: String {
        get { standard.string(forKey: clientSecretKey) ?? defaultClientSecret }
        set { standard.set(newValue, forKey: clientSecretKey) }
    }

    private static let accessTokenKey = "accessToken"
    static var accessToken: String {
        get { standard.string(forKey: accessTokenKey) ?? "" }
        set { standard.set(newValue, forKey: accessTokenKey) }
    }

    private static let isUpdateModelDataKey = "isUpdateModelData"
    static var isUpdateModelData: Bool {
        get { standard.object(forKey: isUpdateModelDataKey) as? Bool ?? defaultIsUpdateModeldata }
        set { standard.set(newValue, forKey: isUpdateModelDataKey) }
    }

    private static let languageKey = "langauge"
    static var langauge: String {
        get { standard.object(forKey: languageKey) as? String ?? defaultLanguage }
        set { standard.set(newValue, forKey: languageKey) }
    }
    
    private static let SDKlanguageKey = "SDKlanguage"
    static var SDKlanguage: Language {
        get {
            guard let string = standard.string(forKey: SDKlanguageKey),
                  let SDKlanguage = Language(rawValue: string) else { return defaultSDKLanguage }
            return SDKlanguage
        }
        set { standard.set(newValue.rawValue, forKey: SDKlanguageKey) }
    }

    // MARK: - Service Options

    private static let serviceOptionsKey = "serviceOptions"
    static var serviceOptions: ServiceOptions {
        get {
            if let data = standard.data(forKey: serviceOptionsKey),
                let options = try? JSONDecoder().decode(ServiceOptions.self, from: data) {
                return options
            } else {
                return .default
            }
        }
        set {
            guard let data = try? JSONEncoder().encode(newValue) else { return }
            standard.set(data, forKey: serviceOptionsKey)
        }
    }

    private static let debugModeKey = "debugMode"
    static var debugMode: Bool {
        get { standard.bool(forKey: debugModeKey) }
        set { standard.set(newValue, forKey: debugModeKey) }
    }

    private static let capture4KKey = "capture4K"
    static var capture4K: Bool {
        get { standard.bool(forKey: capture4KKey) }
        set { standard.set(newValue, forKey: capture4KKey) }
    }
}

