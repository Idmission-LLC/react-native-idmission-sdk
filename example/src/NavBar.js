import React from 'react'
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import * as constant from './Constant'

// App bar matching the Flutter example's AppBar: dark slate background, white
// bold title centered, optional actions on the left and right. The bar extends
// under the status bar, like Flutter's AppBar does.
export default function NavBar({ title, left = null, right = null }) {
    return (
        <SafeAreaView edges={['top']} style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={constant.black} />
            <View style={styles.bar}>
                <View style={styles.titleWrap} pointerEvents="none">
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                </View>
                <View style={styles.side}>{left}</View>
                <View style={styles.side}>{right}</View>
            </View>
        </SafeAreaView>
    )
}

// Material "arrow_back" in white, for the left action.
export const NavBarBackButton = ({ onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={styles.backButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
        <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={constant.white} />
        </Svg>
    </TouchableOpacity>
)

// Material "qr_code_scanner" icon + label in white, like Flutter's TextButton.icon.
export const NavBarScanQrButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionButton} activeOpacity={0.7}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
                d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"
                fill={constant.white}
            />
        </Svg>
        <Text style={styles.actionLabel}>Scan QR</Text>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    safe: {
        backgroundColor: constant.black,
    },
    bar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    // Absolutely centered so the title stays centered whatever the side actions are.
    titleWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 112,
    },
    title: {
        color: constant.white,
        fontSize: 20,
        fontWeight: '700',
    },
    side: {
        minWidth: 48,
        alignItems: 'center',
        flexDirection: 'row',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    actionLabel: {
        color: constant.white,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
})
