/**
 * Header component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { HeaderProps } from './types';
import { styles } from './styles';

export const Header: React.FC<HeaderProps> = ({ eventCount, onExport, onClear }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Event Log ({eventCount})</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={onExport} style={styles.button}>
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClear} style={styles.button}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
