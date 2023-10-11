import Page from '@components/common/layout/page';
import LanguageSettingTable from '@components/language/table-list';
import { getResponseError } from '@lib/utils';
import { i18nService } from '@services/i18n.service';
import {
  Button, Col, Input, message, PageHeader, Row, Select
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useEffect, useState } from 'react';

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

const { Option } = Select;
function I18nListing() {
  const [locales, setLocales] = useState([]);
  const [filter, setFilter] = useState({
    key: '', locale: '', value: ''
  });
  // const [pagination, setPagination] = useState({
  //   offset: 0,
  //   pageSize: 10,
  //   total: 0,
  //   pagination: { pageSize: 10, total: 0 },
  //   sort: { sortBy: 'createdAt', sorter: 'asc' },
  //   // showSizeChanger: false,
  //   onShowSizeChange: (current, pageSize) => {
  //     console.log('current, pageSize', current, pageSize);

  //     setPagination({
  //       ...pagination,
  //       pagination: { pageSize, total: 0 }
  //     });
  //   }
  // });

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10
    }
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const onHandleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>
    // sorter: SorterResult<DataType>,
  ) => {
    setTableParams({
      pagination,
      filters
      // ...sorter
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const search = debounce(async () => {
    try {
      setLoading(true);
      const { current, pageSize } = tableParams.pagination;
      const resp = await i18nService.search({
        offset: (current - 1) * pageSize,
        limit: pageSize,
        ...filter
      });
      setData(resp.data.data);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: resp.data.total
        }
      });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      setLoading(false);
    }
  }, 300);

  const onUpdate = async (datas: any) => {
    try {
      await i18nService.update(datas._id, datas);
      message.success('Updated successfully');
      search();
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  };

  const onDelete = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this row?')) {
        await i18nService.delete(id);
        message.success('Deleted successfully');
        search();
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  };

  const onFilter = (key: string, value: any) => {
    const newFilter = {
      ...filter,
      [key]: value
    };
    setFilter(newFilter);
  };

  // const resetOffset = () => {
  //   setPagination({
  //     ...pagination,
  //     offset: 0
  //   });
  // };

  const searchLocales = async () => {
    try {
      const resp = await i18nService.locales();
      setLocales(resp.data);
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  };

  useEffect(() => {
    searchLocales();
    search();
  }, []);

  useEffect(() => {
    search();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize]);

  const renderLocaleOption = locales.map((locale) => (
    <Option key={locale.code} value={locale.code} val={locale}>
      {locale.code}
      -
      {locale.name}
    </Option>
  ));
  return (
    <>
      <Head>
        <title>Language Setting</title>
      </Head>
      <Page>
        <PageHeader
          title="Language Setting"
          style={{ padding: 0, marginBottom: 10 }}
        />
        <Row className="ant-page-header" gutter={[10, 10]}>
          <Col sm={6} xs={24}>
            <Input
              placeholder="Key"
              value={filter.key}
              onChange={(event) => onFilter('key', event.currentTarget.value)}
            />
          </Col>
          <Col sm={6} xs={24}>
            <Select
              value={filter.locale}
              showSearch
              filterOption={(value, option) => {
                const searchStr = `${option.val?.code}-${option.val?.name}`;
                return (searchStr as string).toLowerCase().indexOf(value.toLowerCase()) > -1;
              }}
              onChange={(value) => onFilter('locale', value)}
              style={{ width: '150px' }}
            >
              <Option value="" key="all">
                ALL LOCALES
              </Option>
              {renderLocaleOption}
            </Select>
          </Col>
          <Col sm={6} xs={24}>
            <Input
              placeholder="Text"
              value={filter.value}
              onChange={(event) => onFilter('value', event.currentTarget.value)}
            />
          </Col>
          <Col sm={6}>
            <Button
              onClick={() => {
                // resetOffset();
                search();
              }}
              type="primary"
            >
              Search
            </Button>
          </Col>
        </Row>
        <LanguageSettingTable
          dataSource={data}
          rowKey="_id"
          onChange={onHandleTableChange}
          onDelete={onDelete}
          onUpdate={onUpdate}
          pagination={tableParams.pagination}
          loading={loading}
        />
      </Page>
    </>
  );
}

export default I18nListing;
