import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Radio, Select, Space, Spin, message } from 'antd';
import { HddOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { KafkaProtocol } from '@/types/types';
import { addConnection, login } from '@/store/authSlice';

const { Option } = Select;

interface ConnectionFormProps {
  // eslint-disable-next-line react/require-default-props
  connectionName?: string;
}

export function ConnectionForm(
  { connectionName }: ConnectionFormProps = { connectionName: undefined }
) {
  const [protocol, setProtocol] = useState<string>('PLAINTEXT');
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const { loading, testConnectionStatus, connections } = useSelector(
    (state: RootState) => state.auth
  );
  const [messageApi, contextHolder] = message.useMessage();
  const tailLayout = {
    wrapperCol: { offset: 0, span: 16 },
  };

  useEffect(() => {
    if (connectionName && connections) {
      form.setFieldsValue({ ...connections[connectionName] });
      setProtocol(connections[connectionName].protocol);
    } else {
      form.resetFields();
      setProtocol('PLAINTEXT');
    }
  }, [connectionName, connections, form]);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (testConnectionStatus === 'failed') {
      messageApi.error('Connection Failed');
    } else if (testConnectionStatus === 'success') {
      messageApi.success('Connection Successful');
    }
  }, [loading, messageApi, testConnectionStatus]);

  const onFinish = (values: unknown) => {
    dispatch(addConnection(values));
  };

  const onTest = () => {
    const formValues = form.getFieldsValue();
    form.validateFields();
    dispatch(
      login({
        ...formValues,
        isTestConnection: true,
      })
    );
  };

  const handleMechanismChange = (value: KafkaProtocol) => {
    setProtocol(value);
  };

  return (
    <>
      {contextHolder}
      <Spin fullscreen spinning={loading} />
      <Form name="kafka_auth" onFinish={onFinish} size="large" form={form}>
        <Form.Item
          name="connectionName"
          rules={[{ required: true, message: 'Connection Name is required' }]}
        >
          <Input
            disabled={connectionName !== undefined}
            prefix={<UserOutlined />}
            placeholder="Connection Name"
          />
        </Form.Item>
        <Form.Item
          name="bootstrapServers"
          rules={[
            { required: true, message: 'Bootstrap Servers are required' },
          ]}
        >
          <Input prefix={<HddOutlined />} placeholder="Bootstrap Servers" />
        </Form.Item>
        <Form.Item name="protocol" initialValue="PLAINTEXT">
          <Radio.Group onChange={(e) => handleMechanismChange(e.target.value)}>
            <Radio.Button
              style={{
                borderStartStartRadius: 4,
                borderEndStartRadius: 4,
              }}
              value="PLAINTEXT"
            >
              Plain Text
            </Radio.Button>
            <Radio.Button disabled value="SSL">
              SSL
            </Radio.Button>
            <Radio.Button disabled value="SASL_PLAINTEXT">
              SASL Plain Text
            </Radio.Button>
            <Radio.Button
              style={{
                borderEndEndRadius: 4,
                borderStartEndRadius: 4,
              }}
              value="SASL_SSL"
            >
              SASL SSL
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        {protocol === 'SASL_SSL' && (
          <>
            <Form.Item
              name="saslUsername"
              rules={[
                {
                  required: protocol === 'SASL_SSL',
                  message: 'SASL Username is required',
                },
              ]}
            >
              <Input prefix={<KeyOutlined />} placeholder="Sasl Username" />
            </Form.Item>
            <Form.Item
              name="saslPassword"
              rules={[
                {
                  required: protocol === 'SASL_SSL',
                  message: 'SASL Password is required',
                },
              ]}
            >
              <Input prefix={<KeyOutlined />} placeholder="Sasl Password" />
            </Form.Item>
            <Form.Item
              name="saslMechanism"
              rules={[
                {
                  required: protocol === 'SASL_SSL',
                  message: 'Authentication Mechanism is required',
                },
              ]}
            >
              <Select
                placeholder="Select Authentication Protocol"
                value="PLAIN"
              >
                <Option value="PLAIN">PLAIN</Option>
                <Option value="GSSAPI">GSSAPI</Option>
                <Option value="SCRAM-SHA-256">SCRAM-SHA-256</Option>
                <Option value="SCRAM-SHA-512">SCRAM-SHA-512</Option>
                <Option value="OAUTHBEARER">OAUTHBEARER</Option>
                <Option value="AWS-MSK-IAM">AWS MSK IAM</Option>
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item wrapperCol={tailLayout.wrapperCol}>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Connection
            </Button>
            <Button
              loading={loading}
              type="default"
              htmlType="button"
              onClick={onTest}
            >
              Test Connection
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
}
