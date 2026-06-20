import { StyleSheet } from 'react-native'
import * as constant from './Constant'
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: constant.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: constant.white,
        borderBottomWidth: 1,
        borderBottomColor: constant.slateLight,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: constant.black,
    },
    headerSubtitle: {
        fontSize: 14,
        color: constant.slate,
        marginTop: 4,
    },
    section: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: constant.slateDark,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: constant.white,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: constant.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: constant.slateLight,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: constant.slate,
        marginBottom: 6,
        marginLeft: 4,
    },
    inputWrapper: {
        backgroundColor: constant.slateLight,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textInput: {
        fontSize: 15,
        color: constant.black,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: constant.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    actionButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: constant.primary,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: constant.white,
    },
    actionButtonTextSecondary: {
        color: constant.primary,
    },
    submitButton: {
        backgroundColor: constant.success,
        marginVertical: 24,
    },
    resultCard: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
    },
    resultText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        color: constant.slateDark,
    },
    audioButton:{                  
        borderWidth:1.5,
        height:constant.deviceWidth*10/100,
        width:constant.deviceWidth*20/100,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
        borderColor:constant.whiteColor,
    },
    audioText:{
        color:constant.whiteColor,
        fontSize:constant.fontSize2
    },
    audioImage:{
        height:constant.deviceWidth*50/100,
        width:constant.deviceWidth*90/100,
        marginHorizontal:'5%',
        justifyContent:'flex-end',
    },
    audioContent:{
        flex:1,
        justifyContent:'center',
    },
    dropDownView: {
        color: constant.blackColor,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        marginHorizontal: '8%',
        height:100,
        width:300,
        borderBottomColor: constant.lightGrayColor,
    },
    startButton: {
        borderWidth: constant.borderWidth1,
        marginHorizontal: '5%',
        alignItems: 'baseline',
        justifyContent: 'center',
        height: constant.deviceWidth * 15 / 100,
        borderRadius: 10,
        marginTop: 10,
        paddingLeft: 10,
        borderColor: constant.baseColor,
        backgroundColor: constant.baseColor,
    },
    buttonText: {
        fontSize: 40
    },
    startButtonText: {
        fontSize: constant.fontSize1,
        color: constant.whiteColor
    },
    mainText: {
        color: constant.blackColor,
        fontSize: constant.smallFont
    },
    keyButton: {
        justifyContent: 'center',
        height: 30,
        borderRadius: 10,
        marginLeft: 10,
        marginRight: 10,
        paddingLeft: 12,
        paddingRight: 12,
        borderColor: constant.baseColor,
        backgroundColor: constant.baseColor,
    },
    keyButtonText: {
        fontSize: 15,
        color: constant.whiteColor
    },    
    imageStyle: {
        height: constant.deviceHeight * 80 / 100,
        width: constant.deviceWidth * 90 / 100,
        borderColor: 'red'
    },
    cardDetectImage:{
        height: constant.deviceHeight * 50 / 100,
        width: constant.deviceWidth * 90 / 100,
    },
    cardDetectText:{
       fontSize:1.2*constant.fontSize3,
       marginLeft:'4%',
       marginBottom:'1%',
    },
    cardDetectText2:{
        fontSize:constant.fontSize2,
        marginVertical:'4%',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    gpsText:{
        fontSize:constant.fontSize2
    },

    loaderOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)', // semi-transparent slate-900
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        backgroundColor: constant.white,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    }
})

export default styles
