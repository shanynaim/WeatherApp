import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Button,
  FlatList,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_KEY_AUTOCOMPLETE_PLACE } from "@env";

const { width, height } = Dimensions.get("window");

export default function SearchPlace({ navigation }) {
  const [location, setLocation] = useState({});
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function autoCompletePlace() {
      try {
        const autoCompleteRes = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${location}&types=(cities)&key=${API_KEY_AUTOCOMPLETE_PLACE}`
        );

        let predictionsArr = autoCompleteRes.data.predictions.map(
          (prediction, idx) => {
            return {
              description: prediction.description,
              placeId: prediction.place_id,
            };
          }
        );

        setPredictions(predictionsArr);
      } catch (error) {
        console.log("error: " + error);
      }
    }

    autoCompletePlace();
  }, [location]);

  const handlePredictionPress = (item) => {
    setLocation(item);
    setShowPredictions(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          onChangeText={(text) => {
            setLocation(text);
            setShowPredictions(true);
          }}
          value={location.description}
        />
        {showPredictions && predictions.length > 0 && (
          <FlatList
            data={predictions}
            style={styles.predictionsContainer}
            renderItem={({ item }) => (
              <View>
                <Button
                  title={item.description}
                  onPress={() => handlePredictionPress(item)}
                />
              </View>
            )}
            keyExtractor={(item) => item.placeId}
          />
        )}
      </View>
      <Button
        title="Search"
        onPress={() => {
          if (typeof location === "object") {
            setErrorMessage(null);
            let locationData = location;
            setLocation({});
            navigation.navigate("Forecast", { locationData });
          } else {
            setErrorMessage("Error in city name");
          }
        }}
      />
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
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
    backgroundColor: "#ecf0f1",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02, // 2% of screen height
  },
  input: {
    height: height * 0.05, // 5% of screen height
    width: width * 0.6, // 60% of screen width
    borderColor: "black",
    borderWidth: 1,
    marginRight: width * 0.02, // 2% of screen width
  },
  predictionsContainer: {
    position: "absolute",
    top: height * 0.05, // 10% of screen height
    left: width * 0.001, // 2% of screen width
    zIndex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    width: width * 0.6, // 60% of screen width
  },

  errorMessage: {
    color: "red", // or any other desired color
    fontSize: 16,
    marginTop: 10, // adjust the margin as needed
  },
});
