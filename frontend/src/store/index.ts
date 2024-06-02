// store.ts
import {
  Action,
  Middleware,
  ThunkAction,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { thunk } from 'redux-thunk';
import { LogInfo } from '@wails-runtime';
import dataPanelReducer from './dataSlice';
import authReducer from './authSlice';
import configReducer from './configSlice';

const persistConfig = {
  key: 'debug-101',
  storage,
  whitelist: ['auth'],
};

const actionLogger: Middleware = () => (next) => (action) => {
  LogInfo(`redux action: ${JSON.stringify(action)}`);
  return next(action);
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
      .concat(actionLogger),
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

export const selectCurrentTopic = (state: RootState) =>
  state.dataPanel.currentTopic;
export const selectTopics = (state: RootState) => state.dataPanel.topicsMap;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
