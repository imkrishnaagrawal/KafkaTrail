// import {writeText} from '@tauri-apps/api/clipboard';
import { Space, Button, Tag, Affix, List } from 'antd';
import Search, { SearchProps } from 'antd/es/input/Search';
import Sider from 'antd/es/layout/Sider';
import React, { useEffect, useState } from 'react';
import { ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipboardSetText, LogError } from '@wails-runtime';
import { RootState, useAppDispatch } from '@/store';
import { fetchTopics, setCurrentTopic } from '@/store/dataSlice';

export function TopicSideMenu() {
  const { topicsMap, loading, currentTopic } = useSelector(
    (state: RootState) => state.dataPanel
  );

  const { currentConnection } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchPattern, setSearchPattern] = useState<RegExp>();
  const [topics, setTopics] = useState<string[]>([]);
  const onSearch: SearchProps['onSearch'] = (value) => {
    setSearchTerm(value);
    setSearchPattern(new RegExp(value));
  };

  useEffect(() => {
    const filteredTopic = Object.keys(topicsMap).filter(
      (v: string) => v.includes(searchTerm) || searchPattern?.test(v)
    );
    setTopics(filteredTopic);
  }, [searchTerm, searchPattern, topicsMap]);

  useEffect(() => {
    if (currentConnection) {
      dispatch(fetchTopics(currentConnection));
    } else {
      navigate('/');
    }
  }, [currentConnection, dispatch, navigate]);

  return (
    <Sider
      theme="light"
      width="100%"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        borderRight: '1px solid rgb(237, 237, 237)',
      }}
    >
      <Space
        style={{
          borderBottom: '1px solid rgb(237, 237, 237)',
          padding: '10px 20px',
        }}
      >
        <Button
          loading={loading}
          type="primary"
          style={{
            height: 30,
            backgroundColor: 'rgb(136, 99, 123)',
            width: 31,
          }}
          icon={<ReloadOutlined />}
          size="middle"
          onClick={() => {
            if (currentConnection) {
              dispatch(fetchTopics(currentConnection));
            }
          }}
        />
        <Button
          type="primary"
          style={{
            height: 30,
            backgroundColor: 'rgb(46, 62, 101)',
            width: 31,
          }}
          icon={<CopyOutlined />}
          size="middle"
          onClick={async () => {
            if (currentConnection) {
              const item = topics.join('\n');
              try {
                await ClipboardSetText(item);
              } catch (e) {
                LogError((e as Error)?.message);
              }
            }
          }}
        />
      </Space>
      <Space
        style={{
          borderBottom: '1px solid rgb(237, 237, 237)',
        }}
      >
        <Search className="search" placeholder="Search" onSearch={onSearch} />
        <Tag color="processing">topics: {topics?.length}</Tag>
      </Space>

      <Affix
        offsetTop={0}
        style={{
          marginTop: 30,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={topics}
          style={{
            maxHeight: 35,
          }}
          renderItem={(item) => (
            <List.Item
              style={{
                // background: 'white',
                padding: '10px 20px',
                cursor: 'pointer',
                overflowX: 'hidden',
                background:
                  item === currentTopic ? 'rgb(237, 237, 237)' : 'white',
              }}
              onClick={() => {
                dispatch(setCurrentTopic(item));
              }}
            >
              {item}
            </List.Item>
          )}
        />
      </Affix>
    </Sider>
  );
}
