import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'eventlog-rn',
  description: 'Functional, type-safe event logging for React Native',
  base: '/eventlog-rn/',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/eventlog' },
      { text: 'Integrations', link: '/integrations/react-navigation' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quickstart' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'Error Handling', link: '/guide/error-handling' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'EventLog', link: '/api/eventlog' },
            { text: 'Viewer', link: '/api/viewer' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
      '/integrations/': [
        {
          text: 'Integrations',
          items: [
            { text: 'React Navigation', link: '/integrations/react-navigation' },
            { text: 'Expo Router', link: '/integrations/expo-router' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: 'Advanced',
          items: [
            { text: 'Architecture', link: '/advanced/architecture' },
            { text: 'Multiple Instances', link: '/advanced/multiple-instances' },
            { text: 'Custom Sanitizer', link: '/advanced/custom-sanitizer' },
            { text: 'Performance', link: '/advanced/performance' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nainglynndw/eventlog-rn' },
      { icon: { svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>npm</title><path d="M0 0v24h24V0H0zm8 4h8v4H8V4zm4 12H8v-4h4v4zm4 0h-4v-4h4v4zm4 0h-4v-4h4v4zm0-8H8V4h12v4z"/></svg>' }, link: 'https://www.npmjs.com/package/eventlog-rn' },
    ],

    search: {
      provider: 'local',
    },
  },
});
