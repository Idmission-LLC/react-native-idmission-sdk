#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface IDMissionSDK :RCTEventEmitter <RCTBridgeModule>

+(void) getEvent:(NSString*)type dict:(NSMutableDictionary*)dict;

- (void) getEvent2:(NSString*)type dict:(NSMutableDictionary*)dict;

@end

NS_ASSUME_NONNULL_END
