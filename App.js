import Forecast from "./screens/Forecast";
import SearchPlace from "./screens/SearchPlace";
// Navigation imports
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SearchPlace">
        <Stack.Screen name="SearchPlace" component={SearchPlace} />
        <Stack.Screen name="Forecast" component={Forecast} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
