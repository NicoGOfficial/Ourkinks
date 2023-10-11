import { ArrowDownOutlined, ArrowUpOutlined, FilterOutlined } from '@ant-design/icons';
import { IBody, ICountry } from '@interfaces/index';
import {
  Button, Input, Select
} from 'antd';
import { omit } from 'lodash';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';

type IProps = {
  onSubmit: Function;
  countries: ICountry[];
  bodyInfo: IBody;
  i18n: any;
}

class PerformerAdvancedFilter extends PureComponent<IProps> {
  state = {
    q: '',
    showMore: false
  };

  handleSubmit() {
    const { onSubmit } = this.props;
    onSubmit(omit(this.state, ['showMore']));
  }

  render() {
    const { countries, bodyInfo } = this.props;
    const { t } = this.props.i18n;
    const {
      heights = [], weights = [], bodyTypes = [], genders = [], sexualOrientations = [], ethnicities = [],
      ages = [], hairs = [], pubicHairs = [], eyes = [], butts = []
    } = bodyInfo;
    const { showMore } = this.state;
    return (
      <div style={{ width: '100%' }}>
        <div className="filter-block">
          <div className="filter-item custom">
            <Input
              style={{ width: '100%' }}
              placeholder={t('common:enterKeyword')}
              onChange={(evt) => this.setState({ q: evt.target.value })}
              onPressEnter={this.handleSubmit.bind(this)}
            />
          </div>
          <div className="filter-item">
            <Select style={{ width: '100%' }} defaultValue="" onChange={(val) => this.setState({ sortBy: val }, () => this.handleSubmit())}>
              <Select.Option value="" disabled>
                <FilterOutlined />
                {' '}
                {t('common:sortBy')}
              </Select.Option>
              <Select.Option value="popular">
                {t('common:popular')}
              </Select.Option>
              <Select.Option label="" value="latest">
                {t('common:latest')}
              </Select.Option>
              <Select.Option value="oldest">
                {t('common:oldest')}
              </Select.Option>
            </Select>
          </div>
          <div className="filter-item">
            <Button
              type="primary"
              className="primary"
              style={{ width: '100%' }}
              onClick={() => this.setState({ showMore: !showMore })}
            >
              {t('common:advancedSearch')}
              {' '}
              {showMore ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            </Button>
          </div>
        </div>
        <div className={!showMore ? 'filter-block hide' : 'filter-block'}>
          {countries && countries.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ country: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:countries')}
              defaultValue=""
              showSearch
              optionFilterProp="label"
            >
              <Select.Option key="All" label="" value="">
                {t('common:allCountries')}
              </Select.Option>
              {countries.map((c) => (
                <Select.Option key={c.code} label={c.name} value={c.code}>
                  <img alt="flag" src={c.flag} width="25px" />
                  &nbsp;
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ gender: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:gender')}
              defaultValue=""
            >
              {' '}
              <Select.Option key="all" value="">
                {t('common:allGender')}
              </Select.Option>
              {genders.map((gen) => (
                <Select.Option key={gen.value} value={gen.value}>
                  {gen.text || gen.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ sexualPreference: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allSexual')}
              </Select.Option>
              {sexualOrientations.map((gen) => (
                <Select.Option key={gen.value} value={gen.value}>
                  {gen.text || gen.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ age: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:age')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allAge')}
              </Select.Option>
              {ages.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text || i.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ eyes: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:eyesColor')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allEyeColor')}
              </Select.Option>
              {eyes.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text || i.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ hair: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:hairColor')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allHair')}
              </Select.Option>
              {hairs.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text || i.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ pubicHair: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:pubicHair')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allPubicHair')}
              </Select.Option>
              {pubicHairs.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text || i.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ bust: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:butt')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allButtSize')}
              </Select.Option>
              {butts.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text || i.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          {heights.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ height: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:height')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allHeight')}
              </Select.Option>
              {heights.map((i) => (
                <Select.Option key={i.text} value={i.text}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {weights.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ weight: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:weight')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allWeight')}
              </Select.Option>
              {weights.map((i) => (
                <Select.Option key={i.text} value={i.text}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ ethnicity: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:selectEthnicity')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allEthnicity')}
              </Select.Option>
              {ethnicities.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text || i.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          {bodyTypes.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ bodyType: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder={t('common:selectBody')}
              defaultValue=""
            >
              <Select.Option key="all" value="">
                {t('common:allBody')}
              </Select.Option>
              {bodyTypes.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text || i.value}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation(PerformerAdvancedFilter);
