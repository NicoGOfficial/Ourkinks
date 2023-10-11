/* eslint-disable react/require-default-props */
import { SelectCategoryDropdown } from '@components/category/select-category-dropdown';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import {
  Col, DatePicker,
  Input, Row, Select
} from 'antd';
import { debounce } from 'lodash';
import { PureComponent } from 'react';

const { RangePicker } = DatePicker;
interface IProps {
  keyword?: boolean;
  onSubmit?: Function;
  statuses?: {
    key: string;
    text?: string;
  }[];
  sourceType?: {
    key: string;
    text?: string;
  }[];
  types?: {
    key: string;
    text?: string;
  }[];
  categoryId?: string;
  categoryGroup?: string;
  searchWithCategory?: boolean;
  searchWithPerformer?: boolean;
  performerId?: string;
  searchWithGallery?: boolean;
  galleryId?: string;
  dateRange?: boolean;
}

export class SearchFilter extends PureComponent<IProps> {
  onInputChange = debounce(async (q) => {
    const { onSubmit } = this.props;
    onSubmit({ ...this.state, q });
  }, 500);

  render() {
    const { onSubmit } = this.props;
    const {
      statuses = [],
      searchWithPerformer,
      performerId,
      galleryId,
      searchWithGallery,
      dateRange,
      sourceType,
      types,
      keyword,
      categoryGroup,
      searchWithCategory,
      categoryId
    } = this.props;
    return (
      <Row gutter={24}>
        {keyword ? (
          <Col lg={6} md={8} xs={24}>
            <Input
              allowClear
              placeholder="Enter keyword"
              onChange={(evt) => this.onInputChange(evt.target.value)}
              onPressEnter={() => onSubmit(this.state)}
            />
          </Col>
        ) : null}
        {searchWithPerformer && (
          <Col lg={6} md={8} xs={24}>
            <SelectPerformerDropdown
              onSelect={(val) => this.setState({ performerId: val || '' }, () => onSubmit(this.state))}
              defaultValue={performerId || ''}
            />
          </Col>
        )}
        {searchWithGallery && (
          <Col lg={6} md={8} xs={24}>
            <SelectGalleryDropdown
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ galleryId: val || '' }, () => onSubmit(this.state))}
              defaultValue={galleryId || ''}
              disabled
            />
          </Col>
        )}
        {searchWithCategory && (
          <Col lg={6} md={8} xs={24}>
            <SelectCategoryDropdown
              group={categoryGroup || ''}
              isMultiple={false}
              style={{ width: '100%' }}
              defaultValue={categoryId || ''}
              onSelect={(val) => this.setState({ categoryId: val || '' }, () => onSubmit(this.state))}
            />
          </Col>
        )}
        {dateRange && (
          <Col lg={6} md={8} xs={24}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates: [any, any], dateStrings: [string, string]) => this.setState({ fromDate: dateStrings[0], toDate: dateStrings[1] }, () => onSubmit(this.state))}
            />
          </Col>
        )}
        {statuses && statuses.length > 0 ? (
          <Col lg={6} md={8} xs={24}>
            <Select
              onChange={(val) => {
                this.setState({ status: val }, () => onSubmit(this.state));
              }}
              style={{ width: '100%' }}
              placeholder="Select status"
              defaultValue=""
            >
              {statuses.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {types && types.length > 0 ? (
          <Col lg={6} md={8} xs={24}>
            <Select
              onChange={(val) => {
                this.setState({ type: val }, () => onSubmit(this.state));
              }}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              {types.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {sourceType && sourceType.length > 0 ? (
          <Col lg={6} md={8} xs={24}>
            <Select
              onChange={(val) => {
                this.setState({ sourceType: val }, () => onSubmit(this.state));
              }}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              {sourceType.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
      </Row>
    );
  }
}
