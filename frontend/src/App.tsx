import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import {LoginScreen} from '@/screens/LoginScreen/LoginScreen';
import {RootState, persistor, useAppSelector} from '@/store';
import {Layout2} from '@/layouts/Layout/Layout';
import {TopicScreen} from '@/screens/TopicScreen/TopicScreen';
import {ConfigProvider} from 'antd';
import {PersistGate} from 'redux-persist/integration/react';
import {useEffect} from 'react';

function App() {
  const {isAuthenticated} = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', {replace: true});
    }
  }, [isAuthenticated]);
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#467fae',
          borderRadius: 2,
          fontFamily: 'Verdana',
        },
      }}
    >
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path='/'>
            <Route path='login/:connectionName?' element={<LoginScreen />} />
            {/* <Route path='error' element={<Error />} /> */}
            {isAuthenticated ? (
              <Route path='/' element={<Layout2 />}>
                <Route path='' element={<TopicScreen />} />
              </Route>
            ) : null}
            <Route path='/' element={<Navigate replace to='login' />} />
            <Route path='*' element={<Navigate replace to='error' />} />
          </Route>
        </Routes>
      </PersistGate>
    </ConfigProvider>
  );
}

export default App;
