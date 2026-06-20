import React from 'react'
import { View, TouchableOpacity, Text, Image, Platform, StyleSheet as RNStyleSheet, Modal, ActivityIndicator } from 'react-native'
import { ScrollView, Picker, NativeBaseProvider, Center, VStack, Pressable, Spinner } from "native-base";
import * as constant from '../Constant'
import styles from '../Styles'
import { IDMissionSDK, addDataCallbackListener } from 'react-native-idmission-sdk';
import { TextInput } from "react-native";
import { LogBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '?',
            images: '?',
            uniqueCustomerNumber: '?',
            apiBaseUrl: '?',
            authUrl: '?',
            debug: '?',
            accessToken: '?',
            isLoading: false,
            event: [
                "Select Feature"
            ]
        }
    }

    componentDidMount() {
        this.subscription = addDataCallbackListener((event) => {
            console.log("Response " + JSON.stringify(event))
            this.setState({ isLoading: false });
            this.props.navigation.navigate("ResultScreen", { eventResponse: event, eventName: "Data" })
        });
    }

    componentWillUnmount() {
        this.subscription?.remove();
    }

    onInit = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.initializeSDK(
            this.state.apiBaseUrl,
            this.state.authUrl,
            this.state.debug,
            this.state.accessToken
        );
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

    saveApiBaseUrl = (text) => {
        this.setState({
            apiBaseUrl: text
        })
    }

    saveAuthUrl = (text) => {
        this.setState({
            authUrl: text
        })
    }

    saveDebug = (text) => {
        this.setState({
            debug: text
        })
    }

    saveAccessToken = (text) => {
        this.setState({
            accessToken: text
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

    renderInput = (label, placeholder, value, onChangeText) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    onChangeText={onChangeText}
                    autoCapitalize="none"
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
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Identity React</Text>
                    </View>

                    {this.renderLoader()}

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>SDK Configuration</Text>
                        </View>
                        <View style={styles.card}>
                            {this.renderInput("API Base URL", "https://api.idmission.com", this.state.apiBaseUrl, (text) => this.saveApiBaseUrl(text))}
                            {this.renderInput("Access Token", "Your Access Token", this.state.accessToken, (text) => this.saveAccessToken(text))}
                            {this.renderInput("Debug Mode", "y or n", this.state.debug, (text) => this.saveDebug(text))}
                            {this.renderInput("Unique Customer Number", "Unique Customer Number", this.state.uniqueCustomerNumber, (text) => this.saveUniqueCustomerNumber(text))}

                            {this.renderButton("Initialize SDK", () => this.onInit())}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Identity Services</Text>
                        </View>
                        <View style={styles.card}>
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
            </NativeBaseProvider>
        )
    }
}
