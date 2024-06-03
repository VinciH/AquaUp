import React from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ProgressCircle = ({ progress }) => {
  const data = {
    data: [progress],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 60, 87, ${opacity})`,
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
          {`${Math.round(progress * 100)}%`}
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
