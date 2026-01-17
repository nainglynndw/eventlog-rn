/**
 * FilterChip component
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { FilterChipProps } from './types';
import { CATEGORY_COLORS } from './types';
import { styles, colors } from './styles';

export const FilterChip: React.FC<FilterChipProps> = ({ category, selected, onToggle }) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? CATEGORY_COLORS[category] : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.filterText,
          { color: selected ? '#fff' : colors.text.secondary },
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
};
