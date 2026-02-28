// mobile-app/App.tsx
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// redux
import { Provider } from 'react-redux';
import { store } from './src/store/store';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <LanguageProvider>
          <ThemeProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </LanguageProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
