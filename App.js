import React, { useState }  from 'react';
import { StyleSheet, View,Text } from 'react-native';
import ProgressCircle from './components/ProgressCircle';
import ProgressBar from './components/ProgressBar';
import WaterIntakeForm from './components/WaterIntakeForm';

const App = () => {
  /*progression bar*/
  const weeklyProgress = 0.6; // exemple de progression hebdomadaire (60%)
  const monthlyProgress = 0.4; // exemple de progression mensuelle (40%)
  const goalCompletion = 0.75; // exemple de complétion de l'objectif (75%)

  /*WaterIntakeform*/
  const [waterIntake, setWaterIntake] = useState(0);
  const [goal, setGoal] = useState(1500); // Default goal: 1500ml

  const handleAddIntake = (intake) => {
    setWaterIntake(waterIntake + intake);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AquaUP</Text>
      <Text style={styles.target}>Aqua Target: {1500} ml</Text>
      <ProgressCircle style={styles.cercle}/>
      <WaterIntakeForm onAddIntake={handleAddIntake} />
      <ProgressBar label="Weekly average" percentage={weeklyProgress * 100} />
      <ProgressBar label="Monthly average" percentage={monthlyProgress * 100} />
      <ProgressBar label="Average Completion" percentage={goalCompletion * 100} />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding:20,
  },

  title:{
    fontSize:25,
    marginBottom: 10,
    marginTop: 50,
  },
  target:{
    fontSize:15,
    marginBottom: 10,
  },
});



export default App;
