/* eslint-disable no-nested-ternary */
import { Space, Select, Radio, Table, TableProps, Tag, Button } from 'antd';
import { useSelector } from 'react-redux';
import { CopyOutlined } from '@ant-design/icons';
import { AnyObject } from 'antd/es/_util/type';
import { setDataField, setDataFormat } from '@/store/configSlice';
import { RootState, useAppDispatch } from '@/store';
import { formatter } from '@/formatters/format';
import { KafkaMessage } from '@/store/dataSlice';
import { DataField, DataFormat } from '@/types/types';

const columns: TableProps<AnyObject>['columns'] = [
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

interface DetailViewProps {
  data: KafkaMessage | undefined;
}

function RenderMessage(
  data: KafkaMessage,
  dataField: DataField,
  dataFormat: DataFormat
) {
  if (!data) return 'Row not selected to view details';
  // eslint-disable-next-line react/destructuring-assignment
  const value = data[dataField].toString();
  return dataField === 'value' || dataField === 'key' ? (
    data && formatter.format(data![dataField], dataFormat)
  ) : dataField === 'timestamp' ? (
    <>
      <div>Unix Timestamp: {value}</div>
      <div>UTC Date : {new Date(parseInt(value, 10) * 1000).toUTCString()}</div>
      <div>
        Local Date : {new Date(parseInt(value, 10) * 1000).toLocaleString()}
      </div>
    </>
  ) : (
    data && value
  );
}

export function DetailView({ data }: DetailViewProps) {
  const dispatch = useAppDispatch();
  const { dataFormat, dataField } = useSelector(
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
          <Tag color="cyan">
            {' '}
            Size:{' '}
            {data && data!.size
              ? dataField === 'key'
                ? `${data!.key_size} B`
                : `${data!.size} B`
              : 'N/A'}
          </Tag>
        </span>
        <Radio.Group
          value={dataField}
          onChange={(e) => {
            dispatch(setDataField(e.target.value));
          }}
        >
          <Radio.Button value="key">Key</Radio.Button>
          <Radio.Button value="partition">Partition</Radio.Button>
          <Radio.Button value="offset">Offset</Radio.Button>
          <Radio.Button value="value">Value</Radio.Button>
          <Radio.Button value="timestamp">Timestamp</Radio.Button>
          <Radio.Button value="headers">Headers</Radio.Button>
        </Radio.Group>
        <Space>
          <Select
            value={dataFormat}
            onChange={(value) => {
              dispatch(setDataFormat(value));
            }}
          >
            <Select.Option value="JSON">JSON</Select.Option>
            <Select.Option value="XML">XML</Select.Option>
            <Select.Option value="HEX">HEX</Select.Option>
            <Select.Option value="TEXT">TEXT</Select.Option>
          </Select>
          <Button
            type="primary"
            style={{
              height: 30,
              backgroundColor: 'rgb(118, 126, 163)',
              width: 30,
            }}
            onClick={() => {
              navigator.clipboard.writeText(String(data![dataField]));
            }}
            icon={<CopyOutlined />}
            size="middle"
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
        {dataField === 'headers' && data && data?.headers?.length > 0 ? (
          <Table
            pagination={false}
            columns={columns}
            dataSource={data?.headers || []}
            size="small"
            style={{ overflow: 'scroll', flex: 1, marginBottom: 20 }}
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
            {RenderMessage(data!, dataField, dataFormat)}
          </pre>
        )}
      </div>
    </>
  );
}

export default DetailView;
