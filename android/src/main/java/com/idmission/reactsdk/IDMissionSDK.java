package com.idmission.reactsdk;

import static android.app.Activity.RESULT_CANCELED;
import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Parcelable;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.idmission.sdk2.capture.IdMissionCaptureLauncher;
import com.idmission.sdk2.capture.presentation.camera.helpers.CaptureBack;
import com.idmission.sdk2.capture.presentation.camera.helpers.ProcessedCapture;
import com.idmission.sdk2.client.model.AdditionalCustomerLiveCheckResponseData;
import com.idmission.sdk2.client.model.AliasesResponse;
import com.idmission.sdk2.client.model.CameraFacing;
import com.idmission.sdk2.client.model.CameraOrientation;
import com.idmission.sdk2.client.model.CardData;
import com.idmission.sdk2.client.model.CommonApiResponse;
import com.idmission.sdk2.client.model.CriminalRecordResponse;
import com.idmission.sdk2.client.model.DeduplicationDataResponse;
import com.idmission.sdk2.client.model.ExtractedIdData;
import com.idmission.sdk2.client.model.ExtractedPersonalData;
import com.idmission.sdk2.client.model.HostDataResponse;
import com.idmission.sdk2.client.model.InitializeResponse;
import com.idmission.sdk2.client.model.NmResultResponse;
import com.idmission.sdk2.client.model.OffensesResponse;
import com.idmission.sdk2.client.model.PepResultResponse;
import com.idmission.sdk2.client.model.ProfilesResponse;
import com.idmission.sdk2.client.model.Response;
import com.idmission.sdk2.client.model.ResponseCustomerData;
import com.idmission.sdk2.client.model.ResultData;
import com.idmission.sdk2.client.model.SDKCustomizationOptions;
import com.idmission.sdk2.client.model.SexOffendersResponse;
import com.idmission.sdk2.client.model.Status;
import com.idmission.sdk2.client.model.TextMatchResultResponse;
import com.idmission.sdk2.client.model.WlsResultResponse;
import com.idmission.sdk2.identityproofing.IdentityProofingSDK;
import com.idmission.sdk2.utils.LANGUAGE;
import com.idmission.sdk2.client.model.CustomerDataMatchResult;
import com.idmission.sdk2.client.model.DocumentTamper;
import com.idmission.sdk2.client.model.ExtractedPOAData;
import com.idmission.sdk2.client.model.IneQRResponse;
import com.idmission.sdk2.client.model.IneResponse;
import com.idmission.sdk2.client.model.ParsedAddress;
import com.idmission.sdk2.client.model.RenapoResponse;
import com.idmission.sdk2.client.model.VideoIDData;
import org.json.JSONArray;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

public class IDMissionSDK extends ReactContextBaseJavaModule implements ActivityEventListener {
    String ApiBaseUrl,AuthUrl = "https://api.idmission.com/";
    String AccessToken = "";
    boolean IsDebug = false;
    ReactApplicationContext reactContext;

    //constructor
    public IDMissionSDK(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "IDMissionSDK";
    }

    @ReactMethod
    public void initializeSDK(String apiBaseUrl, String authUrl, String debug, String accessToken) {

        ApiBaseUrl = apiBaseUrl;
        AuthUrl = apiBaseUrl;

        if(null!=debug && debug.contains("y")){
            IsDebug=true;
        }else{
            IsDebug=false;
        }

        AccessToken = accessToken;
        new BackgroundTask().execute();
    }

    @ReactMethod
    public void  serviceID20() {

        try {
            IdentityProofingSDK.idValidation(getReactApplicationContext().getCurrentActivity(),
                    CaptureBack.AUTO);
        } catch (Exception e) {
            WritableMap params = Arguments.createMap();
            params.putString("data","SDK is not initialized. Please ensure initialization is completed before use.");
            sendEvent(getReactApplicationContext(), "DataCallback", params);
        }
    }

    @ReactMethod
    public void  serviceID10() {
        try {
            IdentityProofingSDK.idValidationAndMatchFace(getReactApplicationContext().getCurrentActivity(),
                    CaptureBack.AUTO);
        } catch (Exception e) {
            WritableMap params = Arguments.createMap();
            params.putString("data","SDK is not initialized. Please ensure initialization is completed before use.");
            sendEvent(getReactApplicationContext(), "DataCallback", params);
        }
    }

    @ReactMethod
    public void  serviceID185() {
        try {
            IdentityProofingSDK.identifyCustomer(getReactApplicationContext().getCurrentActivity(), null, null);
        } catch (Exception e) {
            WritableMap params = Arguments.createMap();
            params.putString("data","SDK is not initialized. Please ensure initialization is completed before use.");
            sendEvent(getReactApplicationContext(), "DataCallback", params);
        }
    }

    @ReactMethod
    public void  serviceID660() {
        try {
        IdentityProofingSDK.liveFaceCheck(getReactApplicationContext().getCurrentActivity());
        } catch (Exception e) {
            WritableMap params = Arguments.createMap();
            params.putString("data","SDK is not initialized. Please ensure initialization is completed before use.");
            sendEvent(getReactApplicationContext(), "DataCallback", params);
        }
    }

    @ReactMethod
    public void  serviceID50(String uniqueCustomerNumber) {
        if(!StringUtils.isEmpty(uniqueCustomerNumber) && uniqueCustomerNumber.length()>1){
            try {
            IdentityProofingSDK.idValidationAndcustomerEnroll(getReactApplicationContext().getCurrentActivity(), uniqueCustomerNumber);
            } catch (Exception e) {
                WritableMap params = Arguments.createMap();
                params.putString("data","SDK is not initialized. Please ensure initialization is completed before use.");
                sendEvent(getReactApplicationContext(), "DataCallback", params);
            }
        }else{
            WritableMap params = Arguments.createMap();
            params.putString("data","Unique customer number is required.");
            sendEvent(getReactApplicationContext(), "DataCallback", params);
        }
    }

    @ReactMethod
    public void  serviceID175(String uniqueCustomerNumber) {
        if(!StringUtils.isEmpty(uniqueCustomerNumber)&& uniqueCustomerNumber.length()>1){
            try {
            IdentityProofingSDK.customerEnrollBiometrics(getReactApplicationContext().getCurrentActivity(), uniqueCustomerNumber);
            } catch (Exception e) {
                WritableMap params = Arguments.createMap();
                params.putString("data","SDK is not initialized. Please ensure initialization is completed before use.");
                sendEvent(getReactApplicationContext(), "DataCallback", params);
            }
        }else{
            WritableMap params = Arguments.createMap();
            params.putString("data","Unique customer number is required.");
            sendEvent(getReactApplicationContext(), "DataCallback", params);
        }
    }

    @ReactMethod
    public void  serviceID105(String uniqueCustomerNumber) {
        if(!StringUtils.isEmpty(uniqueCustomerNumber)&& uniqueCustomerNumber.length()>1){
            try {
                IdentityProofingSDK.customerVerification(getReactApplicationContext().getCurrentActivity(), uniqueCustomerNumber);
            } catch (Exception e) {
                WritableMap params = Arguments.createMap();
                params.putString("data","SDK is not initialized. Please ensure initialization is completed before use.");
                sendEvent(getReactApplicationContext(), "DataCallback", params);
            }
        }else{
            WritableMap params = Arguments.createMap();
            params.putString("data","Unique customer number is required.");
            sendEvent(getReactApplicationContext(), "DataCallback", params);
        }
    }

    @ReactMethod
    public void submitResult(){
        new FinalSubmitTask().execute();
    }

    class BackgroundTask extends AsyncTask<Void, Void, Response<InitializeResponse>> {

        @Override
        protected void onPostExecute(Response<InitializeResponse> initializeResponseResponse) {
            super.onPostExecute(initializeResponseResponse);
            WritableMap params = Arguments.createMap();

            try {
                if(!initializeResponseResponse.getResult().toString().isEmpty())
                    params.putString("data","SDK Successfully Initialized");

                sendEvent(getReactApplicationContext(), "DataCallback", params);
            }catch(Exception e){
                try {
                    params.putString("data",initializeResponseResponse.getErrorStatus().toString());
                    sendEvent(getReactApplicationContext(), "DataCallback", params);
                }catch(Exception e1){
                    params.putString("Error ",e.getMessage().toString());
                    sendEvent(getReactApplicationContext(), "DataCallback", params);
                }
            }

        }

        @Override
        protected Response<InitializeResponse> doInBackground(Void... voids) {
            SDKCustomizationOptions sco = new SDKCustomizationOptions(
                    LANGUAGE.EN,
                    false,
                    false,
                    false,
                    CameraFacing.FRONT,
                    CameraFacing.BACK,
                    CameraOrientation.PORTRAIT,
                    IsDebug
            );

            Response<InitializeResponse> response =
                    IdentityProofingSDK.initialize(getReactApplicationContext().getCurrentActivity(),
                            ApiBaseUrl,
                            IsDebug,
                            true,
                            sco,
                            true,
                            AccessToken);
            return response;
        }
    }

    class FinalSubmitTask extends AsyncTask<Void, Void, Response<CommonApiResponse>> {

        @Override
        protected void onPostExecute(Response<CommonApiResponse> apiResponse) {
            super.onPostExecute(apiResponse);
            if(apiResponse.getErrorStatus()!=null) {
                WritableMap params = Arguments.createMap();
                params.putString("data",apiResponse.getErrorStatus().getStatusMessage());
                sendEvent(getReactApplicationContext(), "DataCallback", params);
            } else  {
                WritableMap params = Arguments.createMap();
                params.putString("data",parseResponse(apiResponse));
                System.out.println("parseResponse(apiResponse) "+parseResponse(apiResponse));
                System.out.println("params.toString() "+params.toString());
                sendEvent(getReactApplicationContext(), "DataCallback", params);
            }
        }

        @Override
        protected Response<CommonApiResponse> doInBackground(Void... voids) {
            Response<CommonApiResponse> response =
                    IdentityProofingSDK.INSTANCE.finalSubmit(getReactApplicationContext().getCurrentActivity());
            return response;
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == IdMissionCaptureLauncher.CAPTURE_REQUEST_CODE) {
                if(resultCode == RESULT_CANCELED) {
                    WritableMap params = Arguments.createMap();
                    params.putString("data","The operation was cancelled by the user.");
                    sendEvent(getReactApplicationContext(), "DataCallback", params);
                }else{
                    if (data != null) {
                        try{
                            Parcelable[] processedCaptures = data.getExtras().getParcelableArray(IdMissionCaptureLauncher.EXTRA_PROCESSED_CAPTURES);

                            JSONObject jo = new JSONObject();

                            for (Parcelable pc : processedCaptures)
                            {
                                if (pc instanceof ProcessedCapture.DocumentDetectionResult.RealDocument) {
                                    try {
                                        ProcessedCapture.DocumentDetectionResult.RealDocument rd = (ProcessedCapture.DocumentDetectionResult.RealDocument) pc;

                                        JSONObject realDocumentData = new JSONObject();
                                        realDocumentData.put("barcodeMap",rd.getBarcodeMap());
                                        realDocumentData.put("barcodeString",rd.getBarcodeString());
                                        realDocumentData.put("mrzMap",rd.getMrzMap());
                                        realDocumentData.put("confidenceScore",rd.getConfidenceScore());
                                        realDocumentData.put("detectedRect",rd.getDetectedRect());
                                        realDocumentData.put("faceMatch",rd.getFaceMatch());
                                        realDocumentData.put("faceOnId",rd.getFaceOnId());
                                        realDocumentData.put("file",rd.getFile());
                                        realDocumentData.put("mrzString",rd.getMrzString());
                                        realDocumentData.put("ocrString",rd.getOcrString());
                                        realDocumentData.put("operation",rd.getOperation());
                                        realDocumentData.put("realnessScore",rd.getRealnessScore());
                                        realDocumentData.put("timeDetectedAt",rd.getTimeDetectedAt());
                                        realDocumentData.put("timeFinishedAt",rd.getTimeFinishedAt());
                                        realDocumentData.put("timeStartedAt",rd.getTimeStartedAt());
                                        realDocumentData.put("timeWithinBoundsAt",rd.getTimeWithinBoundsAt());
                                        realDocumentData.put("modelName",rd.getModelName());

                                        jo.put("realDocument",realDocumentData);
                                    }catch(Exception e){}
                                }else if (pc instanceof ProcessedCapture.DocumentDetectionResult.SpoofDocument) {
                                    try {
                                        ProcessedCapture.DocumentDetectionResult.SpoofDocument sd = (ProcessedCapture.DocumentDetectionResult.SpoofDocument) pc;

                                        JSONObject spoofDocumentData = new JSONObject();
                                        spoofDocumentData.put("confidenceScore",sd.getConfidenceScore());
                                        spoofDocumentData.put("detectedRect",sd.getDetectedRect());
                                        spoofDocumentData.put("operation",sd.getOperation());
                                        spoofDocumentData.put("realnessScore",sd.getRealnessScore());
                                        spoofDocumentData.put("timeDetectedAt",sd.getTimeDetectedAt());
                                        spoofDocumentData.put("timeFinishedAt",sd.getTimeFinishedAt());
                                        spoofDocumentData.put("timeStartedAt",sd.getTimeStartedAt());
                                        spoofDocumentData.put("timeWithinBoundsAt",sd.getTimeWithinBoundsAt());
                                        spoofDocumentData.put("modelName",sd.getModelName());

                                        jo.put("spoofDocument",spoofDocumentData);
                                    }catch(Exception e){}
                                }else if (pc instanceof ProcessedCapture.LiveFaceDetectionResult.RealFace) {
                                    try {
                                        ProcessedCapture.LiveFaceDetectionResult.RealFace rf = (ProcessedCapture.LiveFaceDetectionResult.RealFace) pc;

                                        JSONObject realFaceData = new JSONObject();
                                        realFaceData.put("detectedRect",rf.getDetectedRect());
                                        realFaceData.put("operation",rf.getOperation());
                                        realFaceData.put("timeDetectedAt",rf.getTimeDetectedAt());
                                        realFaceData.put("timeFinishedAt",rf.getTimeFinishedAt());
                                        realFaceData.put("timeStartedAt",rf.getTimeStartedAt());
                                        realFaceData.put("timeWithinBoundsAt",rf.getTimeWithinBoundsAt());
                                        realFaceData.put("faceMatch",rf.getFaceMatch());
                                        realFaceData.put("file",rf.getFile());
                                        realFaceData.put("livenessScore",rf.getLivenessScore());

                                        jo.put("realFace",realFaceData);
                                    }catch(Exception e){}
                                }else if (pc instanceof ProcessedCapture.LiveFaceDetectionResult.SpoofFace) {
                                    try {
                                        ProcessedCapture.LiveFaceDetectionResult.SpoofFace sf = (ProcessedCapture.LiveFaceDetectionResult.SpoofFace) pc;

                                        JSONObject spoofFaceData = new JSONObject();
                                        spoofFaceData.put("detectedRect",sf.getDetectedRect());
                                        spoofFaceData.put("operation",sf.getOperation());
                                        spoofFaceData.put("timeDetectedAt",sf.getTimeDetectedAt());
                                        spoofFaceData.put("timeFinishedAt",sf.getTimeFinishedAt());
                                        spoofFaceData.put("timeStartedAt",sf.getTimeStartedAt());
                                        spoofFaceData.put("timeWithinBoundsAt",sf.getTimeWithinBoundsAt());
                                        spoofFaceData.put("livenessScore",sf.getLivenessScore());

                                        jo.put("spoofFace",spoofFaceData);
                                    }catch(Exception e){}
                                }
                            }

                            WritableMap params = Arguments.createMap();
                            params.putString("data",jo.toString());
                            sendEvent(getReactApplicationContext(), "DataCallback", params);
                        }catch(Exception e){
                            e.printStackTrace();
                        }
                    }else{
                        WritableMap params = Arguments.createMap();
                        params.putString("data","Error");
                        sendEvent(getReactApplicationContext(), "DataCallback", params);
                    }
                }
            }
    }

    @Override
    public void onNewIntent(Intent intent) {}

    private void sendEvent(ReactApplicationContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private String parseResponse(Response<CommonApiResponse> response){
        JSONObject jo = new JSONObject();

        // === Status ===
        try {
            JSONObject statusData = new JSONObject();

            Status status = response.getResult().getStatus();
            statusData.put("statusCode",status.getStatusCode());
            statusData.put("requestId",status.getRequestId());
            statusData.put("errorData",status.getErrorData());
            statusData.put("statusMessage",status.getStatusMessage());
            statusData.put("idToken",status.getIdToken());
            statusData.put("traceId",status.getTraceId());
            statusData.put("ipAddress",status.getIpAddress());

            jo.put("status", statusData);
        }catch(Exception e){}

        // === ResultData ===
        try {
            JSONObject resultData = new JSONObject();

            ResultData rd = response.getResult().getResultData();
            resultData.put("uniqueRequestId",rd.getUniqueRequestId());
            resultData.put("verificationResultCode",rd.getVerificationResultCode());
            resultData.put("verificationResultId",rd.getVerificationResultId());
            resultData.put("verificationResult",rd.getVerificationResult());
            resultData.put("verificationResultDetails",rd.getVerificationResultDetails() != null ? rd.getVerificationResultDetails().toString() : null);
            resultData.put("faceVerificationResult",rd.getFaceVerificationResult());
            resultData.put("faceVerificationScore",rd.getFaceVerificationScore());
            resultData.put("faceMask",rd.getFaceMask());
            resultData.put("faceMaskScore",rd.getFaceMaskScore());
            resultData.put("liveFace",rd.getLiveFace());
            resultData.put("realScore",rd.getRealScore());
            resultData.put("headCovering",rd.getHeadCovering());
            resultData.put("headCoveringScore",rd.getHeadCoveringScore());
            resultData.put("eyeCovering",rd.getEyeCovering());
            resultData.put("eyeCoveringScore",rd.getEyeCoveringScore());
            resultData.put("cellPhone",rd.getCellPhone());
            resultData.put("cellPhoneScore",rd.getCellPhoneScore());
            resultData.put("estimatedAge",rd.getEstimatedAge());
            resultData.put("predicatedGender",rd.getPredicatedGender());
            resultData.put("closedEyes",rd.getClosedEyes());

            // VideoIDData
            try {
                VideoIDData vid = rd.getVideoIDData();
                if (vid != null) {
                    JSONObject videoIDData = new JSONObject();
                    videoIDData.put("selfieVideoPhotoMatchScore",vid.getSelfieVideoPhotoMatchScore());
                    videoIDData.put("idPhotoVideoPhotoMatchScore",vid.getIdPhotoVideoPhotoMatchScore());
                    videoIDData.put("idFrontTextMatchingScore",vid.getIdFrontTextMatchingScore());
                    videoIDData.put("idBackTextMatchingScore",vid.getIdBackTextMatchingScore());
                    videoIDData.put("audioTextMatchingScore",vid.getAudioTextMatchingScore());
                    videoIDData.put("extractedAudioText",vid.getExtractedAudioText());
                    videoIDData.put("extractedAudio",vid.getExtractedAudio());
                    resultData.put("videoIDData",videoIDData);
                }
            }catch(Exception e){}

            jo.put("resultData", resultData);
        }catch(Exception e){}

        // === ResponseCustomerData ===
        try {
            jo.put("responseCustomerData", buildResponseCustomerDataJson(response.getResult().getResponseCustomerData()));
        }catch(Exception e){}

        // === ResponseCustomerVerifyData ===
        try {
            jo.put("responseCustomerVerifyData", buildResponseCustomerDataJson(response.getResult().getResponseCustomerVerifyData()));
        }catch(Exception e){}

        // === DeDuplicationData ===
        try {
            java.util.List<DeduplicationDataResponse> deDupList = response.getResult().getDeDuplicationData();
            if (deDupList != null && !deDupList.isEmpty()) {
                JSONArray deDupArray = new JSONArray();
                for (DeduplicationDataResponse ddr : deDupList) {
                    JSONObject deDupItem = new JSONObject();
                    deDupItem.put("clientCustomerNumber",ddr.getClientCustomerNumber());
                    deDupItem.put("customerCode",ddr.getCustomerCode());
                    deDupItem.put("customerName",ddr.getCustomerName());
                    deDupItem.put("duplicateBackImage",ddr.getDuplicateBackImage());
                    deDupItem.put("duplicateFrontImage",ddr.getDuplicateFrontImage());
                    deDupItem.put("duplicatePersonId",ddr.getDuplicatePersonId());
                    deDupItem.put("duplicateVoiceMatchScore",ddr.getDuplicateVoiceMatchScore());
                    deDupItem.put("duplicationStatus",ddr.getDuplicationStatus());
                    deDupItem.put("enrolledDate",ddr.getEnrolledDate());
                    deDupItem.put("faceImage",ddr.getFaceImage());
                    deDupItem.put("faceMatchingScore",ddr.getFaceMatchingScore());
                    deDupItem.put("fingerPrintData",ddr.getFingerPrintData());
                    deDupItem.put("fpMatchingScore",ddr.getFpMatchingScore());
                    deDupItem.put("isDuplicate",ddr.isDuplicate());
                    deDupItem.put("recordType",ddr.getRecordType());
                    deDupArray.put(deDupItem);
                }
                jo.put("deDuplicationData", deDupArray);
            }
        }catch(Exception e){}

        // === AdditionalCustomerLiveCheckResponseData ===
        try {
            JSONObject additionalCustomerLiveCheckResponseData = new JSONObject();

            AdditionalCustomerLiveCheckResponseData aclcrd = response.getResult().getAdditionalData();
            additionalCustomerLiveCheckResponseData.put("liveFaceDetectionFlag",aclcrd.getLiveFaceDetectionFlag());
            additionalCustomerLiveCheckResponseData.put("verifyDataWithHost",aclcrd.getVerifyDataWithHost());
            additionalCustomerLiveCheckResponseData.put("autofillServiceStatus",aclcrd.getAutofillServiceStatus());

            jo.put("additionalCustomerLiveCheckResponseData", additionalCustomerLiveCheckResponseData);
        }catch(Exception e){}

        // === ParsedAddress (top-level) ===
        try {
            ParsedAddress pa = response.getResult().getParsedAddress();
            if (pa != null) {
                jo.put("parsedAddress", buildParsedAddressJson(pa));
            }
        }catch(Exception e){}

        return jo.toString();
    }

    private JSONObject buildParsedAddressJson(ParsedAddress pa) throws Exception {
        JSONObject parsedAddressData = new JSONObject();
        parsedAddressData.put("streetNumber",pa.getStreetNumber());
        parsedAddressData.put("streetName",pa.getStreetName());
        parsedAddressData.put("unit",pa.getUnit());
        parsedAddressData.put("municipality",pa.getMunicipality());
        parsedAddressData.put("province",pa.getProvince());
        parsedAddressData.put("postalCode",pa.getPostalCode());
        parsedAddressData.put("orientation",pa.getOrientation());
        return parsedAddressData;
    }

    private JSONObject buildResponseCustomerDataJson(ResponseCustomerData rcd) throws Exception {
        JSONObject responseCustomerData = new JSONObject();

        // === ExtractedIdData ===
        try {
            ExtractedIdData eid = rcd.getExtractedIdData();
            if (eid != null) {
                JSONObject extractedIdData = new JSONObject();
                extractedIdData.put("ageOver18",eid.getAgeOver18());
                extractedIdData.put("barcodeDataParsed",eid.getBarcodeDataParsed());
                extractedIdData.put("idCountry",eid.getIdCountry());
                extractedIdData.put("idDateOfBirth",eid.getIdDateOfBirth());
                extractedIdData.put("idDateOfBirthFormatted",eid.getIdDateOfBirthFormatted());
                extractedIdData.put("idDateOfBirthNonEng",eid.getIdDateOfBirthNonEng());
                extractedIdData.put("idExpirationDate",eid.getIdExpirationDate());
                extractedIdData.put("idExpirationDateFormatted",eid.getIdExpirationDateFormatted());
                extractedIdData.put("idExpirationDateNonEng",eid.getIdExpirationDateNonEng());
                extractedIdData.put("idIssueCountry",eid.getIdIssueCountry());
                extractedIdData.put("idIssueDate",eid.getIdIssueDate());
                extractedIdData.put("idIssueDateNonEng",eid.getIdIssueDateNonEng());
                extractedIdData.put("idNotExpired",eid.getIdNotExpired());
                extractedIdData.put("idNumber",eid.getIdNumber());
                extractedIdData.put("idNumberNonEng",eid.getIdNumberNonEng());
                extractedIdData.put("idNumber1",eid.getIdNumber1());
                extractedIdData.put("idNumber2",eid.getIdNumber2());
                extractedIdData.put("idNumber2NonEng",eid.getIdNumber2NonEng());
                extractedIdData.put("idNumber3",eid.getIdNumber3());
                extractedIdData.put("idNumber4",eid.getIdNumber4());
                extractedIdData.put("idState",eid.getIdState());
                extractedIdData.put("idType",eid.getIdType());
                extractedIdData.put("mrzData",eid.getMrzData());
                extractedIdData.put("mrzErrorMessage",eid.getMrzErrorMessage());
                extractedIdData.put("nationality",eid.getNationality());
                extractedIdData.put("negativeDBMatchFound",eid.getNegativeDBMatchFound());
                extractedIdData.put("validIdNumber",eid.getValidIdNumber());
                extractedIdData.put("idImageFront",eid.getIdImageFront());
                extractedIdData.put("idImageBack",eid.getIdImageBack());
                extractedIdData.put("idProcessImageFront",eid.getIdProcessImageFront());
                extractedIdData.put("idProcessImageBack",eid.getIdProcessImageBack());
                extractedIdData.put("idNumberDoc",eid.getIdNumberDoc());
                extractedIdData.put("issueDateDoc",eid.getIssueDateDoc());
                extractedIdData.put("expiryDateDoc",eid.getExpiryDateDoc());
                extractedIdData.put("profession",eid.getProfession());
                extractedIdData.put("professionNonEng",eid.getProfessionNonEng());
                extractedIdData.put("photoOnId",eid.getPhotoOnId());
                extractedIdData.put("placeOfIssue",eid.getPlaceOfIssue());
                extractedIdData.put("documentType",eid.getDocumentType());
                extractedIdData.put("idNumber_doc",eid.getIdNumber_doc());
                extractedIdData.put("idNumber1_doc",eid.getIdNumber1_doc());
                extractedIdData.put("idNumber2_doc",eid.getIdNumber2_doc());
                extractedIdData.put("idNumber3_doc",eid.getIdNumber3_doc());
                extractedIdData.put("idNumber4_doc",eid.getIdNumber4_doc());
                extractedIdData.put("idExpirationDate_doc",eid.getIdExpirationDate_doc());
                extractedIdData.put("idIssueDate_doc",eid.getIdIssueDate_doc());
                extractedIdData.put("employer",eid.getEmployer());
                extractedIdData.put("vehicleClass",eid.getVehicleClass());
                extractedIdData.put("endorsement",eid.getEndorsement());
                extractedIdData.put("licenseType",eid.getLicenseType());
                extractedIdData.put("restriction",eid.getRestriction());
                extractedIdData.put("registrationDate",eid.getRegistrationDate());
                extractedIdData.put("replacementDate",eid.getReplacementDate());
                extractedIdData.put("maritalStatus",eid.getMaritalStatus());
                extractedIdData.put("placeOfBirth",eid.getPlaceOfBirth());
                extractedIdData.put("signatureFromId",eid.getSignatureFromId());
                responseCustomerData.put("extractedIdData",extractedIdData);
            }
        }catch(Exception e){}

        // === ExtractedPersonalData ===
        try {
            ExtractedPersonalData epd = rcd.getExtractedPersonalData();
            if (epd != null) {
                JSONObject extractedPersonalData = new JSONObject();
                extractedPersonalData.put("uniqueNumber",epd.getUniqueNumber());
                extractedPersonalData.put("name",epd.getName());
                extractedPersonalData.put("email",epd.getEmail());
                extractedPersonalData.put("dob",epd.getDob());
                extractedPersonalData.put("gender",epd.getGender());
                extractedPersonalData.put("address",epd.getAddress());
                extractedPersonalData.put("addressLine1",epd.getAddressLine1());
                extractedPersonalData.put("addressLine1NonEng",epd.getAddressLine1NonEng());
                extractedPersonalData.put("addressLine2",epd.getAddressLine2());
                extractedPersonalData.put("addressLine2NonEng",epd.getAddressLine2NonEng());
                extractedPersonalData.put("addressLine3",epd.getAddressLine3());
                extractedPersonalData.put("city",epd.getCity());
                extractedPersonalData.put("addressNonEng",epd.getAddressNonEng());
                extractedPersonalData.put("country",epd.getCountry());
                extractedPersonalData.put("state",epd.getState());
                extractedPersonalData.put("district",epd.getDistrict());
                extractedPersonalData.put("postalCode",epd.getPostalCode());
                extractedPersonalData.put("enrolledDate",epd.getEnrolledDate());
                extractedPersonalData.put("firstName",epd.getFirstName());
                extractedPersonalData.put("firstNameNonEng",epd.getFirstNameNonEng());
                extractedPersonalData.put("lastName",epd.getLastName());
                extractedPersonalData.put("lastName2",epd.getLastName2());
                extractedPersonalData.put("lastNameNonEng",epd.getLastNameNonEng());
                extractedPersonalData.put("middleName",epd.getMiddleName());
                extractedPersonalData.put("middleNameNonEng",epd.getMiddleNameNonEng());
                extractedPersonalData.put("phone",epd.getPhone());
                extractedPersonalData.put("eyeColor",epd.getEyeColor());
                extractedPersonalData.put("hairColor",epd.getHairColor());
                extractedPersonalData.put("height",epd.getHeight());
                extractedPersonalData.put("weight",epd.getWeight());
                extractedPersonalData.put("parish",epd.getParish());
                extractedPersonalData.put("lastName2_doc",epd.getLastName2_doc());
                extractedPersonalData.put("firstName_doc",epd.getFirstName_doc());
                extractedPersonalData.put("middleName_doc",epd.getMiddleName_doc());
                extractedPersonalData.put("lastName_doc",epd.getLastName_doc());
                extractedPersonalData.put("name_doc",epd.getName_doc());
                extractedPersonalData.put("dob_doc",epd.getDob_doc());
                extractedPersonalData.put("additionalNames",epd.getAdditionalNames());
                extractedPersonalData.put("additionalNamesNonEng",epd.getAdditionalNamesNonEng());
                extractedPersonalData.put("fingerprintUsedForVerification",epd.getFingerprintUsedForVerification());
                extractedPersonalData.put("enrolledFaceImage",epd.getEnrolledFaceImage());
                extractedPersonalData.put("customerCode",epd.getCustomerCode());
                extractedPersonalData.put("selfieImage",epd.getSelfieImage());
                extractedPersonalData.put("nameDoc",epd.getNameDoc());
                extractedPersonalData.put("firstNameDoc",epd.getFirstNameDoc());
                extractedPersonalData.put("middleNameDoc",epd.getMiddleNameDoc());
                extractedPersonalData.put("lastNameDoc",epd.getLastNameDoc());
                extractedPersonalData.put("lastName2Doc",epd.getLastName2Doc());
                extractedPersonalData.put("addressLine1Doc",epd.getAddressLine1Doc());
                extractedPersonalData.put("addressLine2Doc",epd.getAddressLine2Doc());
                extractedPersonalData.put("dateOfBirthDoc",epd.getDateOfBirthDoc());
                responseCustomerData.put("extractedPersonalData",extractedPersonalData);
            }
        }catch(Exception e){}

        // === ExtractedPOAData ===
        try {
            java.util.List<ExtractedPOAData> poaList = rcd.getExtractedPOAData();
            if (poaList != null && !poaList.isEmpty()) {
                JSONArray poaArray = new JSONArray();
                for (ExtractedPOAData poa : poaList) {
                    JSONObject poaItem = new JSONObject();
                    poaItem.put("issuerName",poa.getIssuerName());
                    poaItem.put("issuerAddress",poa.getIssuerAddress());
                    poaItem.put("invoiceDate",poa.getInvoiceDate());
                    poaItem.put("dueDate",poa.getDueDate());
                    poaItem.put("customerName",poa.getCustomerName());
                    poaItem.put("customerAddress",poa.getCustomerAddress());
                    poaItem.put("amount",poa.getAmount());
                    poaItem.put("addressMatch",poa.getAddressMatch());
                    poaItem.put("postalCodeMatch",poa.getPostalCodeMatch());
                    poaItem.put("addressWithInputMatch",poa.getAddressWithInputMatch());
                    poaItem.put("postalCodeWithInputMatch",poa.getPostalCodeWithInputMatch());
                    poaItem.put("addressMatchScore",poa.getAddressMatchScore());
                    poaItem.put("postalCodeMatchScore",poa.getPostalCodeMatchScore());
                    poaItem.put("addressWithInputMatchScore",poa.getAddressWithInputMatchScore());
                    poaItem.put("postalCodeWithInputMatchScore",poa.getPostalCodeWithInputMatchScore());
                    poaItem.put("fistNameMatchScore",poa.getFistNameMatchScore());
                    poaItem.put("lastNameMatchScore",poa.getLastNameMatchScore());
                    poaItem.put("fistNameMatchScoreWithInputData",poa.getFistNameMatchScoreWithInputData());
                    poaItem.put("lastNameMatchScoreWithInputData",poa.getLastNameMatchScoreWithInputData());
                    poaItem.put("poaDocumentType",poa.getPoaDocumentType());
                    poaItem.put("exifData",poa.getExifData() != null ? poa.getExifData().toString() : null);
                    poaArray.put(poaItem);
                }
                responseCustomerData.put("extractedPOAData",poaArray);
            }
        }catch(Exception e){}

        // === HostDataResponse ===
        try {
            HostDataResponse hdr = rcd.getHostData();
            if (hdr != null) {
                JSONObject hostDataResponseData = new JSONObject();

                // CriminalRecord
                try {
                    CriminalRecordResponse crr = hdr.getCriminalRecord();
                    if (crr != null) {
                        JSONObject criminalRecordResponseData = new JSONObject();

                        // Aliases (List)
                        try {
                            java.util.List<AliasesResponse> aliasesList = crr.getAliases();
                            if (aliasesList != null && !aliasesList.isEmpty()) {
                                JSONArray aliasesArray = new JSONArray();
                                for (AliasesResponse ar : aliasesList) {
                                    JSONObject aliasItem = new JSONObject();
                                    aliasItem.put("firstName",ar.getFirstName());
                                    aliasItem.put("middleName",ar.getMiddleName());
                                    aliasItem.put("lastName",ar.getLastName());
                                    aliasItem.put("fullName",ar.getFullName());
                                    aliasesArray.put(aliasItem);
                                }
                                criminalRecordResponseData.put("aliases",aliasesArray);
                            }
                        }catch(Exception e){}

                        // Offenses (List)
                        try {
                            java.util.List<OffensesResponse> offensesList = crr.getOffenses();
                            if (offensesList != null && !offensesList.isEmpty()) {
                                JSONArray offensesArray = new JSONArray();
                                for (OffensesResponse or : offensesList) {
                                    JSONObject offenseItem = new JSONObject();
                                    offenseItem.put("addmissionDate",or.getAddmissionDate());
                                    offenseItem.put("ageOfVictim",or.getAgeOfVictim());
                                    offenseItem.put("arrestingAgency",or.getArrestingAgency());
                                    offenseItem.put("caseNumber",or.getCaseNumber());
                                    offenseItem.put("category",or.getCategory());
                                    offenseItem.put("chargeFillingDate",or.getChargeFillingDate());
                                    offenseItem.put("closedDate",or.getClosedDate());
                                    offenseItem.put("code",or.getCode());
                                    offenseItem.put("counts",or.getCounts());
                                    offenseItem.put("courts",or.getCourts());
                                    offenseItem.put("dateConvicted",or.getDateConvicted());
                                    offenseItem.put("dateOfCrime",or.getDateOfCrime());
                                    offenseItem.put("dateOfWarrant",or.getDateOfWarrant());
                                    offenseItem.put("description",or.getDescription());
                                    offenseItem.put("dispositionDate",or.getDispositionDate());
                                    offenseItem.put("dispostion",or.getDispostion());
                                    offenseItem.put("facility",or.getFacility());
                                    offenseItem.put("jurisdication",or.getJurisdication());
                                    offenseItem.put("prisonerNumber",or.getPrisonerNumber());
                                    offenseItem.put("relationshipToVictim",or.getRelationshipToVictim());
                                    offenseItem.put("releaseDate",or.getReleaseDate());
                                    offenseItem.put("section",or.getSection());
                                    offenseItem.put("sentence",or.getSentence());
                                    offenseItem.put("sentenceDate",or.getSentenceDate());
                                    offenseItem.put("subsection",or.getSubsection());
                                    offenseItem.put("title",or.getTitle());
                                    offenseItem.put("warrantDate",or.getWarrantDate());
                                    offenseItem.put("warrantNumber",or.getWarrantNumber());
                                    offenseItem.put("weaponsUsed",or.getWeaponsUsed());
                                    offensesArray.put(offenseItem);
                                }
                                criminalRecordResponseData.put("offenses",offensesArray);
                            }
                        }catch(Exception e){}

                        // Profiles (List)
                        try {
                            java.util.List<ProfilesResponse> profilesList = crr.getProfiles();
                            if (profilesList != null && !profilesList.isEmpty()) {
                                criminalRecordResponseData.put("profiles",buildProfilesArray(profilesList));
                            }
                        }catch(Exception e){}

                        hostDataResponseData.put("criminalRecord",criminalRecordResponseData);
                    }
                }catch(Exception e){}

                // NmResult
                try {
                    NmResultResponse nrr = hdr.getNmresult();
                    if (nrr != null) {
                        JSONObject nmData = new JSONObject();
                        nmData.put("createdOnNM",nrr.getCreatedOnNM());
                        nmData.put("orderIdNM",nrr.getOrderIdNM());
                        nmData.put("resultCountNM",nrr.getResultCountNM());
                        nmData.put("orderStatusNM",nrr.getOrderStatusNM());
                        nmData.put("orderUrlNM",nrr.getOrderUrlNM());
                        nmData.put("productIdNM",nrr.getProductIdNM());
                        nmData.put("vital4APIHostTried",nrr.getVital4APIHostTried());
                        hostDataResponseData.put("nmResult",nmData);
                    }
                }catch(Exception e){}

                // PepResult
                try {
                    PepResultResponse prr = hdr.getPepresult();
                    if (prr != null) {
                        JSONObject pepData = new JSONObject();
                        pepData.put("createdOnPEP",prr.getCreatedOnPEP());
                        pepData.put("orderIdPEP",prr.getOrderIdPEP());
                        pepData.put("resultCountPEP",prr.getResultCountPEP());
                        pepData.put("productId_PEP",prr.getProductId_PEP());
                        pepData.put("orderUrlPEP",prr.getOrderUrlPEP());
                        pepData.put("orderStatus_PEP",prr.getOrderStatus_PEP());
                        hostDataResponseData.put("pepresult",pepData);
                    }
                }catch(Exception e){}

                // TextMatchResult
                try {
                    TextMatchResultResponse tmrr = hdr.getTextMatchResult();
                    if (tmrr != null) {
                        JSONObject tmData = new JSONObject();
                        tmData.put("address",tmrr.getAddress());
                        tmData.put("addressCityMatch",tmrr.getAddressCityMatch());
                        tmData.put("addressLine1Match",tmrr.getAddressLine1Match());
                        tmData.put("addressLine2Match",tmrr.getAddressLine2Match());
                        tmData.put("addressZIP4Match",tmrr.getAddressZIP4Match());
                        tmData.put("addressStateCodeMatch",tmrr.getAddressStateCodeMatch());
                        tmData.put("addressZIP5Match",tmrr.getAddressZIP5Match());
                        tmData.put("documentCategoryMatch",tmrr.getDocumentCategoryMatch());
                        tmData.put("driverLicenseExpirationDateMatch",tmrr.getDriverLicenseExpirationDateMatch());
                        tmData.put("driverLicenseIssueDateMatch",tmrr.getDriverLicenseIssueDateMatch());
                        tmData.put("driverLicenseNumberMatch",tmrr.getDriverLicenseNumberMatch());
                        tmData.put("hostTried",tmrr.getHostTried());
                        tmData.put("identiFraudHostTried",tmrr.getIdentiFraudHostTried());
                        tmData.put("personBirthDateMatch",tmrr.getPersonBirthDateMatch());
                        tmData.put("personFirstNameExactMatch",tmrr.getPersonFirstNameExactMatch());
                        tmData.put("personFirstNameFuzzyAlternateMatch",tmrr.getPersonFirstNameFuzzyAlternateMatch());
                        tmData.put("personFirstNameFuzzyPrimaryMatch",tmrr.getPersonFirstNameFuzzyPrimaryMatch());
                        tmData.put("personLastNameExactMatch",tmrr.getPersonLastNameExactMatch());
                        tmData.put("personLastNameFuzzyAlternateMatch",tmrr.getPersonLastNameFuzzyAlternateMatch());
                        tmData.put("personLastNameFuzzyPrimaryMatch",tmrr.getPersonLastNameFuzzyPrimaryMatch());
                        tmData.put("personMiddleInitialMatch",tmrr.getPersonMiddleInitialMatch());
                        tmData.put("personMiddleNameExactMatch",tmrr.getPersonMiddleNameExactMatch());
                        tmData.put("personMiddleNameFuzzyAlternateMatch",tmrr.getPersonMiddleNameFuzzyAlternateMatch());
                        tmData.put("personMiddleNameFuzzyPrimaryMatch",tmrr.getPersonMiddleNameFuzzyPrimaryMatch());
                        tmData.put("personSexCodeMatch",tmrr.getPersonSexCodeMatch());
                        tmData.put("servicePresent",tmrr.getServicePresent());
                        tmData.put("thirdPartyVerificationResultDescription",tmrr.getThirdPartyVerificationResultDescription());
                        tmData.put("verificationResult",tmrr.getVerificationResult());
                        hostDataResponseData.put("textMatchResult",tmData);
                    }
                }catch(Exception e){}

                // SexOffenders
                try {
                    SexOffendersResponse sor = hdr.getSexOffenders();
                    if (sor != null) {
                        JSONObject sexOffendersData = new JSONObject();
                        try {
                            java.util.List<ProfilesResponse> profilesList = sor.getProfiles();
                            if (profilesList != null && !profilesList.isEmpty()) {
                                sexOffendersData.put("profiles",buildProfilesArray(profilesList));
                            }
                        }catch(Exception e){}
                        hostDataResponseData.put("sexOffenders",sexOffendersData);
                    }
                }catch(Exception e){}

                // WlsResult
                try {
                    WlsResultResponse wrr = hdr.getWlsresult();
                    if (wrr != null) {
                        JSONObject wlsData = new JSONObject();
                        wlsData.put("createdOnWLS",wrr.getCreatedOnWLS());
                        wlsData.put("orderIdWLS",wrr.getOrderIdWLS());
                        wlsData.put("resultCountWLS",wrr.getResultCountWLS());
                        wlsData.put("productIdWLS",wrr.getProductIdWLS());
                        wlsData.put("orderStatusWLS",wrr.getOrderStatusWLS());
                        wlsData.put("orderUrlWLS",wrr.getOrderUrlWLS());
                        hostDataResponseData.put("wlsresult",wlsData);
                    }
                }catch(Exception e){}

                // IneResponse
                try {
                    IneResponse ineResp = hdr.getIneResponse();
                    if (ineResp != null) {
                        JSONObject ineData = new JSONObject();
                        ineData.put("claveElector",ineResp.getClaveElector());
                        ineData.put("anioRegistro",ineResp.getAnioRegistro());
                        ineData.put("vigencia",ineResp.getVigencia());
                        ineData.put("ineCodigoValidacion",ineResp.getIneCodigoValidacion());
                        ineData.put("ineEstatus",ineResp.getIneEstatus());
                        ineData.put("numeroEmision",ineResp.getNumeroEmision());
                        ineData.put("anioEmision",ineResp.getAnioEmision());
                        ineData.put("claveMensaje",ineResp.getClaveMensaje());
                        ineData.put("mensaje",ineResp.getMensaje());
                        ineData.put("ocr",ineResp.getOcr());
                        ineData.put("error",ineResp.getError());
                        hostDataResponseData.put("ineResponse",ineData);
                    }
                }catch(Exception e){}

                // RenapoResponse
                try {
                    RenapoResponse renapoResp = hdr.getRenapoResponse();
                    if (renapoResp != null) {
                        JSONObject renapoData = new JSONObject();
                        renapoData.put("renapoEstatus",renapoResp.getRenapoEstatus());
                        renapoData.put("renapoCodigoValidacion",renapoResp.getRenapoCodigoValidacion());
                        renapoData.put("fechaNacimiento",renapoResp.getFechaNacimiento());
                        renapoData.put("estadoNacimiento",renapoResp.getEstadoNacimiento());
                        renapoData.put("nombre",renapoResp.getNombre());
                        renapoData.put("apellidoMaterno",renapoResp.getApellidoMaterno());
                        renapoData.put("apellidoPaterno",renapoResp.getApellidoPaterno());
                        renapoData.put("paisNacimiento",renapoResp.getPaisNacimiento());
                        renapoData.put("sexo",renapoResp.getSexo());
                        renapoData.put("estatusCurp",renapoResp.getEstatusCurp());
                        renapoData.put("error",renapoResp.getError());
                        hostDataResponseData.put("renapoResponse",renapoData);
                    }
                }catch(Exception e){}

                // IneQRResponse
                try {
                    IneQRResponse ineQR = hdr.getIne_QR();
                    if (ineQR != null) {
                        JSONObject ineQRData = new JSONObject();
                        ineQRData.put("hostStatus",ineQR.getHostStatus());
                        ineQRData.put("hostTried",ineQR.getHostTried());
                        ineQRData.put("status",ineQR.getStatus());
                        ineQRData.put("message",ineQR.getMessage());
                        ineQRData.put("validationCode",ineQR.getValidationCode());
                        ineQRData.put("messageCode",ineQR.getMessageCode());
                        ineQRData.put("faceComparison_match",ineQR.getFaceComparison_match());
                        ineQRData.put("qrExtract_face",ineQR.getQrExtract_face());
                        ineQRData.put("qrExtractData_vigencia",ineQR.getQrExtractData_vigencia());
                        ineQRData.put("qrExtractData_apellidoMaterno",ineQR.getQrExtractData_apellidoMaterno());
                        ineQRData.put("qrExtractData_apellidoPaterno",ineQR.getQrExtractData_apellidoPaterno());
                        ineQRData.put("qrExtractData_nombre",ineQR.getQrExtractData_nombre());
                        ineQRData.put("qrExtractData_fechaElaboracion",ineQR.getQrExtractData_fechaElaboracion());
                        ineQRData.put("qrExtractData_genero",ineQR.getQrExtractData_genero());
                        ineQRData.put("qrExtractData_curp",ineQR.getQrExtractData_curp());
                        ineQRData.put("qrExtractData_seccion",ineQR.getQrExtractData_seccion());
                        ineQRData.put("qrExtractData_tipo",ineQR.getQrExtractData_tipo());
                        ineQRData.put("qrExtractData_cic",ineQR.getQrExtractData_cic());
                        ineQRData.put("qrExtractData_ocr",ineQR.getQrExtractData_ocr());
                        ineQRData.put("qrValidation_vigencia",ineQR.getQrValidation_vigencia());
                        ineQRData.put("qrValidation_apellidoPaterno",ineQR.getQrValidation_apellidoPaterno());
                        ineQRData.put("qrValidation_nombre",ineQR.getQrValidation_nombre());
                        ineQRData.put("qrValidation_apellidoMaterno",ineQR.getQrValidation_apellidoMaterno());
                        ineQRData.put("qrValidation_emision",ineQR.getQrValidation_emision());
                        ineQRData.put("qrValidation_genero",ineQR.getQrValidation_genero());
                        ineQRData.put("qrValidation_cic",ineQR.getQrValidation_cic());
                        ineQRData.put("qrValidation_curp",ineQR.getQrValidation_curp());
                        ineQRData.put("qrValidation_ocr",ineQR.getQrValidation_ocr());
                        ineQRData.put("error",ineQR.getError());
                        hostDataResponseData.put("ine_QR",ineQRData);
                    }
                }catch(Exception e){}

                // DocumentTamper
                try {
                    DocumentTamper dt = hdr.getDocumentTamper();
                    if (dt != null) {
                        JSONObject dtData = new JSONObject();
                        dtData.put("riskLevel",dt.getRiskLevel());
                        hostDataResponseData.put("documentTamper",dtData);
                    }
                }catch(Exception e){}

                // IdTamper
                try {
                    DocumentTamper idt = hdr.getIdTamper();
                    if (idt != null) {
                        JSONObject idtData = new JSONObject();
                        idtData.put("riskLevel",idt.getRiskLevel());
                        hostDataResponseData.put("idTamper",idtData);
                    }
                }catch(Exception e){}

                // AdvanceLivenessResult
                try {
                    Object alr = hdr.getAdvanceLivenessResult();
                    if (alr != null) {
                        hostDataResponseData.put("advanceLivenessResult",alr.toString());
                    }
                }catch(Exception e){}

                responseCustomerData.put("hostDataResponse",hostDataResponseData);
            }
        }catch(Exception e){}

        // === ParsedAddress (within ResponseCustomerData) ===
        try {
            ParsedAddress pa = rcd.getParsedAddress();
            if (pa != null) {
                responseCustomerData.put("parsedAddress", buildParsedAddressJson(pa));
            }
        }catch(Exception e){}

        // === CustomerDataMatchResult ===
        try {
            CustomerDataMatchResult cdmr = rcd.getCustomerDataMatchResult();
            if (cdmr != null) {
                JSONObject matchData = new JSONObject();
                matchData.put("idNumberMatch",cdmr.getIdNumberMatch());
                matchData.put("idNumber2Match",cdmr.getIdNumber2Match());
                matchData.put("dateOfBirthMatch",cdmr.getDateOfBirthMatch());
                matchData.put("expiryDateMatch",cdmr.getExpiryDateMatch());
                matchData.put("nameMatch",cdmr.getNameMatch());
                matchData.put("firstNameMatch",cdmr.getFirstNameMatch());
                matchData.put("middleNameMatch",cdmr.getMiddleNameMatch());
                matchData.put("lastNameMatch",cdmr.getLastNameMatch());
                matchData.put("addressMatch",cdmr.getAddressMatch());
                matchData.put("postalCodeMatch",cdmr.getPostalCodeMatch());
                matchData.put("idNumberMatchScore",cdmr.getIdNumberMatchScore());
                matchData.put("idNumber2MatchScore",cdmr.getIdNumber2MatchScore());
                matchData.put("dateOfBirthMatchScore",cdmr.getDateOfBirthMatchScore());
                matchData.put("expiryDateMatchScore",cdmr.getExpiryDateMatchScore());
                matchData.put("nameMatchScore",cdmr.getNameMatchScore());
                matchData.put("firstNameMatchScore",cdmr.getFirstNameMatchScore());
                matchData.put("middleNameMatchScore",cdmr.getMiddleNameMatchScore());
                matchData.put("lastNameMatchScore",cdmr.getLastNameMatchScore());
                matchData.put("addressMatchScore",cdmr.getAddressMatchScore());
                matchData.put("postalCodeMatchScore",cdmr.getPostalCodeMatchScore());
                responseCustomerData.put("customerDataMatchResult",matchData);
            }
        }catch(Exception e){}

        // === CardData ===
        try {
            CardData cd = rcd.getCardData();
            if (cd != null) {
                JSONObject cardData = new JSONObject();
                cardData.put("cardToken",cd.getCardToken());
                cardData.put("cardLast4",cd.getCardLast4());
                cardData.put("cardExpDate",cd.getCardExpDate());
                cardData.put("nameOnCard",cd.getNameOnCard());
                cardData.put("postalCode",cd.getPostalCode());
                responseCustomerData.put("cardData",cardData);
            }
        }catch(Exception e){}

        return responseCustomerData;
    }

    private JSONArray buildProfilesArray(java.util.List<ProfilesResponse> profilesList) throws Exception {
        JSONArray profilesArray = new JSONArray();
        for (ProfilesResponse pr : profilesList) {
            JSONObject profileItem = new JSONObject();
            profileItem.put("city",pr.getCity());
            profileItem.put("country",pr.getCountry());
            profileItem.put("fullName",pr.getFullName());
            profileItem.put("firstName",pr.getFirstName());
            profileItem.put("middleName",pr.getMiddleName());
            profileItem.put("address",pr.getAddress());
            profileItem.put("convictionType",pr.getConvictionType());
            profileItem.put("countryCode",pr.getCountryCode());
            profileItem.put("countryName",pr.getCountryName());
            profileItem.put("dobOfBirth",pr.getDobOfBirth());
            profileItem.put("drivingLicenseVerificationResult",pr.getDrivingLicenseVerificationResult());
            profileItem.put("internalId",pr.getInternalId());
            profileItem.put("internalIdCriminalRecords",pr.getInternalIdCriminalRecords());
            profileItem.put("lastName",pr.getLastName());
            profileItem.put("photoUrl",pr.getPhotoUrl());
            profileItem.put("postalCode",pr.getPostalCode());
            profileItem.put("sex",pr.getSex());
            profileItem.put("source",pr.getSource());
            profileItem.put("state",pr.getState());
            profileItem.put("street1",pr.getStreet1());
            profileItem.put("street2",pr.getStreet2());
            profileItem.put("verificationResult",pr.getVerificationResult());
            profilesArray.put(profileItem);
        }
        return profilesArray;
    }
}
