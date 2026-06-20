import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeBaseProvider } from 'native-base';
import ResultScreen from './Home/ResultScreen'
import Home from './Home/Home'

const Stack = createNativeStackNavigator();

function App() {
  return (
   <NativeBaseProvider>
     <NavigationContainer >
      <Stack.Navigator screenOptions={{ initialRouteName: "Home", headerShown: false }}>
     
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
      
      </Stack.Navigator>
    </NavigationContainer>
   </NativeBaseProvider>
  );
}

export default App;