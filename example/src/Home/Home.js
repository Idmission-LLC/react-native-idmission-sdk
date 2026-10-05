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
import NavBar, { NavBarScanQrButton } from '../NavBar';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

// Settings are persisted only after a successful SDK initialization, so the
// last working configuration (typed or scanned from a QR code) is restored
// when returning to this screen or relaunching the app.
const SETTINGS_STORAGE_KEY = 'idmission.settings';
const PERSISTED_FIELDS = [
    'apiBaseUrl', 'authUrl', 'accessToken', 'loginId', 'password', 'clientId', 'clientSecret',
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
    if (u.includes('lab')) return 'https://apilab.idmission.com:9043/';
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
            // True once the user has typed their own auth URL; until then it
            // follows the API Base URL.
            authUrlEdited: false,
            tokenGenerated: false,
            tokenError: null,
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
                restored.authUrlEdited = !!restored.authUrl &&
                    restored.authUrl !== (this.deriveTokenUrl(restored.apiBaseUrl || '') || '');
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

    // Derive the auth/token endpoint from the captured API Base URL, using the
    // same environment -> auth host table as the native IDentity apps:
    //   https://api.idmission.com/                 -> https://auth.idmission.com/
    //   https://apidemo.idmission.com/             -> https://demoauth.idmission.com/
    //   https://apiuat.idmission.com/              -> https://uatauth.idmission.com/
    //   https://apilab.idmission.com:9043/         -> https://labauth.idmission.com:9043/
    //   https://identity.london.idmission.xyz/...  -> https://auth.london.idmission.xyz/
    //   https://identity.virginia.idmission.xyz/...-> https://auth.idmission.com/
    deriveTokenUrl = (apiBaseUrl) => {
        const match = (apiBaseUrl || '').trim().match(/^(https?:\/\/)([^/]+)(\/.*)?$/i);
        if (!match) return null;
        const [, scheme, host] = match;
        const tokenPath = '/auth/realms/identity/protocol/openid-connect/token';
        const h = host.toLowerCase();
        if (h.startsWith('identity.london.')) return `${scheme}auth.london.idmission.xyz${tokenPath}`;
        if (h.startsWith('identity.virginia.')) return `${scheme}auth.idmission.com${tokenPath}`;
        const labels = host.split('.');
        const first = labels[0].toLowerCase();
        const env = first.startsWith('api') ? first.slice(3) : first;
        labels[0] = `${env}auth`;
        return `${scheme}${labels.join('.')}${tokenPath}`;
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

    onGenerateToken = async () => {
        this.setState({ isLoading: true, tokenError: null });
        try {
            const { authUrl, apiBaseUrl, clientId, clientSecret, loginId, password } = this.state;
            const tokenUrl = authUrl.trim() || this.deriveTokenUrl(apiBaseUrl);
            if (!tokenUrl || !/^https?:\/\//i.test(tokenUrl)) {
                throw new Error('Enter the Access Token Auth URL (or an API Base URL) first.');
            }
            if (!clientId || !clientSecret || !loginId || !password) {
                throw new Error('Enter Client ID, Client Secret, Login ID and Password first.');
            }
            const accessToken = await this.fetchAccessToken(tokenUrl);
            this.setState({ isLoading: false, accessToken, tokenGenerated: true });
        } catch (error) {
            this.setState({
                isLoading: false,
                tokenGenerated: false,
                tokenError: error.message || 'Token request failed.',
            });
        }
    }

    onInit = () => {
        const { apiBaseUrl, authUrl, accessToken, debugMode } = this.state;
        if (!/^https?:\/\//i.test(apiBaseUrl)) {
            this.setState({ initError: 'Enter a valid API Base URL before initializing.' });
            return;
        }
        if (!accessToken.trim()) {
            this.setState({ initError: 'Generate or enter an Access Token before initializing.' });
            return;
        }
        this.setState({ isLoading: true, initError: null });
        // authUrl is deprecated and ignored by the SDK; it is only passed for
        // backward compatibility.
        IDMissionSDK.initializeSDK(
            apiBaseUrl,
            authUrl,
            debugMode ? 'y' : 'n',
            accessToken.trim(),
            {
                enableScreenRecording: this.state.screenRecording,
                enableGPS: this.state.gpsEnabled,
                geolocationRequired: this.state.geolocationRequired,
            }
        );
        // isLoading stays true here — the DataCallback listener above
        // resolves it once the native initializeSDK() call completes.
    }

    openScanner = () => {
        this.props.navigation.navigate('QRScanner', { onScanned: this.handleQrScanned });
    }

    handleQrScanned = (data) => {
        const apiBaseUrl = deriveApiBaseUrlFromQrUrl(data?.URL);
        const authUrl = apiBaseUrl && !this.state.authUrlEdited
            ? (this.deriveTokenUrl(apiBaseUrl) || '')
            : this.state.authUrl;
        this.setState({
            apiBaseUrl: apiBaseUrl || this.state.apiBaseUrl,
            authUrl,
            tokenGenerated: false,
            tokenError: null,
            loginId: data?.LoginId != null ? String(data.LoginId) : this.state.loginId,
            password: data?.Password != null ? String(data.Password) : this.state.password,
            clientId: data?.ClientId != null ? String(data.ClientId) : this.state.clientId,
            clientSecret: data?.ClientSecret != null ? String(data.ClientSecret) : this.state.clientSecret,
            initError: null,
        });
    }

    saveApiBaseUrl = (text) => {
        this.setState((prev) => ({
            apiBaseUrl: text,
            ...(prev.authUrlEdited ? {} : { authUrl: this.deriveTokenUrl(text) || '', tokenGenerated: false }),
        }));
    }

    saveAuthUrl = (text) => {
        this.setState({ authUrl: text, authUrlEdited: text.length > 0, tokenGenerated: false });
    }

    toggleSetting = (key) => {
        this.setState((prevState) => ({ [key]: !prevState[key] }));
    }

    // Editing any field that feeds the token invalidates the generated-token tick.
    saveAccessToken = (text) => {
        this.setState({ accessToken: text });
    }

    saveCredential = (key) => (text) => {
        this.setState({ [key]: text, tokenGenerated: false });
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
            <View style={[styles.inputWrapper, styles.inputWrapperCompact]}>
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

    // The whole row toggles, so it is easy to tap.
    renderSwitch = (label, key) => (
        <TouchableOpacity
            style={styles.debugRow}
            activeOpacity={0.7}
            onPress={() => this.toggleSetting(key)}
        >
            <Text style={styles.debugRowLabel}>{label}</Text>
            <Switch
                style={styles.compactSwitch}
                value={this.state[key]}
                onValueChange={() => this.toggleSetting(key)}
                trackColor={{ false: '#D9DEE4', true: constant.primary }}
                thumbColor="#FFFFFF"
            />
        </TouchableOpacity>
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
            style={[styles.actionButton, styles.compactButton, secondary && styles.actionButtonSecondary]}
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
                        title="Identity React"
                        right={<NavBarScanQrButton onPress={this.openScanner} />}
                    />
                    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>

                    {this.renderLoader()}

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={[styles.card, { marginTop: 20 }]}>
                            {this.renderInput("Access Token Auth URL", "https://auth.idmission.com/auth/realms/identity/protocol/openid-connect/token", this.saveAuthUrl, { value: this.state.authUrl })}
                            <View style={styles.inputRow}>
                                {this.renderInput("Login ID", "Login ID", this.saveCredential('loginId'), { value: this.state.loginId, style: styles.inputRowItem })}
                                {this.renderInput("Password", "Password", this.saveCredential('password'), { secure: true, value: this.state.password, style: styles.inputRowItem })}
                            </View>
                            <View style={styles.inputRow}>
                                {this.renderInput("Client ID", "Client ID", this.saveCredential('clientId'), { value: this.state.clientId, style: styles.inputRowItem })}
                                {this.renderInput("Client Secret", "Client Secret", this.saveCredential('clientSecret'), { secure: true, value: this.state.clientSecret, style: styles.inputRowItem })}
                            </View>
                            {this.renderButton(this.state.tokenGenerated ? "Generate Access Token \u2713" : "Generate Access Token \u2715", () => this.onGenerateToken())}
                            {this.state.tokenError ? (
                                <Text style={styles.tokenErrorText}>{this.state.tokenError}</Text>
                            ) : null}

                            <View style={{ height: 12 }} />
                            {this.renderInput("API Base URL", "https://api.idmission.com", this.saveApiBaseUrl, { value: this.state.apiBaseUrl })}
                            {this.renderInput("Access Token", "Generate a token above, or paste one", this.saveAccessToken, { value: this.state.accessToken })}

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
                </View>
            </NativeBaseProvider>
        )
    }
}
