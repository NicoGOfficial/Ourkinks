import { performerService } from '@services/performer.service';
import { Avatar, message, Select } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';

interface IProps {
  onSelect: Function;
  defaultValue?: string;
  disabled?: boolean;
  noEmpty?: boolean;
}

export function SelectPerformerDropdown({
  onSelect,
  defaultValue = null,
  disabled = false,
  noEmpty = false
}: IProps) {
  const [performers, setPerformers] = useState([]);
  const selectRef = useRef(null);

  const searchPerformers = debounce(async (q = '') => {
    try {
      const resp = await performerService.search({ q, limit: 200 });
      const { data } = resp.data;

      // check if have defaultValue and put this model to the list if have
      if (defaultValue) {
        const found = data.find((p) => p._id === defaultValue);
        if (!found) {
          const performer = await performerService.findById(defaultValue);
          if (performer.data) data.push(performer.data);
        }
      }

      setPerformers(data);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
    }
  }, 500);

  const onFocus = () => {
    searchPerformers();
  };

  useEffect(() => {
    searchPerformers();
  }, []);

  return (
    <Select
      ref={selectRef}
      showSearch
      defaultValue={defaultValue}
      placeholder="Filter by Model"
      style={{ width: '100%' }}
      onSearch={searchPerformers}
      onChange={(val) => {
        if (noEmpty && !val) message.info('Model is require for this action, please select one!');
        onSelect(val);
        selectRef.current?.blur();
      }}
      optionFilterProp="children"
      disabled={disabled}
      onFocus={onFocus}
    >
      <Select.Option value="" key="default">
        All models
      </Select.Option>
      {performers.map((u) => (
        <Select.Option value={u._id} key={u._id}>
          <Avatar
            src={u?.avatar || '/no-avatar.png'}
            alt="avt"
          />
          {' '}
          {`${u?.username || u?.name || 'no_name'}`}
        </Select.Option>
      ))}
    </Select>
  );
}
