import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@eventlog-rn/core',
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
    ],

    search: {
      provider: 'local',
    },
  },
});
