import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import herbalData from "./conditions.json";
import logo from "./assets/mort.png";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;
const systems = herbalData.document.systems;

function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const insets = useSafeAreaInsets();

  const diseaseData = systems
    .flatMap(
      (system) =>
        system.diseases?.map((disease) => ({
          ...disease,
          systemName: system.name,
          image: disease.herbs?.[0]?.image || "https://via.placeholder.com/150",
        })) || []
    )
    .filter(Boolean);

  const filteredDiseases = diseaseData.filter((disease) => {
    return (
      disease.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.symptoms_and_signs
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleBackToWelcome = () => {
    setShowSearchResults(false);
    setSearchQuery("");
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar backgroundColor="#2e7d32" barStyle="light-content" />
      <Image
        source={require("./assets/background.jpg")}
        style={styles.backgroundImage}
        blurRadius={showSearchResults ? 3 : 0}
      />

      {/* Green header that stretches to top */}
      <View style={styles.headerContainer}>
        <SafeAreaView style={styles.safeAreaHeader}>
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        </SafeAreaView>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInputWhite}
            placeholder="Search diseases or symptoms..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
          />
        </View>

        {showSearchResults ? (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToWelcome}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="green"
              />
              <Text style={styles.backButtonTextWhite}>Back to welcome</Text>
            </TouchableOpacity>

            <FlatList
              data={searchQuery ? filteredDiseases : diseaseData}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              contentContainerStyle={styles.gridContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.diseaseCardGreen}
                  onPress={() =>
                    navigation.navigate("DiseaseDetail", { disease: item })
                  }
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7",
                    }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitleWhite} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardSystemWhite}>
                      {item.systemName}
                    </Text>
                    <Text style={styles.cardSymptomsWhite} numberOfLines={2}>
                      {item.symptoms_and_signs}
                    </Text>
                    <Text style={styles.herbsCountWhite}>
                      {item.herbs?.length || 0}{" "}
                      {item.herbs?.length === 1 ? "remedy" : "remedies"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTextWhite}>
                    No diseases found matching your search
                  </Text>
                </View>
              }
            />
          </>
        ) : (
          <ScrollView contentContainerStyle={styles.welcomeContainerWhite}>
            <View style={styles.welcomeCardGreen}>
              <Text style={styles.welcomeTitleWhite}>Welcome to HerbAfric!</Text>
              <Text style={styles.welcomeTextWhite}>
              From Plants to Pharmacy: HerbAfric, Africa’s Herbal Wisdom in Your Hands!
              </Text>

              <View style={styles.instructionSection}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={24}
                  color="green"
                />
                <Text style={styles.instructionTextWhite}>
                  Tap the search bar above to explore diseases and their herbal
                  treatments
                </Text>
              </View>

              <View style={styles.instructionSection}>
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="green"
                />
                <Text style={styles.instructionTextWhite}>
                  Browse remedies by disease or search for specific symptoms
                </Text>
              </View>

              <View style={styles.instructionSection}>
                <MaterialCommunityIcons name="leaf" size={24} color="green" />
                <Text style={styles.instructionTextWhite}>
                  Discover traditional preparations and native names for each
                  herb
                </Text>
              </View>
              
              <View style={styles.instructionSection}>
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="red"
                />
                <Text style={styles.instructionTextWhite}>
                Always consult a qualified healthcare provider before using herbal remedies, especially if pregnant, nursing, taking medications, or managing a health condition.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
function DiseaseDetailScreen({ route, navigation }) {
  const disease = route.params?.disease || {};
  const insets = useSafeAreaInsets();

  if (!route.params?.disease) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: "#2e7d32" }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.textWhite}>
            Disease information not available
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkWhite}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "rgba(45, 145, 32, 0.9)" }]}
    >
      <ScrollView
        style={styles.detailContainer}
        contentContainerStyle={{ paddingTop: 1 }}
      >
        <View style={[styles.detailHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.detailTitleWhite}>{disease.name}</Text>
        </View>

        {disease.symptoms_and_signs && (
          <Text style={styles.detailSubtitleWhite}>
            Symptoms: {disease.symptoms_and_signs}
          </Text>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleWhite}>Herbal Remedies</Text>
          {disease.herbs?.map((herb, index) => (
            <View key={index} style={styles.herbCardGreen}>
              <Text style={styles.herbNameWhite}>{herb.name}</Text>

              {herb.native_names && (
                <View style={styles.nativeNamesContainer}>
                  <Text style={styles.nativeNamesTitleWhite}>
                    Native Names:
                  </Text>
                  {Object.entries(herb.native_names).map(([language, name]) => (
                    <Text key={language} style={styles.nativeNameWhite}>
                      {language}: {name}
                    </Text>
                  ))}
                </View>
              )}

              {herb.preparation && (
                <>
                  <Text style={styles.preparationTitleWhite}>Preparation:</Text>
                  <Text style={styles.preparationTextWhite}>
                    {herb.preparation}
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#2e7d32" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="DiseaseDetail"
          component={DiseaseDetailScreen}
          options={{
            gestureEnabled: true,
            cardOverlayEnabled: true,
            cardStyleInterpolator: ({ current, next, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
                overlayStyle: {
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                  }),
                },
              };
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#2e7d32",
    width: "100%",
  },
  safeAreaHeader: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  searchContainer: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: "cover",
    opacity: 0.9,
  },
  header: {
    backgroundColor: "#2e7d32",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 20,
  },
  logoImage: {
    width: 120, // adjust as needed
    height: 40, // adjust as needed
    alignSelf: 'center',
    marginTop: 10,
  },
  searchContainer: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 20,
  },
  searchInputWhite: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 12,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 10,
    color: "white",
  },
  diseaseCardGreen: {
    width: CARD_WIDTH,
    backgroundColor: "rgba(45, 145, 32, 0.7)",
    borderRadius: 10,
    padding: 5,
    margin: CARD_MARGIN / 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "40%",
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardTitleWhite: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  cardSystemWhite: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    fontStyle: "italic",
  },
  cardSymptomsWhite: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  herbsCountWhite: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  welcomeContainerWhite: {
    flexGrow: 1,
    padding: 8,
  },
  welcomeCardGreen: {
    backgroundColor: "none",
    opacity: 2,
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  welcomeTitleWhite: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    marginBottom: 15,
    textAlign: "center",
  },
  welcomeTextWhite: {
    fontSize: 16,
    color: "green",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 24,
  },
  instructionSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  instructionTextWhite: {
    fontSize: 15,
    color: "green",
    marginLeft: 10,
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingLeft: 15,
  },
  backButtonTextWhite: {
    color: "green",
    marginLeft: 5,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTextWhite: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2e7d32",
  },
  textWhite: {
    color: "white",
  },
  backLinkWhite: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "rgba(45, 145, 32, 0.9)",
  },
  detailHeader: {
    backgroundColor: "rgba(45, 145, 32, 0.9)",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
  },
  detailTitleWhite: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  detailSubtitleWhite: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    margin: 15,
    marginTop: 10,
  },
  sectionContainer: {
    padding: 15,
  },
  sectionTitleWhite: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  herbCardGreen: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  herbNameWhite: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  nativeNamesContainer: {
    marginBottom: 10,
  },
  nativeNamesTitleWhite: {
    fontWeight: "bold",
    color: "white",
  },
  nativeNameWhite: {
    marginLeft: 10,
    color: "rgba(255, 255, 255, 0.9)",
  },
  preparationTitleWhite: {
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  preparationTextWhite: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  gridContainer: {
    paddingBottom: 20,
    paddingTop: 25,
  },
});

export default App;
