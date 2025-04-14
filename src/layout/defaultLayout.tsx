import { useState, useEffect, ReactNode } from "react";

interface DefaultLayoutProps {
  children: ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(
    () =>
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    // Update the theme in localStorage whenever it changes
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    // Apply the theme class to the body
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div className={darkMode ? "dark" : "light"}>
      <button
        onClick={toggleTheme}
        className="mt-5 mr-5 right-0 px-4 py-2 rounded bg-blue-600 text-white dark:bg-gray-800 dark:border dark:border-gray-600 z-50 fixed"
      >
        {darkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
      </button>
      {children}
    </div>
  );
};

export default DefaultLayout;
