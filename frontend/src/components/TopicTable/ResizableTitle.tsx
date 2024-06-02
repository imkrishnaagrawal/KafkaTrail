/* eslint-disable react/jsx-props-no-spreading */
import { Resizable, ResizeCallbackData } from 'react-resizable';
import './TopicTable.css';

export function ResizableTitle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: React.HTMLAttributes<any> & {
    onResize: (
      e: React.SyntheticEvent<Element>,
      data: ResizeCallbackData
    ) => void;
    width: number;
  }
) {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          aria-label="resize"
          role="button"
          tabIndex={0}
          style={{
            userSelect: 'none',
          }}
          className="react-resizable-handle"
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
}

// const ResizableTitle = (props: any) => {
//   const {onResize, width, ...restProps} = props;
//   if (width === undefined) {
//     return <th {...restProps}></th>;
//   }
//   return (
//     <Resizable width={width} height={0} onResize={onResize}>
//       <th {...restProps}></th>
//     </Resizable>
//   );
// };
