/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ValidateConnection } from '@wails/main/KafkaService';
import { main } from '@wails/models';

export const DefaultKafkaConfig = {
  autoOffsetReset: 'latest',
  groupId: 'kafka-trail',
  lastUsed: '',
};

interface AuthState {
  connections: { [key: string]: main.KafkaConfig };
  currentConnection?: main.KafkaConfig;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  testConnectionStatus: 'success' | 'failed' | 'idle' | 'loading';
}

const initialState: AuthState = {
  isAuthenticated: false,
  testConnectionStatus: 'idle',
  loading: false,
  error: null,
  connections: {
    local: {
      connectionName: 'local',
      bootstrapServers: 'localhost:9092',
      autoOffsetReset: 'latest',
      groupId: 'kafka-trail',
      saslMechanism: 'PLAIN',
      protocol: 'PLAINTEXT',
      lastUsed: '',
    },
  },
};

export const login = createAsyncThunk(
  'auth/login',
  async (currentConfig: main.KafkaConfig, thunkAPI) => {
    try {
      const config = {
        ...currentConfig,
        ...DefaultKafkaConfig,
        bootstrap_servers: currentConfig.bootstrapServers,
        group_id: currentConfig.groupId,
        auto_offset_reset: currentConfig.autoOffsetReset,
      };
      await ValidateConnection(config);
      return currentConfig;
    } catch (e) {
      return thunkAPI.rejectWithValue({
        message: (e as Error).message,
        isTestConnection: currentConfig.isTestConnection,
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    addConnection(state, action) {
      state.connections[action.payload.connectionName] = {
        ...action.payload,
      };
    },
    deleteConnection(state, action) {
      delete state.connections[action.payload.connectionName];
    },
    setCurrentConnection(state, action) {
      state.currentConnection = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentConnection = undefined;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      login.fulfilled,
      (state, action: PayloadAction<main.KafkaConfig>) => {
        if (
          'isTestConnection' in action.payload &&
          action.payload.isTestConnection === true
        ) {
          state.testConnectionStatus = 'success';
        } else {
          state.isAuthenticated = true;
          state.currentConnection = action.payload;
          state.testConnectionStatus = 'idle';
        }
        state.loading = false;
        state.error = null;
      }
    );
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder.addCase(login.rejected, (state, action: any) => {
      if (
        'isTestConnection' in action.payload &&
        action.payload.isTestConnection === true
      ) {
        state.testConnectionStatus = 'failed';
      } else {
        state.isAuthenticated = false;
        state.testConnectionStatus = 'idle';
      }
      state.loading = false;
      state.error = action.payload?.message || 'Failed To Connect';
    });
  },
});

export const { addConnection, deleteConnection, logout, setCurrentConnection } =
  authSlice.actions;

export default authSlice.reducer;
