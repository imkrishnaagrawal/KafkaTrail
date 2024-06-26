import { Affix, List, Popconfirm, Button, theme } from 'antd';
import Sider from 'antd/es/layout/Sider';
import Avvvatars from 'avvvatars-react';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { main } from '@wails/models';
import { RootState, AppDispatch } from '@/store';
import { deleteConnection, login } from '@/store/authSlice';

function ConnectionList() {
  const { connections } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Sider
      theme="light"
      width="100%"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
      }}
    >
      <div
        style={{
          color: '#ffe4e4',
          padding: '20px 30px',
          fontSize: '20px',
          background: '#467fae',
          fontWeight: 'bolder',
          // marginBottom: '20px',
          maxHeight: '64px',
        }}
      >
        Kafka Trail{' '}
      </div>
      <div
        style={{
          justifyContent: 'center',
          display: 'flex',
          margin: '10px 0px',
        }}
      >
        <Button
          type="default"
          style={{ margin: '10px 10px 10px 10px' }}
          onClick={() => {
            navigate(`/login`);
          }}
        >
          New Connection
        </Button>
      </div>
      <Affix
        offsetTop={0}
        style={{
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={Object.values(connections)}
          style={{
            background: colorBgContainer,
          }}
          renderItem={(item: main.KafkaConfig) => (
            <List.Item
              style={{
                border: '1px solid rgb(237, 237, 237)',
                borderLeftWidth: 0,
                borderRightWidth: 0,
              }}
              actions={[
                <Popconfirm
                  key={item?.connectionName}
                  title="Delete the task"
                  description="Are you sure to delete this task?"
                  placement="bottomRight"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    dispatch(deleteConnection(item));
                  }}
                >
                  <Button danger icon={<DeleteOutlined />} size="middle" />
                </Popconfirm>,
                <Button
                  key={item?.connectionName}
                  type="default"
                  icon={<EditOutlined />}
                  size="middle"
                  onClick={() => {
                    navigate(`/login/${item?.connectionName}`);
                  }}
                />,
              ]}
            >
              <List.Item.Meta
                style={{
                  padding: '5px 10px',
                }}
                avatar={<Avvvatars value={item.connectionName || 'I'} />}
                title={
                  <div
                    tabIndex={0}
                    role="button"
                    style={{
                      cursor: 'pointer',
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        dispatch(login(item));
                      }
                    }}
                    onClick={() => {
                      dispatch(login(item));
                    }}
                  >
                    {item?.connectionName}
                  </div>
                }
                description={item?.lastUsed}
              />
            </List.Item>
          )}
        />
      </Affix>
    </Sider>
  );
}

export default ConnectionList;
