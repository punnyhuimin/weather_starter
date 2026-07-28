import { useTheme, THEMES } from '../context/ThemeContext';

export function ThemeSelector() {
  const { setTheme, themeNames } = useTheme();
  const currentThemeKey = themeNames.find((key) => {
    return typeof window !== 'undefined' && localStorage.getItem('weather-app-theme') === key;
  }) || 'apple';

  return (
    <div className="absolute top-6 right-6 z-50">
      <select
        value={currentThemeKey}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition cursor-pointer"
      >
        {themeNames.map((key) => (
          <option key={key} value={key} style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
            {THEMES[key].name}
          </option>
        ))}
      </select>
    </div>
  );
}
