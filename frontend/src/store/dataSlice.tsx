/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  FetchMessages,
  FetchMeta,
  FetchTopics,
  GetTopicSettings,
  ProduceMessage,
} from '@wails/main/KafkaService';
import { main } from '@wails/models';
import { LogError } from '@wails-runtime';
import { DefaultKafkaConfig } from '@/store/authSlice';
import { FetchSettings } from '@/store/configSlice';

export interface KafkaMessage extends main.KafkaMessage {
  topic: string;
  offset: number;
  value: string;
  key: string;
  timestamp: number;
  partition: number;
}

interface TopicData {
  message_count?: number;
  partition_count?: number;
  partitions?: number[];
  messages?: KafkaMessage[];
  config: Record<string, string>;
}

export type TopicMap = { [key: string]: TopicData };
interface DataPanelState {
  currentTopic?: string;
  topicsMap: TopicMap;
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
  message: main.ProducerMessage;
}

export interface FetchTopicConfigArgs {
  topic: string;
  currentConnection: main.KafkaConfig;
}

export const getTopicConfig = createAsyncThunk(
  'app/getTopicConfig',
  async ({ topic, currentConnection }: FetchTopicConfigArgs, thunkAPI) => {
    const config = {
      ...DefaultKafkaConfig,
      ...currentConnection,
    };
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
      const [_, response] = await Promise.all([
        new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),
        GetTopicSettings(config, topic),
      ]);
      return response;
    } catch (error) {
      LogError((error as Error).message);

      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const produceMessage = createAsyncThunk(
  'app/produceMessage',
  async ({ currentConnection, message }: ProduceMessageArgs, thunkAPI) => {
    try {
      const config = {
        ...DefaultKafkaConfig,
        ...currentConnection,
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
      const [_, topics] = await Promise.all([
        new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),
        ProduceMessage(config, message),
      ]);
      return topics;
    } catch (error) {
      LogError((error as Error).message);

      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchTopics = createAsyncThunk(
  'app/fetchTopics',
  async (currentConfig: main.KafkaConfig, thunkAPI) => {
    try {
      const config = {
        ...DefaultKafkaConfig,
        ...currentConfig,
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
      const [_, topics] = await Promise.all([
        new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),
        FetchTopics(config),
      ]);
      return topics;
    } catch (error) {
      LogError((error as Error).message);

      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchTopicMeta = createAsyncThunk(
  'app/fetchTopicMeta',
  async (
    { currentTopic, currentConnection, fetchSettings }: FetchTopicDataArgs,
    thunkAPI
  ) => {
    try {
      const config = {
        ...DefaultKafkaConfig,
        ...currentConnection,
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
      const [_, response] = await Promise.all([
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),

        FetchMeta(config, currentTopic, fetchSettings.messageCount),
      ]);
      const topicMeta = {
        message_count: response.message_count,
        partition_count: response.partition_count,
        partitions: response.partitions.map((p) => p.count),
      };

      return [currentTopic, topicMeta];
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

export const fetchTopicData = createAsyncThunk(
  'app/fetchTopicData',
  async (
    { currentTopic, currentConnection, fetchSettings }: FetchTopicDataArgs,
    thunkAPI
  ) => {
    try {
      const config = {
        ...DefaultKafkaConfig,
        ...currentConnection,
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
      const [_, response] = await Promise.all([
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }),

        FetchMessages(
          config,
          currentTopic,
          fetchSettings.messageCount,
          fetchSettings.autoOffsetReset === 'latest',
          fetchSettings?.partition
        ),
      ]);
      const topicData = {
        message_count: response.metadata.message_count,
        partition_count: response.metadata.partition_count,
        partitions: response.metadata.partitions.map((p) => p.count),
        messages: response?.messages,
      };

      return [currentTopic, topicData];
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
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
    setCurrentTopic(state, action) {
      state.currentTopic = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTopics.fulfilled, (state, action) => {
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
    });
    builder.addCase(fetchTopics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopics.rejected, (state) => {
      state.loading = false;
      state.error = 'Failed To Fetch Topics';
    });
    builder.addCase(getTopicConfig.fulfilled, (state, action) => {
      const config = action.payload;
      if (state.currentTopic) {
        state.topicsMap[state.currentTopic] = {
          ...state.topicsMap[state.currentTopic],
          config,
        };
      }
      state.loading = false;
      state.error = null;
    });
    builder.addCase(getTopicConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTopicConfig.rejected, (state) => {
      state.loading = false;
      state.error = 'Failed To Fetch Configs';
    });
    builder.addCase(fetchTopicData.fulfilled, (state, action) => {
      const [topic, meta] = action.payload as [string, TopicData];
      state.topicsMap[topic] = {
        message_count: meta.message_count,
        partition_count: meta.partition_count,
        messages: meta.messages,
        partitions: meta.partitions,
        config: {},
      };
      state.loading = false;
      state.error = null;
    });
    builder.addCase(fetchTopicData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopicData.rejected, (state) => {
      state.loading = false;
      state.error = 'Failed To Fetch Data';
    });
    builder.addCase(fetchTopicMeta.fulfilled, (state, action) => {
      const [topic, meta] = action.payload as [string, TopicData];
      state.topicsMap[topic] = {
        message_count: meta.message_count,
        partition_count: meta.partition_count,
        partitions: meta.partitions,
        messages: state.topicsMap[topic]?.messages || [],
        config: {},
      };
      state.loading = false;
      state.error = null;
    });
    builder.addCase(fetchTopicMeta.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopicMeta.rejected, (state) => {
      state.loading = false;
      state.error = 'Failed To Fetch Topic Meta';
    });
    builder.addCase(produceMessage.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(produceMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(produceMessage.rejected, (state) => {
      state.loading = false;
      state.error = 'Failed To Produce Message';
    });
  },
});

export const { setCurrentTopic } = dataSlice.actions;

export default dataSlice.reducer;
