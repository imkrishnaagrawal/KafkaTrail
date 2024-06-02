// store.ts
import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import configReducer from './configSlice';
import authReducer from './authSlice';
import dataPanelReducer from './dataSlice';
import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {thunk} from 'redux-thunk';
import {LogInfo} from '@wails-runtime';

const persistConfig = {
  key: 'debug-101',
  storage,
  whitelist: ['auth'],
};

const customMiddleWare = (_store: any) => (next: any) => (action: any) => {
  LogInfo(`redux action: ${JSON.stringify(action)}`);
  next(action);
};

const rootReducer = combineReducers({
  config: configReducer,
  auth: authReducer,
  dataPanel: dataPanelReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(thunk)
      .concat(customMiddleWare),
  devTools: true,
});

export default store;

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
