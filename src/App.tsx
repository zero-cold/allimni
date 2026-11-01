import '@fontsource/baloo-bhaijaan-2/arabic-500.css';
import '@fontsource/baloo-bhaijaan-2/arabic-800.css';
import '@fontsource/baloo-bhaijaan-2/latin-500.css';
import '@fontsource/baloo-bhaijaan-2/latin-800.css';
import './styles.css';
import { ErrorBoundary } from './app/ErrorBoundary';
import { StoreProvider, useApp } from './app/store';
import { CompanionScreen } from './screens/CompanionScreen';
import { MapScreen } from './screens/MapScreen';
import { ParentScreen } from './screens/ParentScreen';
import { ProfilesScreen } from './screens/ProfilesScreen';
import { StageScreen } from './screens/StageScreen';

function Router() {
  const { screen, active, state } = useApp();
  if (active && screen.name === 'map') return <MapScreen />;
  if (active && screen.name === 'stage') return <StageScreen key={`${screen.island}-${screen.index}`} island={screen.island} index={screen.index} />;
  if (active && screen.name === 'companion') return <CompanionScreen />;
  if (screen.name === 'parent') return <ParentScreen />;
  return <ProfilesScreen key={state.profiles.length === 0 ? 'empty' : 'list'} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Router />
      </StoreProvider>
    </ErrorBoundary>
  );
}
