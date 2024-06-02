/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { main } from '@wails/models';
import { DataField, DataFormat, Offset } from '@/types/types';

export interface FetchSettings {
  autoOffsetReset: Offset;
  offset: number;
  partition: main.PartitionSettings;
  messageCount: number;
  panelShow: boolean;
  dataFormat: DataFormat;
  dataField: DataField;
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
    setOffsetType(state, action) {
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

    setPartition(state, action) {
      state.fetchSettings.partition = {
        ...state.fetchSettings.partition,
        ...action.payload,
      };
    },
    setMessageCount(state, action) {
      state.fetchSettings.messageCount = action.payload;
    },
    setPanelShow(state, action) {
      state.fetchSettings.panelShow = action.payload;
    },
    setDataFormat(state, action) {
      state.fetchSettings.dataFormat = action.payload;
    },
    setDataField(state, action) {
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
