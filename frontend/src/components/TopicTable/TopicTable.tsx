import React from 'react';
import {Table} from 'antd';
import type {TableProps} from 'antd';
import './TopicTable.css';
interface DataType {
  key: string;
  partition: string;
  offset: number;
  value: string;
  timestamp: number;
  headers: string[];
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
    ellipsis: true,
    width: 100,
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Partition',
    dataIndex: 'partition',
    key: 'partition',
    width: 100,
  },
  {
    title: 'Offset',
    dataIndex: 'offset',
    key: 'offset',
    sorter: (a, b) => a.offset - b.offset,
    width: 100,
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    ellipsis: true,
    // width: 100,
  },
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    sorter: (a, b) => a.timestamp - b.timestamp,
    ellipsis: true,
    render: (text: any) => {
      let date = new Date(parseInt(text));
      return <a>{date.toLocaleString()}</a>;
    },
  },
];

// data={
//   currentTopic
//     ? topicsMap![currentTopic]?.messages?.filter((v: any) => {
//         return JSON.stringify(v).includes(searchTerm);
//       }) || []
//     : []
// }
// onRowChange={(offset: any) => {
//   if (!currentTopic || !(currentTopic in topicsMap)) {
//     return;
//   }
//   let record = topicsMap![currentTopic]?.messages?.filter(
//     (v: any) => v.offset == offset
//   )[0];
//   try {
//     let jsonObj = JSON.parse(record!['value']);
//     setselectedRecord(jsonObj);
//   } catch (error) {
//     setselectedRecord(record!['value']);
//   }
// }}

interface TopicDataProps {
  currentTopic: any;
  topicsMap: any;
  isLoading: boolean;
  searchTerm: any;
  onRowChange: (value: any) => any;
}
export const TopicTable: React.FC<TopicDataProps> = ({
  currentTopic,
  topicsMap,
  onRowChange,
  isLoading,
  searchTerm,
}) => {
  const onSelectRow = (offset: any) => {
    if (!currentTopic || !(currentTopic in topicsMap)) {
      return;
    }
    let record = topicsMap![currentTopic]?.messages?.filter(
      (v: any) => v.offset == offset
    )[0];
    try {
      let jsonObj = JSON.parse(record);
      onRowChange(jsonObj);
    } catch (error) {
      onRowChange(record);
    }
  };

  return (
    <Table
      loading={isLoading}
      rowKey={'offset'}
      onRow={(record: any, index) => ({
        tabIndex: index,
        onClick: () => {
          onSelectRow(record['offset']);
        },
        onKeyDown: (e: any) => {
          e.preventDefault();
          try {
            if (index == undefined) {
              return;
            }
            if (e.key === 'ArrowUp' && index > 0) {
              e.target.previousSibling.focus();
              onSelectRow(
                e.target.previousSibling.getAttribute('data-row-key')
              );
            }

            if (
              e.key === 'ArrowDown' &&
              index < topicsMap![currentTopic]?.messages?.length!
            ) {
              e.target.nextSibling.focus();
              onSelectRow(e.target.nextSibling.getAttribute('data-row-key'));
            }
          } catch (err) {
            // failure
          }
        },
      })}
      rowClassName={() => 'selectedRow'}
      pagination={false}
      columns={columns}
      dataSource={
        currentTopic
          ? topicsMap![currentTopic]?.messages?.filter((v: any) => {
              return JSON.stringify(v).includes(searchTerm);
            }) || []
          : []
      }
      scroll={{x: 'false'}}
      size='small'
    />
  );
};
