/**
 * SearchBar component
 */

import React from 'react';
import { TextInput } from 'react-native';
import type { SearchBarProps } from './types';
import { styles, colors } from './styles';

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <TextInput
      style={styles.searchInput}
      placeholder="Search events..."
      value={value}
      onChangeText={onChange}
      placeholderTextColor={colors.text.tertiary}
    />
  );
};
