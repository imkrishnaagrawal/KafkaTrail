import {formatter} from '@/formatters/format';
import {RootState, useAppDispatch} from '@/store';
import {setDataField, setDataFormat} from '@/store/configSlice';
import {Space, Select, Radio, Table, TableProps, Tag, Button} from 'antd';
import React from 'react';
import {useSelector} from 'react-redux';
import {CopyOutlined} from '@ant-design/icons';

interface Props {
  data: any;
}

const columns: TableProps<any>['columns'] = [
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
    ellipsis: true,
    width: 100,
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    width: 100,
  },
];
export const DetailView: React.FC<Props> = ({data}) => {
  const dispatch = useAppDispatch();
  const {dataFormat, dataField} = useSelector(
    (state: RootState) => state.config.fetchSettings
  );

  return (
    <>
      <div
        style={{
          // background: 'yellow',
          padding: 10,
          // height: '45px',
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgb(222, 222, 222)',
        }}
      >
        <span
          style={{
            alignContent: 'center',
          }}
        >
          <Tag color='cyan'>
            {' '}
            Size: {data && data!['size'] ? data!['size'] + ' B' : 'N/A'}
          </Tag>
        </span>
        <Radio.Group
          value={dataField}
          onChange={(e) => {
            dispatch(setDataField(e.target.value));
          }}
        >
          <Radio.Button value='key'>Key</Radio.Button>
          <Radio.Button value='partition'>Partition</Radio.Button>
          <Radio.Button value='offset'>Offset</Radio.Button>
          <Radio.Button value='value'>Value</Radio.Button>
          <Radio.Button value='timestamp'>Timestamp</Radio.Button>
          <Radio.Button value='headers'>Headers</Radio.Button>
        </Radio.Group>
        <Space>
          <Select
            value={dataFormat}
            onChange={(value: any) => {
              dispatch(setDataFormat(value));
            }}
          >
            <Select.Option value='JSON'>JSON</Select.Option>
            <Select.Option value='XML'>XML</Select.Option>
            <Select.Option value='HEX'>HEX</Select.Option>
            <Select.Option value='TEXT'>TEXT</Select.Option>
          </Select>
          <Button
            type='primary'
            style={{
              height: 30,
              backgroundColor: 'rgb(118, 126, 163)',
              width: 30,
            }}
            onClick={() => {
              navigator.clipboard.writeText(data![dataField]);
            }}
            icon={<CopyOutlined />}
            size={'middle'}
          />
        </Space>
      </div>
      <div
        style={{
          // background: 'grey',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: 15,
          flex: 1,
        }}
      >
        {dataField == 'headers' && data?.headers?.length > 0 ? (
          <Table
            pagination={false}
            columns={columns}
            dataSource={data?.headers || []}
            size='small'
            scroll={{x: 'false'}}
            style={{overflow: 'scroll', flex: 1, marginBottom: 20}}
          />
        ) : (
          <pre
            style={{
              overflowY: 'scroll',
              whiteSpace: 'pre-wrap',
              flex: 1,
              padding: 10,
            }}
          >
            {dataField == 'value' || dataField == 'key'
              ? data && formatter.format(data![dataField], dataFormat)
              : data && data[dataField]}
          </pre>
        )}
      </div>
    </>
  );
};

export default DetailView;
