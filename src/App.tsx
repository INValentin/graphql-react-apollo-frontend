import { useEffect, useState } from 'react';
import { CREATE_USER, LOGIN_USER_AND_GET_TODOS, client } from './apollo';
import dBgLight from './assets/bg-desktop-light.jpg';
import dBgDark from './assets/bg-desktop-dark.jpg';
import mBgDark from './assets/bg-mobile-dark.jpg';
import mBgLight from './assets/bg-mobile-light.jpg';
import TodoHeader from './components/TodoHeader';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';

import { ApolloProvider, useMutation } from '@apollo/client';

export type User = {
  email: string;
  id: number;
  name: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (savedUser !== null && savedUser.id && savedUser.email)
      setUser({
        email: savedUser.email,
        id: savedUser.id,
        name: savedUser.name,
      });
  }, []);

  const onLogin = () => {
    const savedUser = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (savedUser !== null && savedUser.id && savedUser.email)
      setUser({
        email: savedUser.email,
        id: savedUser.id,
        name: savedUser.name,
      });
  };

  const onLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleModeChange = (isDark: boolean) => {
    setIsDark(isDark);
  };

  return (
    <ApolloProvider client={client}>
      {!user && <Auth onLogin={onLogin} />}
      <div className="w-full dark:bg-[#181824] flex relative flex-col min-h-screen">
        <img
          className="flex-1 hidden md:inline-block lg:flex-[0] md:h-72"
          src={isDark ? dBgDark : dBgLight}
          alt="Background"
        />
        <img
          className="flex-1 md:hidden lg:flex-[0] md:h-72"
          src={isDark ? mBgDark : mBgLight}
          alt="Background"
        />
        <div className="absolute w-full  flex-col p-3 top-[2.5rem] md:top-[5rem] left-1/2 -translate-x-1/2 max-w-lg">
          <TodoHeader
            onModeChange={handleModeChange}
            user={user as User}
            onLogout={onLogout}
          />
          <TodoInput />

          {user && <TodoList isDark={isDark} user={user as User} />}
        </div>
        <div className="flex-[5] h-full dark:bg-[#181824]"></div>
      </div>
    </ApolloProvider>
  );
}

const Auth = ({ onLogin }: { onLogin: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [login, { loading, data, error }] = useMutation(
    LOGIN_USER_AND_GET_TODOS,
    { variables: { email } }
  );
  const [signup, { loading: loading2, error: error2, data: data2 }] =
    useMutation(CREATE_USER, { variables: { data: { name, email } } });

  useEffect(() => {
    if (data?.loginUser) {
      localStorage.setItem('user', JSON.stringify(data.loginUser));
      onLogin();
    } else if (data && !data.loginUser) {
      console.log({ h: data });
      alert('Incorrect email!');
    }
  }, [data]);
  useEffect(() => {
    if (data2?.createUser) {
      localStorage.setItem('user', JSON.stringify(data2.createUser));
      onLogin();
    } else if (data2 && !data2.createUser) {
      alert('Something went wrong!');
    }
  }, [data2]);

  useEffect(() => {
    if (error || error2) {
      alert(error?.message ?? error2?.message);
    }
  }, [error, error2]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isLogin && !name.trim()) || !email.trim()) {
      return alert('Invalid Data!');
    }
    if (isLogin) {
      await login();
    } else {
      // signup({ variables: { email, name } }).catch((e) => console.log(e));
      await signup();
    }
  };

  return (
    <div className="fixed z-40 inset-0 bg-black/60 min-h-screen overflow-hidden flex justify-center items-center">
      <form
        action=""
        onSubmit={handleSubmit}
        className="flex flex-col rounded-md p-4 border  gap-2 min-w-[320px] max-w-[400px] shadow-md bg-white dark:bg-[#181824] dark:text-white"
      >
        <h4 className="text-3xl font-bold text-center my-2  text-gray-700 dark:text-white">
          {isLogin ? 'Login' : 'Signup'}
        </h4>
        {!isLogin && (
          <input
            autoFocus
            type="text"
            onChange={(e) => setName(e.currentTarget.value)}
            className="p-2 rounded  my-2 border w-full  dark:bg-[#24273d]"
            placeholder="Name"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          className="p-2 rounded  my-2 border w-full dark:bg-[#24273d]"
        />
        <a
          onClick={() => setIsLogin(!isLogin)}
          className="block text-right p-2 my-2 text-blue-500 cursor-pointer hover:text-blue-700 hover:underline"
        >
          {isLogin ? (
            <>Don't have account? Signup &rarr;</>
          ) : (
            <>Have an account? Login &rarr;</>
          )}{' '}
        </a>

        <button
          type="submit"
          disabled={loading || loading2}
          className="bg-blue-400 flex items-center justify-center gap-2 disabled:bg-gray-500 text-white hover:bg-blue-600 p-2 min-w-[170px] mx-auto w-fit rounded"
        >
          {(loading || loading2) && (
            <span className="w-4 h-4 rounded-full border-dotted border-[3px] border-b-0 border-l-0 animate-spin" />
          )}
          {isLogin ? 'LOGIN' : 'SIGNUP'}
        </button>
      </form>
    </div>
  );
};

export default App;
