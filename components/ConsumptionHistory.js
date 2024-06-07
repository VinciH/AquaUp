import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConsumptionHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('consumptionHistory');
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        setHistory(history);
      } catch (e) {
        console.error('Failed to load consumption history.', e);
      }
    };

    loadHistory();
  }, []);

  const renderItem = ({ item }) => {
    const percentage = (item.intake / 1500) * 100;
    const isSuccess = percentage >= 100;

    return (
      <View style={styles.item}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.percentage}>{percentage.toFixed(2)}%</Text>
        <Image
          source={isSuccess ? require('../assets/succes (1).png') : require('../assets/fermer.png')}
          style={styles.icon}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  date: {
    fontSize: 16,
  },
  percentage: {
    fontSize: 16,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default ConsumptionHistory;
