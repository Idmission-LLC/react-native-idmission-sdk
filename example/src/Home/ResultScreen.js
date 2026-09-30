import React from 'react'
import { View, TouchableOpacity, Text, Image, BackHandler, Modal, FlatList, Dimensions } from 'react-native'
import { Container, HStack, Button, Center, VStack, Pressable, Box, NativeBaseProvider, ScrollView } from "native-base";
import * as constant from '../Constant'
import styles from '../Styles'
import { SafeAreaView } from 'react-native-safe-area-context';

const IMAGE_LABELS = {
    selfie: 'Selfie',
    idFront: 'ID Front',
    idBack: 'ID Back',
    barcodeImage: 'Barcode',
};
const IMAGE_ORDER = ['selfie', 'idFront', 'idBack', 'barcodeImage'];

// Images of the most recent capture, kept so they stay visible on the Submit
// result screen too.
let lastImages = [];

// Display-only helpers. The wrapper returns the SDK result unchanged; masking
// base64 and pulling out the images for the thumbnails happens here, in the app.
const getPath = (root, keys) => keys.reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), root);

const extractImages = (data) => {
    if (!data || typeof data !== 'object') return [];
    const found = {
        idFront: getPath(data, ['front', 'image']),
        idBack: getPath(data, ['back', 'image']),
        barcodeImage: getPath(data, ['front', 'barcodeImage']) || getPath(data, ['back', 'barcodeImage']),
        selfie: getPath(data, ['selfie', 'image']),
    };
    return IMAGE_ORDER
        .filter((key) => typeof found[key] === 'string' && found[key].length > 0)
        .map((key) => ({ key, label: IMAGE_LABELS[key], uri: 'data:image/jpeg;base64,' + found[key] }));
};

const BASE64_ONLY = /^[A-Za-z0-9+/=\s]+$/;
const maskValue = (value, key = '') => {
    if (Array.isArray(value)) return value.map((item) => maskValue(item, key));
    if (value && typeof value === 'object') {
        const out = {};
        Object.keys(value).forEach((k) => { out[k] = maskValue(value[k], k); });
        return out;
    }
    if (typeof value === 'string' && value.length >= 100) {
        const k = key.toLowerCase();
        if (k.includes('base64') || k.includes('image') || k.includes('selfie')) return '...';
        if (value.startsWith('data:image')) return '...';
        if (value.length >= 1000 && BASE64_ONLY.test(value)) return '...';
    }
    return value;
};

export default class ResultScreen extends React.Component {
    state = {
        viewerIndex: null,   // index of the image open in the full-screen viewer
    }

    componentDidMount() {
        this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', this.onHardwareBack);
    }

    componentWillUnmount() {
        this.backHandlerSubscription?.remove();
    }

    onHardwareBack = () => {
        if (!this.props.navigation.isFocused()) {
            return false;
        }
        this.props.navigation.goBack();
        return true;
    }

    getFormattedData = (eventName, eventResponse) => {
        if (eventName !== "Data" || !eventResponse) return "";

        const deepParseJSON = (data) => {
            if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    // Recurse in case the parsed value contains more stringified JSON
                    return deepParseJSON(parsed);
                } catch (e) {
                    return data;
                }
            }
            if (data && typeof data === 'object') {
                if (Array.isArray(data)) {
                    return data.map(item => deepParseJSON(item));
                }
                const result = {};
                for (const key in data) {
                    result[key] = deepParseJSON(data[key]);
                }
                return result;
            }
            return data;
        };

        const displayData = deepParseJSON(eventResponse);
        // A capture result carries its images; remember them for the Submit screen.
        const images = extractImages(displayData);
        if (images.length > 0) {
            lastImages = images;
        }
        return JSON.stringify(maskValue(displayData), null, 2);
    }
    renderImages = () => {
        const images = lastImages;
        if (images.length === 0) return null;
        return (
            <View style={{ marginTop: 16 }}>
                <Text style={[styles.slate, { fontWeight: '700', marginBottom: 8 }]}>CAPTURED IMAGES</Text>
                <View style={{ flexDirection: 'row' }}>
                    {images.map((image, index) => (
                        <TouchableOpacity
                            key={image.key}
                            style={{ marginRight: 12, alignItems: 'center' }}
                            onPress={() => this.setState({ viewerIndex: index })}
                        >
                            <Image source={{ uri: image.uri }} style={{ width: 64, height: 64, borderRadius: 8 }} />
                            <Text style={{ fontSize: 11, marginTop: 4 }}>{image.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }

    renderViewer = () => {
        const images = lastImages;
        const { viewerIndex } = this.state;
        const { width, height } = Dimensions.get('window');
        return (
            <Modal
                visible={viewerIndex !== null}
                animationType="fade"
                onRequestClose={() => this.setState({ viewerIndex: null })}
            >
                <View style={{ flex: 1, backgroundColor: '#000' }}>
                    {viewerIndex !== null && (
                        <FlatList
                            data={images}
                            horizontal
                            pagingEnabled
                            keyExtractor={(image) => image.key}
                            initialScrollIndex={viewerIndex}
                            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                            onMomentumScrollEnd={(e) => this.setState({
                                viewerIndex: Math.round(e.nativeEvent.contentOffset.x / width),
                            })}
                            renderItem={({ item }) => (
                                <View style={{ width, height, justifyContent: 'center' }}>
                                    <Image source={{ uri: item.uri }} style={{ width, height: height * 0.8 }} resizeMode="contain" />
                                </View>
                            )}
                        />
                    )}
                    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
                        <TouchableOpacity onPress={() => this.setState({ viewerIndex: null })} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <Text style={{ color: '#fff', fontSize: 28 }}>✕</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#fff', fontSize: 15, marginTop: 6 }}>
                            {viewerIndex !== null && images[viewerIndex] ? `${images[viewerIndex].label}  (${viewerIndex + 1}/${images.length})` : ''}
                        </Text>
                    </SafeAreaView>
                </View>
            </Modal>
        );
    }

    render() {
        const { eventName, eventResponse } = this.props.route.params;

        const formattedData = this.getFormattedData(eventName, eventResponse);

        return (
            <NativeBaseProvider>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.goBack()}
                            style={{ marginBottom: 8 }}
                        >
                            <Text style={{ color: constant.primary, fontWeight: '600' }}>← Back to Services</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Response Data</Text>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                        <View style={styles.card}>
                            {eventName === "Data" && (
                                <View style={styles.resultCard}>
                                    <Text style={styles.resultText}>
                                        {formattedData}
                                    </Text>
                                </View>
                            )}

                            {eventName === "Data" && this.renderImages()}

                            {eventName === "Image" && (
                                <View style={{ alignItems: 'center', marginTop: 10 }}>
                                    <Image
                                        source={{ uri: "data:image/png;base64," + eventResponse }}
                                        style={[styles.imageStyle, { borderRadius: 12 }]}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}

                            {!formattedData && eventName !== "Image" && (
                                <Text style={styles.slate}>No data available for this event.</Text>
                            )}
                        </View>
                    </ScrollView>
                    {this.renderViewer()}
                </SafeAreaView>
            </NativeBaseProvider>
        )
    }
}

