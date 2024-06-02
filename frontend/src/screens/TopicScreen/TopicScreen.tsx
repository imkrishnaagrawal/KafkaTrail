import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { useSelector } from 'react-redux';
import { TopicTable } from '@/components/TopicTable/TopicTable';
import { RootState } from '@/store';
import DetailView from '@/components/DetailView/DetailView';
import DataPanelHeader from '@/components/DataPanelHeader/DataPanelHeader';
import { KafkaMessage } from '@/store/dataSlice';

export function TopicScreen() {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<ImperativePanelHandle | null>(null);
  const [height, setHeight] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecord, setSelectedRecord] = useState<KafkaMessage | string>(
    ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchSettings } = useSelector((state: RootState) => state.config);
  const { currentTopic, topicsMap, loading } = useSelector(
    (state: RootState) => state.dataPanel
  );

  useLayoutEffect(() => {
    if (tableRef.current) setHeight(tableRef.current.offsetHeight - 50);
  }, [tableRef, fetchSettings.panelShow]);

  useLayoutEffect(() => {
    if (fetchSettings.panelShow && ref != null) {
      ref?.current?.expand();
    } else {
      ref?.current?.collapse();
    }
  }, [fetchSettings.panelShow]);

  useLayoutEffect(() => {
    setSelectedRecord('No data is selected');
  }, [currentTopic]);

  return (
    <Layout>
      <DataPanelHeader setSearchTerm={setSearchTerm} />

      <Content style={{ height: '100vh' }}>
        <div style={{ height: 'calc(100vh - 64px)' }}>
          <PanelGroup direction="vertical">
            <Panel
              maxSize={85}
              onResize={() => {
                if (tableRef.current)
                  setHeight(tableRef.current.offsetHeight - 50);
              }}
              style={{
                display: 'flex',
              }}
            >
              <div
                ref={tableRef}
                style={{
                  flex: 1,
                }}
              >
                <TopicTable
                  height={height}
                  isLoading={loading}
                  currentTopic={currentTopic}
                  topicsMap={topicsMap}
                  searchTerm={searchTerm}
                  onRowChange={(record) => {
                    setSelectedRecord(record as KafkaMessage);
                  }}
                />
              </div>
            </Panel>
            <PanelResizeHandle style={{ height: 1, background: 'gray' }} />
            <Panel
              ref={ref}
              id="data-panel"
              collapsible
              maxSize={75}
              collapsedSize={15}
              minSize={15}
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {typeof selectedRecord !== 'string' && (
                <DetailView data={selectedRecord} />
              )}
            </Panel>
          </PanelGroup>
        </div>
      </Content>
    </Layout>
  );
}

export default TopicScreen;
