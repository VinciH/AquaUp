import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressCircle from './components/ProgressCircle';
import ProgressBar from './components/ProgressBar';
import WaterIntakeForm from './components/WaterIntakeForm';

// Définir la fonction calculateGoalCompletionRate en dehors du composant App
const calculateGoalCompletionRate = (history, goal) => {
  const successDays = history.filter(entry => entry.intake >= goal).length;
  return history.length > 0 ? successDays / history.length : 0;
};

const App = () => {
  const [waterIntake, setWaterIntake] = useState(0);
  const [goal, setGoal] = useState(1500);
  const [isGoalReached, setIsGoalReached] = useState(false);
  const [consumptionHistory, setConsumptionHistory] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [monthlyProgress, setMonthlyProgress] = useState(0);
  const [goalCompletionRate, setGoalCompletionRate] = useState(0);

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
        setConsumptionHistory(updatedHistory);
        await AsyncStorage.setItem('consumptionHistory', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Failed to save water intake.', e);
      }
    };

    saveWaterIntake();
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
    // Utiliser la fonction calculateGoalCompletionRate déclarée précédemment
    setGoalCompletionRate(calculateGoalCompletionRate(consumptionHistory, goal));
  }, [consumptionHistory, goal, waterIntake]);

  const handleAddIntake = (intake) => {
    if (!isGoalReached) {
      setWaterIntake(waterIntake + intake);
    }
  };

  const handleResetProgress = () => {
    const currentDate = new Date().toDateString();
  
    // Filter out today's entry from consumption history
    const updatedHistory = consumptionHistory.filter(entry => entry.date !== currentDate);
  
    // Reset water intake for today
    setWaterIntake(0);
  
    // Recalculate progress based on updated history
    setWeeklyProgress(calculateWeeklyProgress(updatedHistory));
    setMonthlyProgress(calculateMonthlyProgress(updatedHistory));
    setGoalCompletionRate(calculateGoalCompletionRate(updatedHistory, goal));
  };
  
  const calculateWeeklyProgress = (history) => {
  const currentDate = new Date();
  const pastWeekDates = Array.from({ length: 7 }, (_, i) => new Date(currentDate - i * 24 * 60 * 60 * 1000).toDateString());

  const weeklyIntake = history.filter(entry => pastWeekDates.includes(entry.date))
    .reduce((sum, entry) => sum + entry.intake, 0);

  return weeklyIntake / (goal * 7);
};

const calculateMonthlyProgress = (history) => {
  const currentDate = new Date();
  const pastMonthDates = Array.from({ length: 30 }, (_, i) => new Date(currentDate - i * 24 * 60 * 60 * 1000).toDateString());

  const monthlyIntake = history.filter(entry => pastMonthDates.includes(entry.date))
    .reduce((sum, entry) => sum + entry.intake, 0);

  return monthlyIntake / (goal * 30);
};


  const goalCompletion = Math.min(waterIntake / goal, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AquaUP</Text>
      <Text style={styles.target}>Aqua Target: {goal} ml</Text>
      <ProgressCircle style={styles.cercle} progress={goalCompletion} />
      <WaterIntakeForm onAddIntake={handleAddIntake} isGoalReached={isGoalReached} />
      <ProgressBar label="Weekly average" percentage={weeklyProgress * 100} />
      <ProgressBar label="Monthly average" percentage={monthlyProgress * 100} />
      <ProgressBar label="Goal Completion" percentage={goalCompletionRate * 100} />
      <TouchableOpacity onPress={handleResetProgress}>
      <Image source={require('./assets/reinitialiser.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 25,
    marginBottom: 10,
    marginTop: 50,
    color: '#003C57',
  },
  target: {
    fontSize: 15,
    marginBottom: 10,
  },
  
  icon: {
    width:40,
    height:40,
  }
});

export default App;
