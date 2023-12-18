import { StatusBar } from "expo-status-bar";
import { StyleSheet, TextInput, View, Button } from "react-native";
import { useState } from "react";
import axios from "axios";
import { API_KEY } from "@env";

export default function App() {
  const [location, setLocation] = useState("");
  const [forecast, setForecast] = useState([]);
  const [currentWeather, setCurrentWeather] = useState("");

  function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
  }
  async function getWeather() {
    try {
      const geoCoordinates = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${API_KEY}&units=metric`
      );

      const longitude = geoCoordinates.data[0].lon;
      const latitude = geoCoordinates.data[0].lat;

      console.log("latitude: " + latitude + ", longitude: " + longitude);
      const forecastVal = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      let forecastArr = [];
      forecastVal?.data?.daily?.forEach((element) => {
        forecastArr.push(element.temp.day);
      });

      setForecast(forecastArr);
      console.log(forecastArr);
      const weatherVal = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      setCurrentWeather(weatherVal?.data?.main?.temp);
      console.log(weatherVal?.data?.main?.temp);
    } catch (error) {
      console.log(`error fetching weather forecast: ` + error);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        onChangeText={(text) => setLocation(text)}
        value={location}
      />
      <Button title="Search" onPress={getWeather} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40, //40px height to our input
    width: 200, //100px width
    borderColor: "black", //color of our border
    borderWidth: 1, //width of our border
  },
});
