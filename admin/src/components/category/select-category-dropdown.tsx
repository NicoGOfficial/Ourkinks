import { categoryService } from '@services/index';
import { message, Select } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  style?: Record<string, string>;
  onSelect: Function;
  defaultValue?: string | string[];
  disabled?: boolean;
  isMultiple?: boolean;
  group?: string;
  noEmtpy?: boolean;
}

export class SelectCategoryDropdown extends PureComponent<IProps> {
  state = {
    loading: false,
    data: [] as any,
    firstLoadDone: false
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: undefined,
    defaultValue: undefined,
    disabled: false,
    isMultiple: false,
    group: null,
    noEmtpy: false
  };

  componentDidMount() {
    const { group = '' } = this.props;
    this.loadCategories(group);
  }

  loadCategories = async (group) => {
    try {
      await this.setState({ loading: true });
      const resp = await (await categoryService.search({
        group, limit: 500, status: 'active'
      })).data;
      this.setState({
        firstLoadDone: true,
        data: resp.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error on load categories');
      this.setState({ loading: false, firstLoadDone: true });
    }
  };

  render() {
    const {
      style, onSelect, defaultValue, disabled, isMultiple, noEmtpy
    } = this.props;
    const { data, loading, firstLoadDone } = this.state;
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {firstLoadDone && (
          <Select
            mode={isMultiple ? 'multiple' : null}
            showSearch
            defaultValue={defaultValue}
            placeholder={`Select ${isMultiple ? 'categories' : 'category'} here`}
            style={style}
            onChange={(val) => onSelect(val)}
            loading={loading}
            optionFilterProp="children"
            disabled={disabled}
          >
            {!noEmtpy && (
              <Select.Option value="" key="all" style={{ textTransform: 'capitalize' }}>
                All categories
              </Select.Option>
            )}
            {data && data.length > 0 && data.map((u) => (
              <Select.Option value={u._id} key={u._id} style={{ textTransform: 'capitalize' }}>
                {`${u?.name || u?.slug || 'N/A'}`}
              </Select.Option>
            ))}
          </Select>
        )}
      </>
    );
  }
}
