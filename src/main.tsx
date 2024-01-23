import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import { SocketProvider } from './context/SocketContext.tsx';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log(
          'Service Worker registered with scope:',
          registration.scope
        );
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Provider store={store}>
      <SocketProvider>
        <Router>
          <App />
        </Router>
      </SocketProvider>
    </Provider>
  </>
);
