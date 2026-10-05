import React from 'react'
import { View, TouchableOpacity, Text, Modal, BackHandler } from 'react-native'
import { ScrollView, NativeBaseProvider, Spinner } from "native-base";
import * as constant from '../Constant'
import styles from '../Styles'
import { IDMissionSDK, addDataCallbackListener } from 'react-native-idmission-sdk';
import { TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar, { NavBarBackButton } from '../NavBar';

export default class IdentityServices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uniqueCustomerNumber: '?',
            isLoading: false,
        }
    }

    componentDidMount() {
        this.subscription = addDataCallbackListener((event) => {
            console.log("Response " + JSON.stringify(event))
            this.setState({ isLoading: false });
            this.props.navigation.navigate("ResultScreen", { eventResponse: event, eventName: "Data" })
        });
        // Home was navigated to via replace(), so this is the only screen on
        // the stack — the hardware back button has nothing to pop to and
        // would otherwise exit the app. Redirect it to SDK Configuration
        // instead, same as the header back button.
        this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', this.onHardwareBack);
    }

    componentWillUnmount() {
        this.subscription?.remove();
        this.backHandlerSubscription?.remove();
    }

    onHardwareBack = () => {
        // ResultScreen (or any screen pushed on top) should handle its own
        // back press and pop normally — only redirect when this screen is
        // the one actually on screen.
        if (!this.props.navigation.isFocused()) {
            return false;
        }
        this.props.navigation.replace("Home");
        return true;
    }

    onServiceID20 = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.serviceID20();
    }

    onServiceID10 = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.serviceID10();
    }

    onServiceID50 = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.serviceID50(this.state.uniqueCustomerNumber);
    }

    onServiceID175 = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.serviceID175(this.state.uniqueCustomerNumber);
    }

    onServiceID105 = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.serviceID105(this.state.uniqueCustomerNumber);
    }

    onServiceID185 = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.serviceID185();
    }

    onServiceID660 = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.serviceID660();
    }

    onSubmit = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.submitResult();
    }

    saveUniqueCustomerNumber = (text) => {
        this.setState({
            uniqueCustomerNumber: text
        })
    }

    renderLoader = () => (
        <Modal
            transparent={true}
            animationType="fade"
            visible={this.state.isLoading}
            onRequestClose={() => this.setState({ isLoading: false })}
        >
            <View style={styles.loaderOverlay}>
                <View style={styles.loaderContainer}>
                    <Spinner size="lg" color={constant.primary} />
                </View>
            </View>
        </Modal>
    );

    renderInput = (label, placeholder, onChangeText, options = {}) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    onChangeText={onChangeText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={options.secure === true}
                    {...(options.value !== undefined ? { value: options.value } : {})}
                />
            </View>
        </View>
    );

    renderButton = (label, onPress, secondary = false) => (
        <TouchableOpacity
            style={[styles.actionButton, secondary && styles.actionButtonSecondary]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.actionButtonText, secondary && styles.actionButtonTextSecondary]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    render() {
        return (
            <NativeBaseProvider>
                <View style={styles.container}>
                    <NavBar
                        title="Identity Services"
                        left={<NavBarBackButton onPress={() => this.props.navigation.replace("Home")} />}
                    />
                    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>

                    {this.renderLoader()}

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={[styles.card, { marginTop: 20 }]}>
                            {this.renderInput("Unique Customer Number", "Unique Customer Number", (text) => this.saveUniqueCustomerNumber(text))}

                            {this.renderButton("ID Validation", () => this.onServiceID20(), true)}
                            {this.renderButton("ID + Match Face", () => this.onServiceID10(), true)}
                            {this.renderButton("Identify Customer", () => this.onServiceID185(), true)}
                            {this.renderButton("Customer Verification", () => this.onServiceID105(), true)}
                            {this.renderButton("Live Face Check", () => this.onServiceID660(), true)}
                            {this.renderButton("ID + Customer Enroll", () => this.onServiceID50(), true)}
                            {this.renderButton("Enroll Biometrics", () => this.onServiceID175(), true)}
                        </View>

                        <View style={{ paddingHorizontal: 16 }}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.submitButton]}
                                onPress={() => this.onSubmit()}
                            >
                                <Text style={styles.actionButtonText}>Submit Result</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    </SafeAreaView>
                </View>
            </NativeBaseProvider>
        )
    }
}
