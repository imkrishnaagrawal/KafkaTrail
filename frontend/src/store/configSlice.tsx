// configSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DATA_FIELD, DATA_FORMAT, OFFSET} from '@/types/types';
import {main} from '@wails/models';

export interface FetchSettings {
  autoOffsetReset: OFFSET;
  offset: number;
  partition: main.PartitionSettings;
  messageCount: number;
  panelShow: boolean;
  dataFormat: DATA_FORMAT;
  dataField: DATA_FIELD;
}
interface ConfigState {
  fetchSettings: FetchSettings;
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  fetchSettings: {
    autoOffsetReset: 'latest',
    offset: -1,
    partition: {
      partition: -1,
      high: -1,
      offset: -1,
    },
    messageCount: 50,
    panelShow: true,
    dataFormat: 'JSON',
    dataField: 'value',
  },
  loading: false,
  error: null,
};

const configSlice = createSlice({
  name: 'app',
  initialState,

  reducers: {
    setOffsetType(state, action: PayloadAction<any>) {
      state.fetchSettings.autoOffsetReset = action.payload;
      if (action.payload !== 'offset') {
        state.fetchSettings.offset = -1;
        state.fetchSettings.partition = {
          partition: -1,
          high: -1,
          offset: -1,
        };
      }
    },

    setPartition(state, action: PayloadAction<any>) {
      state.fetchSettings.partition = {
        ...state.fetchSettings.partition,
        ...action.payload,
      };
    },
    setMessageCount(state, action: PayloadAction<any>) {
      state.fetchSettings.messageCount = action.payload;
    },
    setPanelShow(state, action: PayloadAction<any>) {
      state.fetchSettings.panelShow = action.payload;
    },
    setDataFormat(state, action: PayloadAction<any>) {
      state.fetchSettings.dataFormat = action.payload;
    },
    setDataField(state, action: PayloadAction<any>) {
      state.fetchSettings.dataField = action.payload;
    },
    fetchConfigStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchConfigFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setPartition,
  setOffsetType,
  fetchConfigStart,
  fetchConfigFailure,
  setMessageCount,
  setPanelShow,
  setDataFormat,
  setDataField,
} = configSlice.actions;

export default configSlice.reducer;
