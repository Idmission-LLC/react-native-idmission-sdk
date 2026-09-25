import React from 'react'
import { View, TouchableOpacity, Text, Image, BackHandler } from 'react-native'
import { Container, HStack, Button, Center, VStack, Pressable, Box, NativeBaseProvider, ScrollView } from "native-base";
import * as constant from '../Constant'
import styles from '../Styles'
import { SafeAreaView } from 'react-native-safe-area-context';

export default class ResultScreen extends React.Component {

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
        return JSON.stringify(displayData, null, 2);
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
                </SafeAreaView>
            </NativeBaseProvider>
        )
    }
}

