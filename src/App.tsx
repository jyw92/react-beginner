import {ThemeProvider} from './provider/theme-provider';
import RootRouter from './root-router';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RootRouter />
    </ThemeProvider>
  );
}

export default App;
