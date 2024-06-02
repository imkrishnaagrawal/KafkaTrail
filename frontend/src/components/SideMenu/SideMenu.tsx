import { Menu, MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogoutOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { setCurrentTopic } from '@/store/dataSlice';
import { logout } from '@/store/authSlice';
import { useAppDispatch } from '@/store';

export function SideMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const startMenuItems: MenuProps['items'] = [
    {
      key: 11,
      icon: React.createElement(DatabaseOutlined),
      label: 'topics',
      onClick: () => {
        dispatch(setCurrentTopic(undefined));
        navigate('/');
      },
    },
    {
      key: 12,
      icon: React.createElement(LogoutOutlined),
      label: 'logout',
      onClick: () => {
        navigate('/');
        dispatch(logout());
      },
    },
  ];

  const endMenuItems: MenuProps['items'] = [
    {
      key: 51,
      icon: React.createElement(SettingOutlined),
      label: 'settings',
      onClick: () => {
        navigate('/');
        dispatch(logout());
      },
    },
  ];

  const [collapsed, setCollapsed] = useState(true);
  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      collapsedWidth={40}
    >
      <div
        style={{
          height: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgb(237, 237, 237)',
        }}
      >
        <Menu
          theme="light"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={startMenuItems}
          style={{
            borderRight: 'none',
          }}
        />
        <Menu
          theme="light"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={endMenuItems}
          style={{
            borderRight: 'none',
          }}
        />
      </div>
    </Sider>
  );
}
