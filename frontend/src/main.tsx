import ReactDOM from 'react-dom/client';
import App from '@/App';
import './styles.css';
import {Provider} from 'react-redux';
import store from '@/store';
import {BrowserRouter} from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
