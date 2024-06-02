import { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import './TopicTable.css';
// import 'react-resizable/css/styles.css';
import { ResizeCallbackData } from 'react-resizable';
import { ResizableTitle } from './ResizableTitle';
import { KafkaMessage, TopicMap } from '@/store/dataSlice';

const initialColumns: TableProps<KafkaMessage>['columns'] = [
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    sorter: (a, b) => a.timestamp - b.timestamp,
    ellipsis: {
      showTitle: false,
    },
    width: 200,
    render: (text) => {
      const date = new Date(parseInt(text, 10) * 1000);
      return <span>{date.toLocaleString()}</span>;
    },
  },
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
    ellipsis: {
      showTitle: false,
    },
    width: 100,
    // render: (text) => <a>{text}</a>,
  },
  {
    title: 'Partition',
    dataIndex: 'partition',
    key: 'partition',
    width: 100,
    ellipsis: {
      showTitle: false,
    },
  },
  {
    title: 'Offset',
    dataIndex: 'offset',
    key: 'offset',
    ellipsis: {
      showTitle: false,
    },
    sorter: (a, b) => a.offset - b.offset,
    width: 100,
  },

  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    ellipsis: {
      showTitle: false,
    },
    // width: 200,
  },
];

interface TopicDataProps {
  currentTopic: string | undefined;
  topicsMap: TopicMap;
  isLoading: boolean;
  searchTerm: string;
  height: number;
  onRowChange: (value: unknown) => void;
}

export function TopicTable({
  currentTopic,
  topicsMap,
  onRowChange,
  isLoading,
  searchTerm,
  height,
}: TopicDataProps) {
  const [columns, setColumns] = useState<TableColumnsType<KafkaMessage>>(
    initialColumns ?? []
  );

  const [messages, setMessages] = useState<KafkaMessage[]>([]);

  useEffect(() => {
    if (!currentTopic || !(currentTopic in topicsMap)) {
      return;
    }
    if (searchTerm) {
      setMessages(
        topicsMap[currentTopic].messages?.filter((v) => {
          return JSON.stringify(v).includes(searchTerm);
        }) ?? []
      );
    } else {
      setMessages(topicsMap[currentTopic].messages ?? []);
    }
  }, [topicsMap, currentTopic, searchTerm]);

  const onSelectRow = (offset: number) => {
    if (!messages) {
      return;
    }
    const record = messages?.filter((v) => v.offset === offset)[0];

    try {
      if (!record) {
        throw new Error('Record not found');
      }
      const jsonObj = JSON.parse(JSON.stringify(record));
      onRowChange(jsonObj);
    } catch (error) {
      onRowChange(record);
    }
  };

  const components = {
    header: {
      cell: ResizableTitle,
    },
  };

  const handleResize =
    (index: number) =>
    (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
      const newColumns = [...columns];
      newColumns[index] = {
        ...newColumns[index],
        width: size.width,
      };
      setColumns(newColumns);
    };

  const mergedColumns = columns.map<TableColumnsType<KafkaMessage>[number]>(
    (col, index) => ({
      ...col,
      onHeaderCell: (column: TableColumnsType<KafkaMessage>[number]) => ({
        width: column.width,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onResize: handleResize(index) as React.ReactEventHandler<any>,
      }),
    })
  );

  return (
    <Table
      virtual
      loading={isLoading}
      rowKey="offset"
      components={components}
      columns={mergedColumns}
      onRow={(record, index) => ({
        tabIndex: index,
        onClick: () => {
          onSelectRow(record.offset);
        },
        onKeyDown: (e) => {
          e.preventDefault();

          try {
            if (index === undefined) {
              return;
            }
            if (e.key === 'ArrowUp' && index > 0) {
              e.currentTarget.previousSibling.focus();

              onSelectRow(
                parseInt(
                  e.currentTarget.previousSibling.getAttribute('data-row-key'),
                  10
                )
              );
            }
            if (
              e.key === 'ArrowDown' &&
              currentTopic &&
              index < (messages?.length ?? 0)
            ) {
              e.currentTarget.nextSibling.focus();
              onSelectRow(
                parseInt(
                  e.currentTarget.nextSibling.getAttribute('data-row-key'),
                  10
                )
              );
            }
          } catch (err) {
            // failure
          }
        },
      })}
      rowClassName={() => 'selectedRow'}
      pagination={false}
      dataSource={messages}
      scroll={{ y: height }}
      size="small"
    />
  );
}
