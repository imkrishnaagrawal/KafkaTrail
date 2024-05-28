import {fetchTopics, setCurrentTopic} from '@/store/dataSlice';
// import {writeText} from '@tauri-apps/api/clipboard';
import {Space, Button, Tag, Affix, List} from 'antd';
import Search, {SearchProps} from 'antd/es/input/Search';
import Sider from 'antd/es/layout/Sider';
import React, {useEffect, useState} from 'react';
import {ReloadOutlined, CopyOutlined} from '@ant-design/icons';
import {RootState, useAppDispatch} from '@/store';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import { ClipboardSetText } from '@wails-runtime/runtime'
interface Props {
  // Add your component props here
}

const TopicSideMenu: React.FC<Props> = () => {
  const {topicsMap, loading, currentTopic} = useSelector(
    (state: RootState) => state.dataPanel
  );

  const {currentConnection} = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchPattern, setSearchPattern] = useState<RegExp>();
  const [topics, setTopics] = useState<string[]>([]);
  const onSearch: SearchProps['onSearch'] = (value, _e, _info) => {
    setSearchTerm(value);
    setSearchPattern(new RegExp(value));
  };

  useEffect(() => {
    let filteredTopic = Object.keys(topicsMap).filter(
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
  }, [currentConnection]);

  return (
    <Sider
      theme='light'
      width={'100%'}
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
        }}
      >
        <Search className='search' placeholder='Search' onSearch={onSearch} />
        <Button
          loading={loading}
          type='primary'
          style={{
            height: 30,
            backgroundColor: 'rgb(136, 99, 123)',
            width: 31,
          }}
          icon={<ReloadOutlined />}
          size={'middle'}
          onClick={() => {
            console.log('Fetch Topics', currentConnection);
            if (currentConnection) {
              dispatch(fetchTopics(currentConnection));
            }
          }}
        />
        <Button
          type='primary'
          style={{
            height: 30,
            backgroundColor: 'rgb(46, 62, 101)',
            width: 31,
          }}
          icon={<CopyOutlined />}
          size={'middle'}
          onClick={async () => {
            if (currentConnection) {
              let item = topics.join('\n')
             try {
              await ClipboardSetText(item)
             } catch (error) {
                console.log(error);

             }
            }
          }}
        />
        {/* <Flex gap='4px 0' wrap='wrap'> */}
        <Tag color='processing'>topics: {topics?.length}</Tag>
        {/* </Flex> */}
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
          itemLayout='horizontal'
          dataSource={topics}
          style={{
            maxHeight: 35,
          }}
          renderItem={(item: any) => (
            <List.Item
              style={{
                // background: 'white',
                padding: '10px 20px',
                cursor: 'pointer',
                overflowX: 'hidden',
                background:
                  item == currentTopic ? 'rgb(237, 237, 237)' : 'white',
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
};

export default TopicSideMenu;
