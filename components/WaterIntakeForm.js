import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

const WaterIntakeForm = ({ onAddIntake, isGoalReached }) => {
  const [mlInput, setMlInput] = useState('');
  const [glassInput, setGlassInput] = useState('');

  const handleAddMlIntake = () => {
    if (mlInput) {
      onAddIntake(parseInt(mlInput));
      setMlInput('');
    }
  };

  const handleAddGlassIntake = () => {
    if (glassInput) {
      onAddIntake(parseInt(glassInput) * 200);
      setGlassInput('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isGoalReached && styles.disabledInput]}
          placeholder="water"
          keyboardType="numeric"
          value={mlInput}
          onChangeText={setMlInput}
          editable={!isGoalReached}
        />
        <Text>ml</Text>
        <TouchableOpacity
          style={[styles.addButton, isGoalReached && styles.disabledButton]}
          onPress={handleAddMlIntake}
          disabled={isGoalReached}
        >
          <Image source={require('../assets/plus.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isGoalReached && styles.disabledInput]}
          placeholder="cup"
          keyboardType="numeric"
          value={glassInput}
          onChangeText={setGlassInput}
          editable={!isGoalReached}
        />
        <Image source={require('../assets/verre-deau.png')} style={styles.verre} />
        <TouchableOpacity
          style={[styles.addButton, isGoalReached && styles.disabledButton]}
          onPress={handleAddGlassIntake}
          disabled={isGoalReached}
        >
          <Image source={require('../assets/plus.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    top: -90,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 30,
    marginRight: 10,
  },
  addButton: {
    borderRadius: 5,
    padding: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  verre: {
    width: 30,
    height: 30,
  },
  disabledInput: {
    backgroundColor: '#e0e0e0',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
});

export default WaterIntakeForm;