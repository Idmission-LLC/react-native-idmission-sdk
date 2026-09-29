import React from 'react'
import { View, TouchableOpacity, Text, Modal, Switch } from 'react-native'
import { ScrollView, NativeBaseProvider, Spinner } from "native-base";
import * as constant from '../Constant'
import styles from '../Styles'
import { IDMissionSDK, addDataCallbackListener } from 'react-native-idmission-sdk';
import { TextInput } from "react-native";
import { LogBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

// Settings are persisted only after a successful SDK initialization, so the
// last working configuration (typed or scanned from a QR code) is restored
// when returning to this screen or relaunching the app.
const SETTINGS_STORAGE_KEY = 'idmission.settings';
const PERSISTED_FIELDS = [
    'apiBaseUrl', 'loginId', 'password', 'clientId', 'clientSecret',
    'debugMode', 'screenRecording', 'gpsEnabled', 'geolocationRequired',
];

// Maps the "URL" field embedded in a configuration QR code to the matching
// API Base URL, mirroring the environment lookup used by the native sample
// app's Settings screen (kyc-uk / kyc-us checked before the generic "kyc"
// substring, since both contain it).
const deriveApiBaseUrlFromQrUrl = (url) => {
    const u = (url || '').toLowerCase();
    if (!u) return null;
    if (u.includes('kyc-uk')) return 'https://identity.london.idmission.xyz/identity/';
    if (u.includes('kyc-us')) return 'https://identity.virginia.idmission.xyz/identity/';
    if (u.includes('demo')) return 'https://apidemo.idmission.com/';
    if (u.includes('uat')) return 'https://apiuat.idmission.com/';
    if (u.includes('lab')) return 'https://apilab.idmission.com/';
    if (u.includes('kyc')) return 'https://api.idmission.com/';
    return null;
}

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apiBaseUrl: '',
            authUrl: '',
            debugMode: false,
            // Defaults match the native IDentity app.
            screenRecording: false,
            gpsEnabled: true,
            geolocationRequired: false,
            sdkVersion: '',
            sdkModels: [],
            accessToken: '',
            loginId: '',
            password: '',
            clientId: '',
            clientSecret: '',
            initError: null,
            isLoading: false,
        }
    }

    componentDidMount() {
        this.loadSettings();
        this.loadSdkInfo();
        // While on this page, every DataCallback event is the result of the
        // initializeSDK() call — service/submit events are only handled once
        // the Identity Services page (and its own listener) is mounted.
        this.subscription = addDataCallbackListener((event) => {
            console.log("Response " + JSON.stringify(event))
            const succeeded = (event?.data || '').toLowerCase().includes('success');
            if (succeeded) {
                this.setState({ isLoading: false, initError: null });
                this.saveSettings();
                this.props.navigation.replace("IdentityServices");
            } else {
                this.setState({ isLoading: false, initError: event?.data || 'SDK initialization failed.' });
            }
        });
    }

    componentWillUnmount() {
        this.subscription?.remove();
    }

    loadSettings = async () => {
        try {
            const saved = JSON.parse(await AsyncStorage.getItem(SETTINGS_STORAGE_KEY));
            if (saved) {
                const restored = {};
                PERSISTED_FIELDS.forEach((key) => {
                    if (saved[key] !== undefined) restored[key] = saved[key];
                });
                this.setState(restored);
            }
        } catch (e) {
            console.log('Failed to load saved settings', e);
        }
    }

    saveSettings = async () => {
        const settings = {};
        PERSISTED_FIELDS.forEach((key) => { settings[key] = this.state[key]; });
        try {
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.log('Failed to save settings', e);
        }
    }

    loadSdkInfo = async () => {
        try {
            const info = await IDMissionSDK.getSDKInfo();
            this.setState({ sdkVersion: info?.version || '', sdkModels: info?.models || [] });
        } catch (e) {
            console.log('Failed to read SDK info', e);
        }
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

    fetchAccessToken = async (tokenUrl) => {
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
        return json.access_token;
    }

    onInit = async () => {
        this.setState({ isLoading: true, initError: null });
        try {
            const tokenUrl = this.deriveTokenUrl(this.state.apiBaseUrl);
            if (!tokenUrl) {
                throw new Error('Enter a valid API Base URL before initializing.');
            }
            const accessToken = await this.fetchAccessToken(tokenUrl);
            this.setState({ accessToken });
            IDMissionSDK.setSDKOptions({
                enableScreenRecording: this.state.screenRecording,
                enableGPS: this.state.gpsEnabled,
                geolocationRequired: this.state.geolocationRequired,
            });
            IDMissionSDK.initializeSDK(
                this.state.apiBaseUrl,
                tokenUrl,
                this.state.debugMode ? 'y' : 'n',
                accessToken
            );
            // isLoading stays true here — the DataCallback listener above
            // resolves it once the native initializeSDK() call completes.
        } catch (error) {
            this.setState({
                isLoading: false,
                initError: error.message || 'SDK initialization failed.',
            });
        }
    }

    openScanner = () => {
        this.props.navigation.navigate('QRScanner', { onScanned: this.handleQrScanned });
    }

    handleQrScanned = (data) => {
        const apiBaseUrl = deriveApiBaseUrlFromQrUrl(data?.URL);
        this.setState({
            apiBaseUrl: apiBaseUrl || this.state.apiBaseUrl,
            loginId: data?.LoginId != null ? String(data.LoginId) : this.state.loginId,
            password: data?.Password != null ? String(data.Password) : this.state.password,
            clientId: data?.ClientId != null ? String(data.ClientId) : this.state.clientId,
            clientSecret: data?.ClientSecret != null ? String(data.ClientSecret) : this.state.clientSecret,
            initError: null,
        });
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

    toggleSetting = (key) => {
        this.setState((prevState) => ({ [key]: !prevState[key] }));
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
        <View style={[styles.inputGroup, options.style]}>
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

    renderSwitch = (label, key) => (
        <View style={styles.debugRow}>
            <Text style={styles.debugRowLabel}>{label}</Text>
            <Switch
                value={this.state[key]}
                onValueChange={() => this.toggleSetting(key)}
                trackColor={{ false: '#D9DEE4', true: constant.primary }}
                thumbColor="#FFFFFF"
            />
        </View>
    );

    renderSdkInfo = () => (
        <View style={styles.sdkInfoCard}>
            <Text style={styles.sdkInfoTitle}>SDK Version</Text>
            <Text style={styles.sdkInfoValue}>{this.state.sdkVersion || '-'}</Text>
            <Text style={styles.sdkInfoTitle}>Models</Text>
            {this.state.sdkModels.length > 0 ? (
                this.state.sdkModels.map((model) => (
                    <View key={model.name}>
                        <Text style={styles.sdkInfoTitle}>{model.name} Model</Text>
                        <Text style={styles.sdkInfoValue}>{model.value}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.sdkInfoEmpty}>Available after the SDK is initialized.</Text>
            )}
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
                        <View style={styles.headerRow}>
                            <Text style={styles.headerTitle}>Identity React</Text>
                            <TouchableOpacity
                                style={styles.qrScanButton}
                                onPress={this.openScanner}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.qrScanButtonText}>Scan QR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {this.renderLoader()}

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={[styles.card, { marginTop: 20 }]}>
                            {this.renderInput("API Base URL", "https://api.idmission.com", (text) => this.saveApiBaseUrl(text), { value: this.state.apiBaseUrl })}

                            <View style={styles.inputRow}>
                                {this.renderInput("Login ID", "Login ID", (text) => this.saveLoginId(text), { value: this.state.loginId, style: styles.inputRowItem })}
                                {this.renderInput("Password", "Password", (text) => this.savePassword(text), { secure: true, value: this.state.password, style: styles.inputRowItem })}
                            </View>
                            <View style={styles.inputRow}>
                                {this.renderInput("Client ID", "Client ID", (text) => this.saveClientId(text), { value: this.state.clientId, style: styles.inputRowItem })}
                                {this.renderInput("Client Secret", "Client Secret", (text) => this.saveClientSecret(text), { secure: true, value: this.state.clientSecret, style: styles.inputRowItem })}
                            </View>

                            {this.renderSwitch("Enable Debug Mode", "debugMode")}
                            {this.renderSwitch("Enable Screen Recording", "screenRecording")}
                            {this.renderSwitch("Enable GPS Location", "gpsEnabled")}
                            {this.renderSwitch("Geolocation Required", "geolocationRequired")}

                            {this.renderButton("Initialize SDK", () => this.onInit())}
                            {this.state.initError ? (
                                <Text style={styles.tokenErrorText}>{this.state.initError}</Text>
                            ) : null}

                            {this.renderSdkInfo()}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </NativeBaseProvider>
        )
    }
}
