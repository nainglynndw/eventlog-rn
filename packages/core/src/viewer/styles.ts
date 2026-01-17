/**
 * Shared styles for viewer components
 */

import { StyleSheet } from 'react-native';

export const colors = {
  background: '#f9fafb',
  surface: '#fff',
  border: '#e5e7eb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  primary: '#3b82f6',
} as const;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  searchInput: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
    color: colors.text.primary,
  },
  filters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    maxHeight: 50,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    textAlignVertical: 'center', // Android
  },
  eventList: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
    textAlignVertical: 'center', // Android specific
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  eventSummary: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  eventDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
