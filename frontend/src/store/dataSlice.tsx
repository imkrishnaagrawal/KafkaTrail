import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DefaultKafkaConfig} from '@/store/authSlice';
import {FetchSettings} from '@/store/configSlice';
import {RootState} from '.';
import { FetchMessages,FetchMeta, FetchTopics, GetTopicSettings, ProduceMessage} from '@wails/main/KafkaService';
import {main} from '@wails/models';

export interface KafkaMessage {
  topic: string;
  offset: number;
  value: string;
  key: string;
  timestamp: string;
  partition: number;
}

export interface ProduceMessage {
  topic: string;
  value: string;
  key: string;
  headers: [string, string][];
}


interface TopicData {
  message_count?: number;
  partition_count?: number;
  partitions?: number[]
  messages?: KafkaMessage[];
  config: any;
}

interface DataPanelState {
  currentTopic?: string;
  topicsMap: {[key: string]: TopicData};
  loading: boolean;
  error: string | null;
}

export interface FetchTopicDataArgs {
  currentTopic: string;
  currentConnection: main.KafkaConfig;
  fetchSettings: FetchSettings;
}

export interface ProduceMessageArgs {
  currentConnection: main.KafkaConfig;
  message: ProduceMessage;
}

export interface FetchTopicConfigArgs {
  topic: string;
  currentConnection: main.KafkaConfig;
}

export const getTopicConfig = createAsyncThunk(
  'app/getTopicConfig',
  async ({topic, currentConnection}: FetchTopicConfigArgs, thunkAPI) => {
    let config = {
      ...DefaultKafkaConfig,
      ...currentConnection,
    };
    try {

      const [_, response] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1000)),
        GetTopicSettings(config, topic)
      ]);
      return response;
    } catch (error: any) {
      console.log('Error', error.message);

      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const produceMessage = createAsyncThunk(
  'app/produceMessage',
  async ({currentConnection, message}: ProduceMessageArgs, thunkAPI) => {
    try {
      let config = {
        ...DefaultKafkaConfig,
        ...currentConnection,
      };

      const [_, topics] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1000)),
        ProduceMessage(config, main.ProducerMessage.createFrom(message)),
      ]);
      return topics;
    } catch (error: any) {
      console.log('Error', error.message);

      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchTopics = createAsyncThunk(
  'app/fetchTopics',
  async (currentConfig: main.KafkaConfig, thunkAPI) => {
    try {
      let config = {
        ...DefaultKafkaConfig,
        ...currentConfig,
      };


      const [_, topics] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1000)),
        FetchTopics(config),
      ]);
      return topics;
    } catch (error: any) {
      console.log('Error', error.message);

      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchTopicMeta = createAsyncThunk(
  'app/fetchTopicMeta',
  async (
    {currentTopic, currentConnection, fetchSettings}: FetchTopicDataArgs,
    thunkAPI
  ) => {
    try {
      console.log('Fetch data', currentConnection);

      let config = {
        ...DefaultKafkaConfig,
        ...currentConnection,
      };
      console.log('Fetch Data');

      const [_, response] = await Promise.all([
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),

        FetchMeta(config, currentTopic, 0, fetchSettings.messageCount),
      ]);
      let topicMeta = {
        message_count: response.message_count,
        partition_count: response.partition_count,
        partitions: response.partitions.map((p) => p.count),
      };

      return [currentTopic, topicMeta];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const fetchTopicData = createAsyncThunk(
  'app/fetchTopicData',
  async (
    {currentTopic, currentConnection, fetchSettings}: FetchTopicDataArgs,
    thunkAPI
  ) => {
    try {
      console.log('Fetch data', currentConnection);

      let config = {
        ...DefaultKafkaConfig,
        ...currentConnection,
      };
      console.log('Fetch Data');

      const [_, response] = await Promise.all([
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),

        FetchMessages(config, currentTopic, 0, fetchSettings.messageCount, fetchSettings.autoOffsetReset == 'latest'),
      ]);
      let topicData = {
        message_count: response.metadata.message_count,
        partition_count: response.metadata.partition_count,
        partitions: response.metadata.partitions.map((p) => p.count),
        messages: response?.messages,
      };

      return [currentTopic, topicData];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState: DataPanelState = {
  topicsMap: {},
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setCurrentTopic(state, action: PayloadAction<any>) {
      state.currentTopic = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTopics.fulfilled, (state, action: any) => {
      state.error = null;
      state.topicsMap = {};
      action.payload
        .filter((v: string) => !v.startsWith('_'))
        .forEach((t: string) => {
          state.topicsMap[t] = {
            config: {},
          };
        });
      state.loading = false;
    }),
      builder.addCase(fetchTopics.pending, (state, _action: any) => {
        state.loading = true;
        state.error = null;
      }),
      builder.addCase(fetchTopics.rejected, (state, _action: any) => {
        state.loading = false;
        state.error = 'Failed To Fetch Topics';
      }),
      builder.addCase(getTopicConfig.fulfilled, (state, action: any) => {
        let config = action.payload;
        if (state.currentTopic) {
          state.topicsMap[state.currentTopic] = {
            ...state.topicsMap[state.currentTopic],
            config: config,
          };
        }
        state.loading = false;
        state.error = null;
      }),
      builder.addCase(getTopicConfig.pending, (state, _action: any) => {
        state.loading = true;
        state.error = null;
      }),
      builder.addCase(getTopicConfig.rejected, (state, _action: any) => {
        state.loading = false;
        state.error = 'Failed To Fetch Configs';
      }),
      builder.addCase(fetchTopicData.fulfilled, (state, action: any) => {
        const [topic, meta] = action.payload as [string, any];
        state.topicsMap[topic] = {
          message_count: meta.message_count,
          partition_count: meta.partition_count,
          messages: meta.messages,
          partitions: meta.partitions,
          config: {}
        };
        state.loading = false;
        state.error = null;
      }),
      builder.addCase(fetchTopicData.pending, (state, _action: any) => {
        state.loading = true;
        state.error = null;
      }),
      builder.addCase(fetchTopicData.rejected, (state, _action: any) => {
        state.loading = false;
        state.error = 'Failed To Fetch Data';
      }),
      builder.addCase(fetchTopicMeta.fulfilled, (state, action: any) => {
        const [topic, meta] = action.payload as [string, any];
        state.topicsMap[topic] = {
          message_count: meta.message_count,
          partition_count: meta.partition_count,
          partitions  : meta.partitions,
          config: {}
        };
        state.loading = false;
        state.error = null;
      }),
      builder.addCase(fetchTopicMeta.pending, (state, _action: any) => {
        state.loading = true;
        state.error = null;
      }),
      builder.addCase(fetchTopicMeta.rejected, (state, _action: any) => {
        state.loading = false;
        state.error = 'Failed To Fetch Topic Meta';
      }),
      builder.addCase(produceMessage.fulfilled, (state, _action: any) => {
        state.loading = false;
        state.error = null;
      }),
      builder.addCase(produceMessage.pending, (state, _action: any) => {
        state.loading = true;
        state.error = null;
      }),
      builder.addCase(produceMessage.rejected, (state, _action: any) => {
        state.loading = false;
        state.error = 'Failed To Produce Message';
      });
  },
});

export const {setCurrentTopic} = dataSlice.actions;
export const selectCurrentTopic = (state: RootState) =>
  state.dataPanel.currentTopic;
export const selectTopics = (state: RootState) => state.dataPanel.topicsMap;
export default dataSlice.reducer;
