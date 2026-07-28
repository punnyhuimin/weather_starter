import { Sidebar } from './Sidebar';
import { Hero } from './Hero';
import { ThemeSelector } from './ThemeSelector';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const { currentTheme } = useTheme();

  return (
    <div
      className="flex h-full min-h-screen w-full"
      style={{
        background: currentTheme.background,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <ThemeSelector />
      <Sidebar />
      <Hero />
    </div>
  );
}
