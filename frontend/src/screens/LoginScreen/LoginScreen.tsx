import { Card, Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { ConnectionForm } from '@/components/Auth/ConnectionForm';
import ConnectionList from '@/components/Auth/ConnectionList';

export function LoginScreen() {
  const { connectionName } = useParams();

  return (
    <Layout hasSider>
      <PanelGroup autoSaveId="sidebarLayout1" direction="horizontal">
        <Panel defaultSize={25}>
          <ConnectionList />
        </Panel>
        <PanelResizeHandle />
        <Panel>
          <Layout
            style={{
              overflow: 'auto',
              overscrollBehaviorY: 'none',
            }}
          >
            <Content
              style={{
                height: '100vh',
                overflowY: 'scroll',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
            >
              <Card
                title="New Connection"
                style={{
                  display: 'flex',
                  flexDirection: 'column',

                  overflow: 'auto',
                }}
              >
                <ConnectionForm connectionName={connectionName} />
              </Card>
            </Content>
          </Layout>
        </Panel>
      </PanelGroup>
    </Layout>
  );
}
