import React, {useState, useEffect} from 'react';
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
  StatusBar
} from 'react-native';
import { useNavigation, useHeaderHeight } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import LoadingScreen from './LoadingScreen';

// Import your JSON data
import herbalData from './conditions.json';



// Calculate card dimensions
const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / 2;

// Extract systems data
const systems = herbalData.document.systems;

function HomeScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const diseaseData = systems.flatMap(system => 
    system.diseases?.map(disease => ({
      ...disease,
      systemName: system.name,
      image: disease.herbs?.[0]?.image || 'https://via.placeholder.com/150'
    })) || []
  ).filter(Boolean);

  const filteredDiseases = diseaseData.filter(disease => {
    return (
      disease.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.symptoms_and_signs?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#2e7d32' }]}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HerbAfric</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search diseases or symptoms..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <FlatList
          data={searchQuery ? filteredDiseases : diseaseData}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.diseaseCard}
              onPress={() => navigation.navigate('DiseaseDetail', { disease: item })}
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7' }} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardSystem}>{item.systemName}</Text>
                <Text style={styles.cardSymptoms} numberOfLines={2}>{item.symptoms_and_signs}</Text>
                <Text style={styles.herbsCount}>
                  {item.herbs?.length || 0} {item.herbs?.length === 1 ? 'remedy' : 'remedies'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No diseases found matching your search</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

function DiseaseDetailScreen({ route, navigation }) {
  const disease = route.params?.disease || {};
  const insets = useSafeAreaInsets();

  if (!route.params?.disease) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#2e7d32' }]}>
        <View style={styles.loadingContainer}>
          <Text>Disease information not available</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#2e7d32' }]}>
      <ScrollView 
        style={styles.detailContainer}
        contentContainerStyle={{ paddingTop: insets.top + 20 }}      >
        <View style={[styles.detailHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{disease.name}</Text>
        </View>
        
        {disease.symptoms_and_signs && (
          <Text style={styles.detailSubtitle}>Symptoms: {disease.symptoms_and_signs}</Text>
        )}
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Herbal Remedies</Text>
          {disease.herbs?.map((herb, index) => (
            <View key={index} style={styles.herbCard}>
              <Text style={styles.herbName}>{herb.name}</Text>
              
              {herb.native_names && (
                <View style={styles.nativeNamesContainer}>
                  <Text style={styles.nativeNamesTitle}>Native Names:</Text>
                  {Object.entries(herb.native_names).map(([language, name]) => (
                    <Text key={language} style={styles.nativeName}>
                      {language}: {name}
                    </Text>
                  ))}
                </View>
              )}
              
              {herb.preparation && (
                <>
                  <Text style={styles.preparationTitle}>Preparation:</Text>
                  <Text style={styles.preparationText}>{herb.preparation}</Text>
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
          cardStyle: { backgroundColor: '#f5f5f5' },
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
  safeArea: {
    flex: 1,
    backgroundColor: '#2e7d32',
  },
  container: {
    flex: 1,
    marginBottom: -38,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    marginTop: -49,
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#2e7d32',
    padding: 10,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  gridContainer: {
    paddingBottom: 20,
    paddingTop: 25,
  },
  diseaseCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    margin: CARD_MARGIN / 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '40%',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  cardSystem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  cardSymptoms: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  herbsCount: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  detailContainer: {
    flex: 1,
    marginTop: -120,
    marginBottom: -38,
    backgroundColor: '#f5f5f5',
  },
  detailHeader: {
    backgroundColor: '#2e7d32',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
  },
  backButton: {
    marginTop: 29,

    marginRight: 15,
    padding: 8,
  },
  detailTitle: {
    marginTop: 29,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#666',
    margin: 15,
    marginTop: 10,
  },
  sectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
  },
  herbCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  herbName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  nativeNamesContainer: {
    marginBottom: 10,
  },
  nativeNamesTitle: {
    fontWeight: 'bold',
    color: '#555',
  },
  nativeName: {
    marginLeft: 10,
    color: '#555',
  },
  preparationTitle: {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  preparationText: {
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backLink: {
    color: '#2e7d32',
    marginTop: 10,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loadingText: {
    marginTop: 20,
    color: 'white',
    fontSize: 16
  },
});

export default App;