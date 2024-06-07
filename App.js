import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProgressCircle from './components/ProgressCircle';
import ProgressBar from './components/ProgressBar';
import WaterIntakeForm from './components/WaterIntakeForm';
import ConsumptionHistory from './components/ConsumptionHistory';
import { useFonts } from 'expo-font';
import Modal from 'react-native-modal';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

const Stack = createStackNavigator();

const calculateGoalCompletionRate = (history, goal) => {
  const successDays = history.filter(entry => entry.intake >= goal).length;
  return history.length > 0 ? successDays / history.length : 0;
};

const HomeScreen = ({ navigation }) => {
  const [waterIntake, setWaterIntake] = useState(0);
  const [goal, setGoal] = useState(1500);
  const [isGoalReached, setIsGoalReached] = useState(false);
  const [consumptionHistory, setConsumptionHistory] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [monthlyProgress, setMonthlyProgress] = useState(0);
  const [goalCompletionRate, setGoalCompletionRate] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [isCongratsModalVisible, setCongratsModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Audiowide: require('./assets/fonts/Audiowide-Regular.ttf'),
  });

  useEffect(() => {
    const loadWaterIntake = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('consumptionHistory');
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        setConsumptionHistory(history);

        const currentDate = new Date().toDateString();
        const todayEntry = history.find(entry => entry.date === currentDate);
        const intakeToday = todayEntry ? todayEntry.intake : 0;
        setWaterIntake(intakeToday);
      } catch (e) {
        console.error('Failed to load water intake history.', e);
      }
    };

    loadWaterIntake();
  }, []);

  useEffect(() => {
    const saveWaterIntake = async () => {
      try {
        const currentDate = new Date().toDateString();
        const updatedHistory = consumptionHistory.filter(entry => entry.date !== currentDate);
        updatedHistory.push({ date: currentDate, intake: waterIntake });
        await AsyncStorage.setItem('consumptionHistory', JSON.stringify(updatedHistory));
        setConsumptionHistory(updatedHistory); // Moved here to minimize renders
      } catch (e) {
        console.error('Failed to save water intake.', e);
      }
    };

    if (waterIntake !== 0) {
      saveWaterIntake();
    }
  }, [waterIntake]);

  useEffect(() => {
    setIsGoalReached(waterIntake >= goal);
    if (waterIntake >= goal) {
      setCongratsModalVisible(true);
    }
  }, [waterIntake, goal]);

  useEffect(() => {
    const calculateProgress = () => {
      const currentDate = new Date();
      const pastWeekDates = Array.from({ length: 7 }, (_, i) => new Date(currentDate - i * 24 * 60 * 60 * 1000).toDateString());
      const pastMonthDates = Array.from({ length: 30 }, (_, i) => new Date(currentDate - i * 24 * 60 * 60 * 1000).toDateString());

      const weeklyIntake = consumptionHistory.filter(entry => pastWeekDates.includes(entry.date))
        .reduce((sum, entry) => sum + entry.intake, 0);
      const monthlyIntake = consumptionHistory.filter(entry => pastMonthDates.includes(entry.date))
        .reduce((sum, entry) => sum + entry.intake, 0);

      setWeeklyProgress(weeklyIntake / (goal * 7));
      setMonthlyProgress(monthlyIntake / (goal * 30));
    };

    calculateProgress();
  }, [consumptionHistory, goal]);

  useEffect(() => {
    setGoalCompletionRate(calculateGoalCompletionRate(consumptionHistory, goal));
  }, [consumptionHistory, goal]);

  const handleAddIntake = (intake) => {
    if (!isGoalReached) {
      setWaterIntake(prevIntake => prevIntake + intake); // Use previous state to avoid dependency issues
    }
  };

  const handleResetProgress = () => {
    const currentDate = new Date().toDateString();
    const updatedHistory = consumptionHistory.filter(entry => entry.date !== currentDate);
    setConsumptionHistory(updatedHistory);
    setWaterIntake(0);
    setWeeklyProgress(0);
    setMonthlyProgress(0);
    setGoalCompletionRate(calculateGoalCompletionRate(updatedHistory, goal));
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  const goalCompletion = Math.min(waterIntake / goal, 1);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleCongratsModal = () => {
    setCongratsModalVisible(!isCongratsModalVisible);
  };

  const handleGoalChange = () => {
    if (newGoal) {
      setGoal(parseInt(newGoal));
      setNewGoal('');
      toggleModal();
    }
  };

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <MenuProvider>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.container}>
          <Text style={[styles.title, { fontFamily: 'Audiowide' }]}>AquaUP</Text>
          <Text style={styles.target}>Aqua Target: {goal} ml</Text>
          <Menu>
            <MenuTrigger>
              <Image source={require('./assets/parametres-cog.png')} style={styles.icon} />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => navigation.navigate('History')}>
                <Text style={styles.menuOptionText}>History</Text>
              </MenuOption>
              <MenuOption onSelect={toggleModal}>
                <Text style={styles.menuOptionText}>Change Target</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
          <ProgressCircle style={styles.cercle} progress={goalCompletion} />
          <WaterIntakeForm onAddIntake={handleAddIntake} isGoalReached={isGoalReached} />
          <ProgressBar label="Weekly average" percentage={weeklyProgress * 100} />
          <ProgressBar label="Monthly average" percentage={monthlyProgress * 100} />
          <ProgressBar label="Goal Completion" percentage={goalCompletionRate * 100} />
          <TouchableOpacity onPress={handleResetProgress} style={styles.resetIcon}>
            <Image source={require('./assets/reinitialiser.png')} style={styles.icon} />
          </TouchableOpacity>
          <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change target</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Entrez l'objectif en ml"
                keyboardType="numeric"
                value={newGoal}
                onChangeText={setNewGoal}
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleGoalChange}>
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal isVisible={isCongratsModalVisible} onBackdropPress={toggleCongratsModal} animationIn="slideInUp">
            <View style={styles.modalContent}>
              <Image source={require('./assets/succes (1).png')} style={styles.successIcon} />
              <Text style={styles.modalTitle}>Congratulations!</Text>
              <Text style={styles.modalText}>You have reached your goal, Keep going</Text>
              <TouchableOpacity style={styles.modalButton} onPress={toggleCongratsModal}>
                <Text style={styles.modalButtonText}>Thanks!</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </MenuProvider>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="History" component={ConsumptionHistory} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    color: '#003C57',
  },
  target: {
    fontSize: 18,
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  resetIcon: {
    marginBottom: 20,
  },
  cercle: {
    marginBottom: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: '#3b5998',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
  },
  successIcon: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  menuOptionText: {
    fontSize: 18,
    padding: 10,
  },
});

export default App;
