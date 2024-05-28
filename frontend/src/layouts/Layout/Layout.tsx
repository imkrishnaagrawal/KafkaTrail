import React from 'react';
import {Layout} from 'antd';
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels';
import { Outlet } from "react-router-dom";
import './Layout.css';
import TopicSideMenu from '@/components/TopicSideMenu/TopicSideMenu';
import SideMenu from '@/components/SideMenu/SideMenu';

export const Layout2: React.FC = () => {
  return (
    <Layout hasSider>
      <PanelGroup autoSaveId='sidebarLayout2' direction='horizontal'>
        <SideMenu />
        <Panel>
          <TopicSideMenu />
        </Panel>
        <PanelResizeHandle />
        <Panel
          id='content-panel'
          className='content-panel'
          style={{
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Panel>
      </PanelGroup>
    </Layout>
  );
};
