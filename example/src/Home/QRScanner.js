import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, StatusBar } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

// Parses the raw QR payload produced by the native reference app's
// configuration QR codes: a JSON array holding a single object with
// LoginId / Password / ClientId / ClientSecret / URL (see
// Identity_2.0's QRExtractedData).
const parseQrPayload = (raw) => {
    try {
        const json = JSON.parse(raw);
        const record = Array.isArray(json) ? json[0] : json;
        return record && typeof record === 'object' ? record : null;
    } catch (e) {
        return null;
    }
}

export default function QRScanner({ navigation, route }) {
    const [hasPermission, setHasPermission] = useState(Platform.OS !== 'android');
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        let mounted = true;
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
                title: 'Camera Permission',
                message: 'Camera access is required to scan the configuration QR code.',
            }).then((result) => {
                if (mounted) setHasPermission(result === PermissionsAndroid.RESULTS.GRANTED);
            });
        }
        return () => { mounted = false; };
    }, []);

    const handleReadCode = useCallback((event) => {
        if (scanned) return;
        const data = parseQrPayload(event.nativeEvent.codeStringValue);
        if (data) {
            setScanned(true);
            route.params?.onScanned?.(data);
            navigation.goBack();
        }
    }, [scanned, navigation, route]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" />
            {/* Header sits above the camera (not overlaid by it) so Cancel
                receives touches; the title is centred across the full width
                with Cancel on the left and an equal-width spacer on the right. */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerSide}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.backText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>Scan QR Code</Text>
                <View style={styles.headerSide} />
            </View>

            {hasPermission ? (
                <Camera
                    style={styles.camera}
                    scanBarcode={true}
                    onReadCode={handleReadCode}
                    showFrame={true}
                    // Square frame sized to actually fit a QR code — the
                    // library's default (300x150) is tuned for 1D barcodes
                    // and rejects any QR whose bounding box doesn't fit
                    // entirely inside it, so QR scans never fire.
                    barcodeFrameSize={{ width: 260, height: 260 }}
                    laserColor="#0EA5E9"
                    frameColor="#FFFFFF"
                />
            ) : (
                <View style={styles.center}>
                    <Text style={styles.permissionText}>
                        Camera permission is required to scan QR codes.
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#0F172A',
    },
    headerSide: {
        width: 70,
    },
    backText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
    camera: {
        flex: 1,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    permissionText: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
