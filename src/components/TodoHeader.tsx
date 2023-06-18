import { useEffect, useState } from 'react';
import moonImg from '../assets/icon-moon.svg';
import sunImg from '../assets/icon-sun.svg';
import { User } from '../App';

const TodoHeader = ({
  onLogout,
  onModeChange,
  user,
}: {
  onLogout: () => void;
  user: User;
  onModeChange: (isDark: boolean) => void;
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem('mode') === 'dark');
  }, []);

  useEffect(() => {
    if (isDark) document.querySelector('html')?.classList.add('dark');
    else document.querySelector('html')?.classList.remove('dark');
    onModeChange(isDark);
  }, [isDark]);

  const toggleMode = () => {
    document.querySelector('html')?.classList.toggle('dark');
    const currentMode = localStorage.getItem('mode');
    localStorage.setItem('mode', currentMode === 'dark' ? 'light' : 'dark');
    setIsDark(currentMode !== 'dark');
  };

  return (
    <div className="flex mb-4 items-center justify-between gap-2">
      <span
        style={{
          letterSpacing: '10px',
          textShadow: '2px 3px 3px rgba(0,0,0,.1)',
        }}
        className="text-4xl flex-1  leading-5 inline-block uppercase text-white font-bold"
      >
        TODO
      </span>
      <div className="flex gap-2 items-center">
        <button onClick={toggleMode}>
          <img
            tabIndex={1}
            className="h-6 w-6 object-cover cursor-pointer "
            src={!isDark ? moonImg : sunImg}
            alt="Dark mode"
          />
        </button>
        <span className="h-5 border-l-2 border-gray-900"></span>
        <span className="text-white font-bold mx-1 p-1">{user?.name}</span>
        <button
          onClick={onLogout}
          className="p-1 border px-2 text-white font-bold rounded hover:bg-white/30 mr-3 border-white"
        >
          Logout &rarr;
        </button>
      </div>
    </div>
  );
};

export default TodoHeader;
