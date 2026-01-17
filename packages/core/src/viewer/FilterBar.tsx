/**
 * FilterBar component
 */

import React from 'react';
import { ScrollView } from 'react-native';
import type { FilterBarProps } from './types';
import { ALL_CATEGORIES } from './types';
import { FilterChip } from './FilterChip';
import { styles } from './styles';

export const FilterBar: React.FC<FilterBarProps> = ({ selected, onToggle }) => {
  return (
    <ScrollView horizontal style={styles.filters} showsHorizontalScrollIndicator={false}>
      {ALL_CATEGORIES.map((category) => (
        <FilterChip
          key={category}
          category={category}
          selected={selected.includes(category)}
          onToggle={() => onToggle(category)}
        />
      ))}
    </ScrollView>
  );
};
