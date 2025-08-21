import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SplashScreen from '../AuthScreens/Splashscreen';
import onboarding from '../AuthScreens/onboarding';
import { navigationRef } from './navigationutils';
import LoginScreen from '../AuthScreens/LoginScreen';
import RegisterScreen from '../AuthScreens/RegisterScreen';
import UserDetails from '../AuthScreens/UserDetails';
import Forgotpass from '../AuthScreens/Forgotpass';
import HomeScreen from '../Home/HomeScreen';


const Stack = createNativeStackNavigator();
const Navigation = () => {
  return (
    <NavigationContainer ref={navigationRef} >
<Stack.Navigator screenOptions={{headerShown:false}} initialRouteName='splash'>
    <Stack.Screen name = 'splash' component={SplashScreen}/>
    <Stack.Screen name='Onboarding' component={onboarding}/>
     <Stack.Screen name='Login' component={LoginScreen}/>
      <Stack.Screen name='Register' component={RegisterScreen}/>
       <Stack.Screen name="UserDetails" component={UserDetails} />
        <Stack.Screen name="Forgot" component={Forgotpass} />
        <Stack.Screen name='HomeScreen' component={HomeScreen}/>
</Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigation