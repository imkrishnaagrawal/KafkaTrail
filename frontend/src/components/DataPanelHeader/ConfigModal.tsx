import React, {useEffect, useState} from 'react';
import {Table, Modal} from 'antd';

interface ConfigModalProps {
  initialSettings: Record<string, string>;
  //   onSave: (settings: Record<string, string>) => void;
  //   onCancel: () => void;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  initialSettings,
  //   onSave,
  //   onCancel,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleSave = () => {
    // onSave(settings);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    // onCancel();
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      //   render: (text: string, record: {key: string; value: string}) => (
      //     <Input
      //       value={text}
      //       onChange={(e) => handleChange(record.key, e.target.value)}
      //     />
      //   ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      //   render: (text: string, record: {key: string; value: string}) => (
      //     <Input
      //       value={text}
      //       onChange={(e) => handleChange(record.key, e.target.value)}
      //     />
      //   ),
    },
  ];

  const dataSource = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
  }));

  return (
    <Modal
      getContainer={'#content-panel'}
      title='Config'
      open={isModalOpen}
      confirmLoading={false}
      onOk={handleSave}
      onCancel={handleCancel}
      width={600}
      style={{
        height: '80vh',
        overflow: 'hidden',
      }}
    >
      <div style={{display: 'flex', height: '60vh'}}>
        <Table
          size='small'
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{
            y: '56vh',
          }}
        />
      </div>
    </Modal>
  );
};

export default ConfigModal;
