import Foundation
import UIKit

/// Converts the result object returned by the SDK (ValidateIdResult,
/// ValidateIdMatchFaceResult, LiveFaceCheckResult, ...) into JSON so it can
/// cross the bridge. It is generated from the object's own properties via
/// reflection: nothing is renamed, added, left out or masked. Images
/// (`UIImage`) cannot be written as JSON, so they are written as base64 JPEG
/// strings.
enum CaptureResultSerializer {

    static func text<T>(of result: T) -> String {
        let object = jsonValue(result, depth: 0)
        guard JSONSerialization.isValidJSONObject(object),
              let data = try? JSONSerialization.data(
                withJSONObject: object,
                options: [.sortedKeys, .withoutEscapingSlashes]),
              let text = String(data: data, encoding: .utf8) else {
            var out = ""
            dump(result, to: &out)
            return out
        }
        return text
    }

    private static let maxDepth = 12

    private static func jsonValue(_ value: Any, depth: Int) -> Any {
        if depth > maxDepth { return "\(value)" }
        switch value {
        case let v as Bool: return v
        case let v as String: return v
        case let v as Int: return v
        case let v as Int8: return Int(v)
        case let v as Int16: return Int(v)
        case let v as Int32: return Int(v)
        case let v as Int64: return v
        case let v as UInt: return v
        case let v as UInt8: return Int(v)
        case let v as UInt16: return Int(v)
        case let v as UInt32: return Int(v)
        case let v as UInt64: return v
        case let v as Float: return number(Double("\(v)") ?? Double(v))
        case let v as Double: return number(v)
        case let v as CGFloat: return number(Double(v))
        case let v as UIImage: return v.jpegData(compressionQuality: 0.8)?.base64EncodedString() ?? NSNull()
        case let v as Data: return v.base64EncodedString()
        case let v as URL: return v.absoluteString
        case let v as Date: return ISO8601DateFormatter().string(from: v)
        default: break
        }

        let mirror = Mirror(reflecting: value)
        switch mirror.displayStyle {
        case .optional:
            guard let child = mirror.children.first else { return NSNull() }
            return jsonValue(child.value, depth: depth)
        case .collection, .set:
            return mirror.children.map { jsonValue($0.value, depth: depth + 1) }
        case .dictionary:
            var out = [String: Any]()
            for child in mirror.children {
                let pair = Array(Mirror(reflecting: child.value).children)
                guard pair.count == 2 else { continue }
                out["\(pair[0].value)"] = jsonValue(pair[1].value, depth: depth + 1)
            }
            return out
        case .enum:
            if mirror.children.isEmpty { return "\(value)" }
            var out = [String: Any]()
            for child in mirror.children {
                out[child.label ?? "value"] = jsonValue(child.value, depth: depth + 1)
            }
            return out
        case .struct, .class, .tuple:
            var out = [String: Any]()
            for (index, child) in mirror.children.enumerated() {
                out[child.label ?? "\(index)"] = jsonValue(child.value, depth: depth + 1)
            }
            return out
        default:
            return "\(value)"
        }
    }

    private static func number(_ v: Double) -> Any {
        v.isNaN || v.isInfinite ? "\(v)" : v
    }
}
