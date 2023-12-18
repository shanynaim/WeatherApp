import { StatusBar } from "expo-status-bar";
import { StyleSheet, TextInput, View, Button } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_KEY_WEATHER, API_KEY_AUTOCOMPLETE_PLACE } from "@env";
import DropDown from "react-native-element-dropdown";

export default function App() {
  const [location, setLocation] = useState("");
  const [forecast, setForecast] = useState([]);
  const [currentWeather, setCurrentWeather] = useState("");
  const [predictions, setPredictions] = useState([]);

  async function getWeather() {
    try {
      const geoCoordinates = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${API_KEY_WEATHER}&units=metric`
      );

      const longitude = geoCoordinates.data[0].lon;
      const latitude = geoCoordinates.data[0].lat;

      console.log("latitude: " + latitude + ", longitude: " + longitude);
      const forecastVal = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY_WEATHER}&units=metric`
      );

      let forecastArr = [];
      forecastVal?.data?.daily?.forEach((element) => {
        forecastArr.push(element.temp.day);
      });

      setForecast(forecastArr);

      const weatherVal = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY_WEATHER}&units=metric`
      );
      setCurrentWeather(weatherVal?.data?.main?.temp);
    } catch (error) {
      console.log(`error fetching weather forecast: ` + error);
    }
  }

  useEffect(() => {
    async function autoCompletePlace() {
      try {
        const autoCompleteRes = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${location}&types=(cities)&key=${API_KEY_AUTOCOMPLETE_PLACE}`
        );

        let predictionsArr = [];

        autoCompleteRes.data.predictions.forEach((prediction) => {
          predictionsArr.push(prediction.description);
        });
        console.log(predictionsArr);
        setPredictions(predictionsArr);
      } catch (error) {
        console.log("error: " + error);
      }
    }

    autoCompletePlace();
  }, [location]);
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          onChangeText={(text) => setLocation(text)}
          value={location}
        />
        {predictions.length > 0 && (
          <DropDown
            label="Select a city"
            mode="dropdown"
            value={location}
            options={predictions}
            onChange={(value) => setLocation(value)}
          />
        )}
      </View>
      <Button title="Search" onPress={getWeather} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
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
