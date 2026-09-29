import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeBaseProvider } from 'native-base';
import ResultScreen from './Home/ResultScreen'
import Home from './Home/Home'
import IdentityServices from './Home/IdentityServices'
import QRScanner from './Home/QRScanner'

const Stack = createNativeStackNavigator();

function App() {
  return (
   <NativeBaseProvider>
     <NavigationContainer >
      <Stack.Navigator screenOptions={{ initialRouteName: "Home", headerShown: false }}>

        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="IdentityServices" component={IdentityServices} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
        {/* Pushed as a regular screen (slide up) rather than a fullScreenModal:
            on iOS the modal reported zero safe-area insets, so the header was
            drawn under the status bar. */}
        <Stack.Screen name="QRScanner" component={QRScanner} options={{ animation: 'slide_from_bottom' }} />

      </Stack.Navigator>
    </NavigationContainer>
   </NativeBaseProvider>
  );
}

export default App;