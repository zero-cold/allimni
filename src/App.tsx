import '@fontsource/baloo-bhaijaan-2/arabic-500.css';
import '@fontsource/baloo-bhaijaan-2/arabic-800.css';
import '@fontsource/baloo-bhaijaan-2/latin-500.css';
import '@fontsource/baloo-bhaijaan-2/latin-800.css';
import './styles.css';
import { StoreProvider, useApp } from './app/store';
import { ProfilesScreen } from './screens/ProfilesScreen';

function Router() {
  const { screen } = useApp();
  if (screen.name === 'map') return <main data-testid="map" />;
  return <ProfilesScreen />;
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
