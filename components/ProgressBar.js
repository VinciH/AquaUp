import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ label, percentage }) => {
  return (
    <View style={styles.container}>
      
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.percentage}>{percentage.toFixed(2)}%</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingLeft:5,
    top:-40,
  },
  label: {
    alignItems: '',
    padding: 10,
    paddingLeft:0,
    paddingRight:0,
    width: 140,
  },
  progressBar: {
    flex: 3,
    height: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#3b5998',
  },
  percentage: {
    flex: 1,
    marginLeft: 10,
  },
});

export default ProgressBar;
