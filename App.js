import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProgressCircle from './components/ProgressCircle';
import ProgressBar from './components/ProgressBar';
import WaterIntakeForm from './components/WaterIntakeForm';
import ConsumptionHistory from './components/ConsumptionHistory';
import { useFonts } from 'expo-font';

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

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <Text style={[styles.title, { fontFamily: 'Audiowide' }]}>AquaUP</Text>
        <Text style={styles.target}>Aqua Target: {goal} ml</Text>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => navigation.navigate('History')}>
          <Image source={require('./assets/parametres-cog.png')} style={styles.icon} />
        </TouchableOpacity>
        <ProgressCircle style={styles.cercle} progress={goalCompletion} />
        <WaterIntakeForm onAddIntake={handleAddIntake} isGoalReached={isGoalReached} />
        <ProgressBar label="Weekly average" percentage={weeklyProgress * 100} />
        <ProgressBar label="Monthly average" percentage={monthlyProgress * 100} />
        <ProgressBar label="Goal Completion" percentage={goalCompletionRate * 100} />
        <TouchableOpacity onPress={handleResetProgress} style={styles.resetIcon}>
          <Image source={require('./assets/reinitialiser.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
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
    fontSize: 25,
    marginBottom: 10,
    color: '#003C57',
  },
  target: {
    fontSize: 15,
    marginBottom: 10,
  },
  settingsIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  resetIcon: {
    top: -20,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default App;
