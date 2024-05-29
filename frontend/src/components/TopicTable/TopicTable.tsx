import React, {useEffect, useState} from 'react';
import {Table} from 'antd';
import type {TableProps} from 'antd';
import './TopicTable.css';
import {Resizable} from 'react-resizable';
import '../../../node_modules/react-resizable/css/styles.css';

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
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    sorter: (a, b) => a.timestamp - b.timestamp,
    ellipsis: true,
    width: 100,
    render: (text: any) => {
      let date = new Date(parseInt(text) * 1000);
      return <span>{date.toLocaleString()}</span>;
    },
  },
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
    ellipsis: true,
    width: 100,
    // render: (text) => <a>{text}</a>,
  },
  {
    title: 'Partition',
    dataIndex: 'partition',
    key: 'partition',
    width: 100,
    ellipsis: true,

  },
  {
    title: 'Offset',
    dataIndex: 'offset',
    key: 'offset',
    ellipsis: true,
    sorter: (a, b) => a.offset - b.offset,
    width: 100,
  },

  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    ellipsis: true,
    // width: 200,
  },

];
interface TopicDataProps {
  currentTopic: any;
  topicsMap: any;
  isLoading: boolean;
  searchTerm: any;
  onRowChange: (value: any) => any;
}

const ResizableTitle = (props: any) => {
  const {onResize, width, ...restProps} = props;
  if (width === undefined) {
    return <th {...restProps}></th>;
  }
  return (
    <Resizable width={width} height={0} onResize={onResize}>
      <th {...restProps}></th>
    </Resizable>
  );
};
export const TopicTable: React.FC<TopicDataProps> = ({
  currentTopic,
  topicsMap,
  onRowChange,
  isLoading,
  searchTerm,
}) => {
  const [resizeableColumns, setResizeableColumns] = useState(columns);

  useEffect(() => {
    setResizeableColumns(
      columns.map((col: any) => {
        col.onHeaderCell = () => ({
          width: col.width,
          onResize: handleResize(col),
        });
        return col;
      })
    );
  }, [resizeableColumns]);

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

  let components = {
    header: {
      cell: ResizableTitle,
    },
  };

  const handleResize =
    (column: any) =>
    (e: any, {size}: any) => {
      resizeableColumns.forEach((item: any) => {
        if (item === column) {
          item.width = size.width;
        }
      });

      setResizeableColumns(resizeableColumns);
    };

  return (
    <Table
      loading={isLoading}
      rowKey={'offset'}
      components={components}
      columns={resizeableColumns}
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
