import { RootState, useAppDispatch } from '@/store';
import { produceMessage } from '@/store/dataSlice';
import { Modal, Flex, Input, Button, Form } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';
import { useSelector } from 'react-redux';
import {
    CloseOutlined,
  } from '@ant-design/icons';

interface ProduceMessageModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProduceMessageModal: React.FC<ProduceMessageModalProps> = ({isModalOpen, setIsModalOpen}) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    useSelector((state: RootState) => state.config);
    const {currentTopic, loading} = useSelector(
      (state: RootState) => state.dataPanel
    );
    const {currentConnection} = useSelector((state: RootState) => state.auth);


    const handleOk = async () => {
        await form.validateFields()
        if (currentConnection){
          await dispatch(produceMessage({
            currentConnection,
            message: {...form.getFieldsValue(), topic: currentTopic},
          }))
          // await fetchData()
        }
        setIsModalOpen(false);
      };

      const handleCancel = () => {
        setIsModalOpen(false);
      };

    return (
        <Modal
            getContainer={'#content-panel'}
            title='Produer'
            open={isModalOpen}
            maskClosable={!loading}
            confirmLoading={loading}
            onOk={handleOk}
            onCancel={handleCancel}

          >
            <>
              <Form
                form={form}
                name='message-form'
                autoComplete='off'
                initialValues={{items: [{}]}}
                layout='vertical'

              >
                <Form.Item label='Key' name='key' style={{width: '100%'}}>
                  <TextArea />
                </Form.Item>

                <Form.Item label='Value' name='value' style={{width: '100%'}}
                 rules={[{required: true, message: 'value is required required'}]}
                >
                  <TextArea />
                </Form.Item>

                {/* Nest Form.List */}
                <Form.Item name='headers' label='Headers'>
                  <Form.List name={['headers']} >
                    {(subFields, subOpt) => (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          rowGap: 16,
                        }}
                      >
                        {subFields.map((subField) => (
                          <Flex
                            key={subField.key}
                            style={{
                              gap: 4,
                              height: 30,
                              marginBottom: 16,
                            }}
                          >
                            <Form.Item
                              style={{flex: 2}}
                              name={[subField.name, 'key']}
                              rules={[{required: true, message: 'header key is required required'}]}
                            >
                              <Input placeholder='key' />
                            </Form.Item>
                            <Form.Item
                              style={{flexGrow: 3, flex: 3}}
                              name={[subField.name, 'value']}
                              rules={[{required: true, message: 'header value is required required'}]}
                            >
                              <Input placeholder='value' />
                            </Form.Item>
                            <Form.Item
                              style={{
                                flexGrow: 0,
                              }}
                              name={[subField.name, 'value']}
                            >
                              <Button
                                type='primary'
                                style={{
                                  height: 30,
                                  width: 31,
                                }}
                                icon={<CloseOutlined />}
                                size={'middle'}
                                onClick={() => {
                                  subOpt.remove(subField.name);
                                }}
                              />
                            </Form.Item>
                          </Flex>
                        ))}
                        <Button

                          type='dashed'
                          onClick={() => subOpt.add()}
                          block
                        >
                          + Add Header
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </Form.Item>
              </Form>
            </>
          </Modal>
    );
};

export default ProduceMessageModal;