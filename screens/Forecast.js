import { API_KEY_WEATHER, API_KEY_AUTOCOMPLETE_PLACE } from "@env";
import { ImageBackground } from "react-native";

import axios from "axios";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Forecast({ route }) {
  const [forecast, setForecast] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyTemps, setHourlyTemps] = useState([]);
  const { locationData } = route.params;

  async function getCredentiels() {
    console.log("location: " + locationData.description);
    try {
      const placeDetailsRes = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${locationData.placeId}&key=${API_KEY_AUTOCOMPLETE_PLACE}`
      );

      const result = placeDetailsRes.data.result;
      const country = result.address_components.find((component) =>
        component.types.includes("country")
      );
      const state = result.address_components.find((component) =>
        component.types.includes("administrative_area_level_1")
      );

      console.log("Country: ", country?.short_name);
      console.log("State: ", state?.short_name);

      const geoCoordinates = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${locationData.description},${state.short_name},${country.short_name}&appid=${API_KEY_WEATHER}`
      );

      return {
        longitude: geoCoordinates.data[0].lon,
        latitude: geoCoordinates.data[0].lat,
      };
    } catch (error) {
      console.log("error in credentiels: " + error);
    }
  }

  function getDate(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
  }

  function getTempsByHours(forecastVal) {
    const currentDay = new Date().toLocaleDateString("en-US", {
      timeZone: "UTC",
    }); // Get the current date in UTC
    const hourlyForToday = forecastVal?.data?.hourly.filter((hour) => {
      const hourDate = new Date(hour.dt * 1000).toLocaleDateString("en-US", {
        timeZone: "UTC",
      });
      return hourDate === currentDay;
    });

    const hourlyForecast = [];
    hourlyForToday.map((element) => {
      let newObj = {
        hour: new Date(element.dt * 1000).toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        }),
        temp: element.temp.toString().split(".")[0],
      };

      hourlyForecast.push(newObj);
    });

    setHourlyTemps(hourlyForecast);
  }

  function getWeeklyForecats(forecastVal) {
    let forecastArr = [];
    forecastVal?.data?.daily?.forEach((element) => {
      forecastArr.push({
        date: getDate(element.dt * 1000),
        day: element.temp.day.toString().split(".")[0],
        eve: element.temp.night.toString().split(".")[0],
      });
    });

    setForecast(forecastArr.slice(1));
  }

  useEffect(() => {
    async function getWeather() {
      const { longitude, latitude } = await getCredentiels();

      console.log("latitude: " + latitude + ", longitude: " + longitude);

      try {
        const forecastVal = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY_WEATHER}&units=metric`
        );

        getTempsByHours(forecastVal);
        getWeeklyForecats(forecastVal);

        const weatherVal = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY_WEATHER}&units=metric`
        );
        setCurrentWeather(weatherVal?.data?.main?.temp);
      } catch (error) {
        console.log(`error fetching weather forecast: ` + error);
      }
    }
    getWeather();
  }, []);

  return (
    <ImageBackground
      source={
        currentWeather &&
        (currentWeather < 5
          ? require("../assets/chill-in-yKWRIc0gZBI-unsplash.jpg")
          : currentWeather < 15
          ? require("../assets/aaron-burden-toBGpjg_ClY-unsplash.jpg")
          : currentWeather < 25
          ? require("../assets/jessica-fadel-m1ZdLbux1DA-unsplash.jpg")
          : require("../assets/kseniia-ilinykh-crAfJNZRKRE-unsplash.jpg"))
      }
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {currentWeather && (
          <View style={styles.currentWeatherContainer}>
            <Text style={styles.currentWeatherTitle}>
              {locationData.description}
            </Text>
            <Text style={styles.currentWeatherValue}>{currentWeather} °C</Text>
          </View>
        )}
        <View style={styles.hourlyTempsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {hourlyTemps &&
              hourlyTemps.map((element, idx) => {
                return (
                  <View style={styles.hourlyTemps} key={idx}>
                    <Text style={styles.hourlyTempText}>{element.hour}</Text>
                    <Text style={styles.hourlyTempText}>{element.temp}°C</Text>
                  </View>
                );
              })}
          </ScrollView>
        </View>
        {forecast.length > 0 && (
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>Weekly Forecast:</Text>
            <FlatList
              data={forecast}
              renderItem={({ item }) => (
                <View style={styles.forecastItem}>
                  <Text style={styles.date}>{item.date}</Text>
                  <Text style={styles.temperature}>{item.day} °C</Text>
                  <Text style={styles.temperature}>{item.eve} °C</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' if you want to stretch the image
  },
  currentWeatherContainer: {
    marginTop: 20,
    alignItems: "center", // Center items horizontally
  },
  currentWeatherTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  currentWeatherValue: {
    fontSize: 20,
    color: "white",
  },
  forecastContainer: {
    marginTop: 20,
    // backgroundColor: "rgba(255, 255, 255, 0.2)", // Semi-transparent white background for forecast
    borderRadius: 10,
    padding: 15,
  },
  forecastTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  forecastItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  date: {
    flex: 1, // Take 1/3 of the available space

    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  temperature: {
    flex: 1, // Take 1/3 of the available space

    fontSize: 16,
    color: "white",
    textAlign: "center",
  },

  hourlyTemps: {
    alignItems: "center",
    marginTop: 10,
  },

  hourlyTempText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    margin: 7,
  },

  hourlyTempsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgrey",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});
