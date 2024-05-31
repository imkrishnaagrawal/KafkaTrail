import {RootState, useAppDispatch} from '@/store';
import {
  setOffsetType,
  setMessageCount,
  setPanelShow,
  setPartition,
} from '@/store/configSlice';
import {
  fetchTopicData,
  fetchTopicMeta,
  getTopicConfig,
} from '@/store/dataSlice';
import {
  Flex,
  Tag,
  Space,
  Button,
  Select,
  InputNumber,
  theme,
  Tooltip,
} from 'antd';
import {SearchProps} from 'antd/es/input';
import Search from 'antd/es/input/Search';
import {Header} from 'antd/es/layout/layout';
import React from 'react';
import {useSelector} from 'react-redux';
import {
  CaretRightOutlined,
  InsertRowBelowOutlined,
  InsertRowAboveOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import ProduceMessageModal from './ProduceMessageModal';
import ConfigModal from './ConfigModal';
import {LogError} from '@wails-runtime';

interface DataPanelHeaderProps {
  setSearchTerm: any;
}

export const DataPanelHeader: React.FC<DataPanelHeaderProps> = ({
  setSearchTerm,
}) => {
  const {
    token: {colorBgContainer},
  } = theme.useToken();

  const {fetchSettings} = useSelector((state: RootState) => state.config);
  const {currentTopic, topicsMap, loading} = useSelector(
    (state: RootState) => state.dataPanel
  );
  const {currentConnection} = useSelector((state: RootState) => state.auth);

  const onSearch: SearchProps['onSearch'] = (value, _e, _info) => {
    setSearchTerm(value);
  };

  const [isProduceMessageModalOpen, setProduceMessageModalOpen] =
    React.useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = React.useState(false);

  const dispatch = useAppDispatch();

  const fetchData = async () => {
    try {
      if (!currentTopic || !currentConnection) {
        return;
      }
      dispatch(
        fetchTopicData({
          currentConnection,
          currentTopic,
          fetchSettings,
        })
      );
    } catch (error: any) {
      LogError('Error invoking Fetch Data function:' + error?.message);
    }
  };

  const fetchMeta = async () => {
    try {
      if (!currentTopic || !currentConnection) {
        return;
      }
      dispatch(
        fetchTopicMeta({
          currentConnection,
          currentTopic,
          fetchSettings,
        })
      );
    } catch (error: any) {
      LogError('Error invoking Fetch Data function:' + error?.message);
    }
  };

  return (
    <>
      <div
        style={{
          margin: '4px 10px',
        }}
      >
        <Flex gap='4px 0' wrap='wrap'>
          <Tag color='success'>topic: {currentTopic}</Tag>

          <Tag color='processing'>
            fetched:{' '}
            {currentTopic &&
            currentTopic in topicsMap &&
            topicsMap[currentTopic]?.messages?.length! >= 0
              ? topicsMap[currentTopic]?.messages?.length
              : 'NA'}
          </Tag>
          <Tag color='geekblue'>
            message count:{' '}
            {currentTopic &&
            currentTopic in topicsMap &&
            topicsMap[currentTopic]?.message_count! >= 0
              ? topicsMap[currentTopic]?.message_count
              : 'NA'}
          </Tag>
          <Tooltip
            placement='bottom'
            title={
              (currentTopic &&
                currentTopic in topicsMap &&
                topicsMap[currentTopic]?.partitions
                  ?.map((c: any, index: number) => `partition ${index}: ${c.toString()}\n`)
                  ?.reduce((p: any, c: any) => {
                    return p + c;
                  })) ||
              'NA'
            }
          >
            <Tag color='yellow'>
              partition count:{' '}
              {(currentTopic &&
                currentTopic in topicsMap &&
                topicsMap[currentTopic]?.partition_count) ||
                'NA'}
            </Tag>
          </Tooltip>
          <Button
            disabled={!currentTopic}
            loading={loading}
            type='default'
            style={{
              height: 21,
              // backgroundColor: 'rgb(83, 159, 115)',
              width: 21,
              padding: 10,
            }}
            icon={
              <SyncOutlined
                style={{
                  color: 'grey',
                }}
              />
            }
            size={'middle'}
            onClick={() => {
              fetchMeta();
            }}
          />
        </Flex>
      </div>
      <Header
        style={{
          background: colorBgContainer,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgb(237, 237, 237)',
        }}
      >
        <Space>
          <Button
            disabled={!currentTopic}
            loading={loading}
            type='primary'
            style={{
              height: 30,
              backgroundColor: 'rgb(83, 159, 115)',
              width: 31,
            }}
            icon={<CaretRightOutlined />}
            size={'middle'}
            onClick={() => {
              fetchData();
            }}
          />

          <Search
            className='search'
            placeholder='Search'
            onChange={(e) => {
              onSearch(e.target.value);
            }}
            onSearch={onSearch}
          />

          <Select
            value={fetchSettings?.autoOffsetReset}
            onChange={async (value: any) => {
              if (value == 'offset') {
                await fetchMeta();
              }
              dispatch(setOffsetType(value));
            }}
          >
            <Select.Option value='earliest'>Oldest</Select.Option>
            <Select.Option value='latest'>Newest</Select.Option>
            <Select.Option disabled={!currentTopic} value='offset'>
              Offset
            </Select.Option>
          </Select>
          {fetchSettings?.autoOffsetReset == 'offset' && (
            <Select
              disabled={loading}
              style={{
                width: 150,
              }}
              onChange={async (index: any) => {
                if (currentTopic) {
                  dispatch(setPartition({
                    partition: index,
                    high: topicsMap[currentTopic]?.partitions![index],
                  }));
                }
              }}
            >
              {currentTopic &&
                topicsMap[currentTopic]?.partitions?.map((p: any, index:  number) => (
                  <Select.Option value={index}>
                    Partition {index}: {p}
                  </Select.Option>
                ))}
            </Select>
          )}
          {fetchSettings?.autoOffsetReset == 'offset' && (
            <InputNumber
              // min={0}
              // defaultValue={fetchSettings?.partition?.offset}
              // max={fetchSettings?.partition?.offset}
              disabled={fetchSettings?.partition.partition === undefined}
              placeholder='offset'
              onChange={(value: any) => {
                dispatch(setPartition({
                  offset: value
                }));
              }}
            />
          )}

          <InputNumber
            min={1}
            max={2000}
            defaultValue={fetchSettings?.messageCount}
            placeholder='message count'
            onChange={async (value: any) => {
              await dispatch(setMessageCount(value));
            }}
          />
          <Button
            type='primary'
            style={{
              height: 30,
              backgroundColor: 'rgb(83, 94, 159)',
              width: 31,
            }}
            icon={
              !fetchSettings.panelShow ? (
                <InsertRowBelowOutlined />
              ) : (
                <InsertRowAboveOutlined />
              )
            }
            size={'middle'}
            onClick={() => {
              dispatch(setPanelShow(!fetchSettings.panelShow));
            }}
          />
          <Button
            disabled={!currentTopic}
            type='primary'
            style={{
              height: 30,
              backgroundColor: 'rgb(131, 64, 64)',
              width: 31,
            }}
            icon={<PlusOutlined />}
            size={'middle'}
            onClick={() => {
              setProduceMessageModalOpen(true);
            }}
          />
          <Button
            disabled={!currentTopic}
            type='primary'
            style={{
              height: 30,
              backgroundColor: 'rgb(25, 123, 131)',
              width: 31,
            }}
            icon={<SettingOutlined />}
            size={'middle'}
            onClick={() => {
              dispatch(
                getTopicConfig({
                  currentConnection,
                  topic: currentTopic,
                } as any)
              ).then(() => {
                setConfigModalOpen(true);
              });
            }}
          />
          <ProduceMessageModal
            isModalOpen={isProduceMessageModalOpen}
            setIsModalOpen={setProduceMessageModalOpen}
          />
          <ConfigModal
            isModalOpen={isConfigModalOpen}
            setIsModalOpen={setConfigModalOpen}
            initialSettings={
              currentTopic && topicsMap[currentTopic]?.config
                ? topicsMap[currentTopic].config
                : []
            }
          />
        </Space>
      </Header>
    </>
  );
};

export default DataPanelHeader;
