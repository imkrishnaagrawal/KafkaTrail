import React, {useEffect, useRef, useState} from 'react';
import {Layout} from 'antd';
import {Content} from 'antd/es/layout/layout';
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels';
import {TopicTable} from '@/components/TopicTable/TopicTable';
import {useSelector} from 'react-redux';
import {RootState} from '@/store';
import DetailView from '@/components/DetailView/DetailView';
import DataPanelHeader from '@/components/DataPanelHeader/DataPanelHeader';

export const TopicScreen: React.FC = () => {
  const ref = useRef<any>(null);
  const {fetchSettings} = useSelector((state: RootState) => state.config);
  const {currentTopic, topicsMap, loading} = useSelector(
    (state: RootState) => state.dataPanel
  );

  const [selectedRecord, setselectedRecord] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (fetchSettings.panelShow && ref != null) {
      ref?.current?.expand();
    } else {
      ref?.current?.collapse();
    }
  }, [fetchSettings.panelShow]);

  useEffect(() => {
    setselectedRecord('No data is selected');
  }, [currentTopic]);

  return (
    <Layout>
      <DataPanelHeader setSearchTerm={setSearchTerm} />

      <Content style={{height: '100vh'}}>
        <div style={{height: 'calc(100vh - 64px)'}}>
          <PanelGroup direction='vertical'>
            <Panel
              maxSize={85}
              style={{
                overflow: 'scroll',
              }}
            >
              <TopicTable
                isLoading={loading}
                currentTopic={currentTopic}
                topicsMap={topicsMap}
                searchTerm={searchTerm}
                onRowChange={(record) => {
                  setselectedRecord(record);
                }}
              />
            </Panel>
            <PanelResizeHandle style={{height: 1, background: 'gray'}} />
            <Panel
              ref={ref}
              collapsible
              maxSize={75}
              collapsedSize={15}
              minSize={15}
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <DetailView data={selectedRecord} />
            </Panel>
          </PanelGroup>
        </div>
      </Content>
    </Layout>
  );
};

export default TopicScreen;
