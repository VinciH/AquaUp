import React from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ProgressCircle = () => {
  const progressValue = 0.7; // 70% de progression
  const data = {
    data: [progressValue],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 8, 
    barPercentage: 0.5,
    useShadowColorFromDataset: false, 
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <ProgressChart
          data={data}
          width={screenWidth - 32}
          height={220}
          strokeWidth={5}
          radius={65}
          chartConfig={chartConfig}
          hideLegend={true}
        />
        <View style={styles.textView}>
          <Text style={styles.text}>
            {`${Math.round(progressValue * 100)}%`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textView: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
});

export default ProgressCircle;
