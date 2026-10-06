//
//  IDMissionSDK.m
//  idmission
//

#import "IDMissionSDK.h"
#import <React/RCTEventEmitter.h>

// Generated Swift interface header for this pod. The header search path differs
// between framework (use_frameworks!) and static-library linkage, so try both.
#if __has_include(<react_native_idmission_sdk/react_native_idmission_sdk-Swift.h>)
#import <react_native_idmission_sdk/react_native_idmission_sdk-Swift.h>
#else
#import "react_native_idmission_sdk-Swift.h"
#endif

@interface IDMissionSDK ()

@end

@implementation IDMissionSDK

static IDMissionSDK *gInstance = NULL;

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"onSessionConnect",@"DataCallback"];

}

RCT_EXPORT_METHOD(initializeSDK:(NSString *)apiBaseUrl accessToken:(NSString *)accessToken options:(NSDictionary *)options)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  gInstance = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    [rootViewController viewDidLoad];
    id objects[] = { apiBaseUrl, accessToken, options ?: @{} };
    id keys[] = { @"apiBaseUrl", @"accessToken", @"options"};
    NSUInteger count = sizeof(objects) / sizeof(id);
    NSDictionary *dictionary = [NSDictionary dictionaryWithObjects:objects
                                                           forKeys:keys
                                                             count:count];
    
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client initializeSDKWithData:dictionary instances:rootViewController];
  });
}

RCT_EXPORT_METHOD(getSDKInfo:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve([IDentitySDKHelper sdkInfo]);
}

RCT_EXPORT_METHOD(serviceID20)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client startIDValidationsWithInstances: rootViewController];
  });
}

RCT_EXPORT_METHOD(serviceID10)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client startIDValidationAndMatchFacesWithInstances: rootViewController];
  });
}

RCT_EXPORT_METHOD(serviceID50:(NSString *)uniqueNumber)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client startIDValidationAndCustomerEnrollsWithUniqueNumbers:uniqueNumber instances:rootViewController];
  });
}

RCT_EXPORT_METHOD(serviceID175:(NSString *)uniqueNumber)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client startCustomerEnrollBiometricssWithUniqueNumbers:uniqueNumber instances:rootViewController];
  });
}

RCT_EXPORT_METHOD(serviceID105:(NSString *)uniqueNumber)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client startCustomerVerificationsWithUniqueNumbers:uniqueNumber instances:rootViewController];
  });
}

RCT_EXPORT_METHOD(serviceID185)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client startIdentifyCustomersWithInstances: rootViewController];
  });
}

RCT_EXPORT_METHOD(serviceID660)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client startLiveFaceChecksWithInstances: rootViewController];
  });
}

RCT_EXPORT_METHOD(submitResult)
{
  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    IDentitySDKHelper *client = [IDentitySDKHelper new];
    [client submitResultWithInstances:rootViewController];
  });
}

RCT_EXPORT_MODULE(IDMissionSDK);

+ (void)getEvent: (NSString*)type dict:(NSMutableDictionary*) dict
{
 
  [gInstance sendEventWithName:type body:dict];

}

- (void) getEvent2: (NSString*)type dict:(NSMutableDictionary*) dict
{
  [gInstance sendEventWithName:type body:dict];
}

@end
