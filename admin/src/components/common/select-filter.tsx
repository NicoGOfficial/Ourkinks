import {
  Select
} from 'antd';

interface IITemsFilter {
  key: string;
  value: string;
  text: string;
}

interface IOptions {
  keyFilter: string;
  type?: string;
}

type IProps = {
  options: IOptions;
  itemsFilter?: IITemsFilter[];
  onSelect?: Function;
}

export function SelectFilter({ itemsFilter = undefined, onSelect = () => { }, options }: IProps) {
  return (
    <Select
      onChange={(val) => onSelect(options.keyFilter, val)}
      style={{ width: '100%' }}
      placeholder={`Select${options.keyFilter}`}
      defaultValue=""
    >
      {itemsFilter.map((s) => (
        <Select.Option key={s.key} value={s.value}>
          {s.text}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectFilter;
