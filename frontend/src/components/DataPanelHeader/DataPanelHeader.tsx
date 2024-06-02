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
import { SearchProps } from 'antd/es/input';
import Search from 'antd/es/input/Search';
import { Header } from 'antd/es/layout/layout';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  CaretRightOutlined,
  InsertRowBelowOutlined,
  InsertRowAboveOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { LogError } from '@wails-runtime';
import ProduceMessageModal from './ProduceMessageModal';
import ConfigModal from './ConfigModal';
import {
  fetchTopicData,
  fetchTopicMeta,
  getTopicConfig,
} from '@/store/dataSlice';
import {
  setOffsetType,
  setMessageCount,
  setPanelShow,
  setPartition,
} from '@/store/configSlice';
import { RootState, useAppDispatch } from '@/store';

interface DataPanelHeaderProps {
  setSearchTerm: (value: string) => void;
}

export function DataPanelHeader({ setSearchTerm }: DataPanelHeaderProps) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { fetchSettings } = useSelector((state: RootState) => state.config);
  const { currentTopic, topicsMap, loading } = useSelector(
    (state: RootState) => state.dataPanel
  );
  const { currentConnection } = useSelector((state: RootState) => state.auth);

  const onSearch: SearchProps['onSearch'] = (value) => {
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
    } catch (e) {
      LogError(`Error invoking Fetch Data function:${(e as Error)?.message}`);
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
    } catch (e) {
      LogError(`Error invoking Fetch Data function:${(e as Error)?.message}`);
    }
  };

  return (
    <>
      <div
        style={{
          margin: '4px 10px',
        }}
      >
        <Flex gap="4px 0" wrap="wrap">
          <Tag color="success">topic: {currentTopic}</Tag>

          <Tag color="processing">
            fetched:{' '}
            {currentTopic &&
            currentTopic in topicsMap &&
            (topicsMap[currentTopic]?.messages?.length ?? 0)
              ? topicsMap[currentTopic]?.messages?.length
              : 'NA'}
          </Tag>
          <Tag color="geekblue">
            message count:{' '}
            {currentTopic &&
            currentTopic in topicsMap &&
            (topicsMap[currentTopic]?.messages?.length ?? 0)
              ? topicsMap[currentTopic]?.message_count
              : 'NA'}
          </Tag>
          <Tooltip
            placement="bottom"
            title={
              (currentTopic &&
                currentTopic in topicsMap &&
                topicsMap[currentTopic]?.partitions
                  ?.map((c, index) => `partition ${index}: ${c.toString()}\n`)
                  ?.reduce((p, c) => {
                    return p + c;
                  })) ||
              'NA'
            }
          >
            <Tag color="yellow">
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
            type="default"
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
            size="middle"
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
            type="primary"
            style={{
              height: 30,
              backgroundColor: 'rgb(83, 159, 115)',
              width: 31,
            }}
            icon={<CaretRightOutlined />}
            size="middle"
            onClick={() => {
              fetchData();
            }}
          />

          <Search
            className="search"
            placeholder="Search"
            onChange={(e) => {
              onSearch(e.target.value);
            }}
            onSearch={onSearch}
          />

          <Select
            value={fetchSettings?.autoOffsetReset}
            onChange={async (value) => {
              if (value === 'offset') {
                await fetchMeta();
              }
              dispatch(setOffsetType(value));
            }}
          >
            <Select.Option value="earliest">Oldest</Select.Option>
            <Select.Option value="latest">Newest</Select.Option>
            <Select.Option disabled={!currentTopic} value="offset">
              Offset
            </Select.Option>
          </Select>
          {fetchSettings?.autoOffsetReset === 'offset' && (
            <Select
              disabled={loading}
              style={{
                width: 150,
              }}
              onChange={async (index) => {
                if (currentTopic) {
                  dispatch(
                    setPartition({
                      partition: index,
                      high: topicsMap[currentTopic]?.partitions![index],
                    })
                  );
                }
              }}
            >
              {currentTopic &&
                topicsMap[currentTopic]?.partitions?.map((p, index) => (
                  <Select.Option key={p} value={index}>
                    Partition {index}: {p}
                  </Select.Option>
                ))}
            </Select>
          )}
          {fetchSettings?.autoOffsetReset === 'offset' && (
            <InputNumber
              // min={0}
              // defaultValue={fetchSettings?.partition?.offset}
              // max={fetchSettings?.partition?.offset}
              disabled={fetchSettings?.partition.partition === undefined}
              placeholder="offset"
              onChange={(value) => {
                dispatch(
                  setPartition({
                    offset: value,
                  })
                );
              }}
            />
          )}

          <InputNumber
            min={1}
            max={2000}
            defaultValue={fetchSettings?.messageCount}
            placeholder="message count"
            onChange={async (value) => {
              await dispatch(setMessageCount(value));
            }}
          />
          <Button
            type="primary"
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
            size="middle"
            onClick={() => {
              dispatch(setPanelShow(!fetchSettings.panelShow));
            }}
          />
          <Button
            disabled={!currentTopic}
            type="primary"
            style={{
              height: 30,
              backgroundColor: 'rgb(131, 64, 64)',
              width: 31,
            }}
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => {
              setProduceMessageModalOpen(true);
            }}
          />
          <Button
            disabled={!currentTopic}
            type="primary"
            style={{
              height: 30,
              backgroundColor: 'rgb(25, 123, 131)',
              width: 31,
            }}
            icon={<SettingOutlined />}
            size="middle"
            onClick={() => {
              if (currentConnection && currentTopic) {
                dispatch(
                  getTopicConfig({
                    currentConnection,
                    topic: currentTopic,
                  })
                ).then(() => {
                  setConfigModalOpen(true);
                });
              } else {
                LogError('No topic or connection selected');
              }
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
              currentTopic && topicsMap ? topicsMap[currentTopic]?.config : {}
            }
          />
        </Space>
      </Header>
    </>
  );
}

export default DataPanelHeader;
