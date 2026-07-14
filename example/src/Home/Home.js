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
            accessToken: '',
            loginId: '',
            password: '',
            clientId: '',
            clientSecret: '',
            tokenError: null,
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

    // Derive the auth/token endpoint from the captured API Base URL.
    // Mirrors the native sample's URL convention:
    //   https://api.idmission.com/      -> https://auth.idmission.com/auth/realms/identity/protocol/openid-connect/token
    //   https://apidemo.idmission.com/  -> https://demoauth.idmission.com/auth/realms/identity/protocol/openid-connect/token
    // Rule: strip the leading "api" from the first host label; the remaining
    // environment segment ("" or "demo") prefixes "auth".
    deriveTokenUrl = (apiBaseUrl) => {
        const match = (apiBaseUrl || '').trim().match(/^(https?:\/\/)([^/]+)(\/.*)?$/i);
        if (!match) return null;
        const [, scheme, host] = match;
        const labels = host.split('.');
        const first = labels[0].toLowerCase();
        const env = first.startsWith('api') ? first.slice(3) : first;
        labels[0] = `${env}auth`;
        return `${scheme}${labels.join('.')}/auth/realms/identity/protocol/openid-connect/token`;
    }

    generateToken = async () => {
        this.setState({ isLoading: true, tokenError: null });
        try {
            const tokenUrl = this.deriveTokenUrl(this.state.apiBaseUrl);
            if (!tokenUrl) {
                throw new Error('Enter a valid API Base URL before generating a token.');
            }

            const form = {
                grant_type: 'password',
                client_id: this.state.clientId,
                client_secret: this.state.clientSecret,
                username: this.state.loginId,
                password: this.state.password,
                scope: 'api_access',
            };
            const body = Object.entries(form)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join('&');

            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body,
            });
            const json = await response.json().catch(() => ({}));

            if (!response.ok || !json.access_token) {
                const message =
                    json.error_description ||
                    json.error ||
                    `Token request failed (HTTP ${response.status})`;
                throw new Error(message);
            }

            this.setState({ accessToken: json.access_token, isLoading: false });
        } catch (error) {
            this.setState({
                isLoading: false,
                tokenError: error.message || 'Token generation failed.',
            });
        }
    }

    onInit = () => {
        this.setState({ isLoading: true });
        IDMissionSDK.initializeSDK(
            this.state.apiBaseUrl,
            this.deriveTokenUrl(this.state.apiBaseUrl) || this.state.authUrl,
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

    saveLoginId = (text) => {
        this.setState({
            loginId: text
        })
    }

    savePassword = (text) => {
        this.setState({
            password: text
        })
    }

    saveClientId = (text) => {
        this.setState({
            clientId: text
        })
    }

    saveClientSecret = (text) => {
        this.setState({
            clientSecret: text
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
                            {this.renderInput("API Base URL", "https://api.idmission.com", (text) => this.saveApiBaseUrl(text))}

                            {this.renderInput("Login ID", "Login ID (username)", (text) => this.saveLoginId(text))}
                            {this.renderInput("Password", "Password", (text) => this.savePassword(text), { secure: true })}
                            {this.renderInput("Client ID", "Client ID", (text) => this.saveClientId(text))}
                            {this.renderInput("Client Secret", "Client Secret", (text) => this.saveClientSecret(text), { secure: true })}

                            {this.renderButton("Generate Token", () => this.generateToken(), true)}
                            {this.state.tokenError ? (
                                <Text style={styles.tokenErrorText}>{this.state.tokenError}</Text>
                            ) : null}

                            {this.renderInput("Access Token", "Generate above, or paste manually", (text) => this.saveAccessToken(text), { value: this.state.accessToken })}
                            {this.renderInput("Debug Mode", "y or n", (text) => this.saveDebug(text))}
                            {this.renderInput("Unique Customer Number", "Unique Customer Number", (text) => this.saveUniqueCustomerNumber(text))}

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
