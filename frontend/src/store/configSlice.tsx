// configSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DATA_FIELD, DATA_FORMAT, OFFSET} from '@/types/types';

export interface FetchSettings {
  autoOffsetReset: OFFSET;
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
    messageCount: 50,
    panelShow: true,
    dataFormat: 'JSON',
    dataField: 'value'
  },
  loading: false,
  error: null,
};

const configSlice = createSlice({
  name: 'app',
  initialState,

  reducers: {
    setOffset(state, action: PayloadAction<any>) {
      state.fetchSettings.autoOffsetReset = action.payload;
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
  fetchConfigStart,
  fetchConfigFailure,
  setOffset,
  setMessageCount,
  setPanelShow,
  setDataFormat,
  setDataField,
} = configSlice.actions;

export default configSlice.reducer;
