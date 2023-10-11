import {
  EditOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { DropdownAction } from '@components/common';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/common/search-filter';
import { formatDate } from '@lib/date';
import { emailTemplateService } from '@services/email-template.service';
import {
  Breadcrumb,
  message, Table
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {}

class EmailTemplates extends PureComponent<IProps> {
  state = {
    searching: false,
    list: [],
    filter: {
      sortBy: 'updatedAt',
      sort: 'desc'
    } as any
  };

  componentDidMount() {
    this.search();
  }

  async handleTableChange(pagination, filters, sorter) {
    const { filter } = this.state;
    await this.setState({
      filter: {
        ...filter,
        sortBy: sorter.field || 'updatedAt',
        // eslint-disable-next-line no-nested-ternary
        sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
      }
    });
    this.search();
  }

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search() {
    const { filter } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await emailTemplateService.findAll(filter);
      await this.setState({
        searching: false,
        list: resp.data
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching } = this.state;
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: true,
        render(data, record) {
          return (
            <>
              <Link
                href={{
                  pathname: '/email-templates/update',
                  query: {
                    id: record._id
                  }
                }}
              >
                <a style={{ fontWeight: 'bold' }}>{record.name}</a>
              </Link>
              <br />
              {record.description && <small>{record.description}</small>}
            </>
          );
        }
      },
      {
        title: 'Subject',
        dataIndex: 'subject'
      },
      {
        title: 'Last updated',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: 'Actions',
        dataIndex: '_id',
        render: (id: string) => (
          <DropdownAction
            menuOptions={[
              {
                key: 'update',
                label: 'Update',
                href: {
                  pathname: '/email-templates/update',
                  query: { id }
                },
                icon: <EditOutlined />
              }
            ]}
          />
        )
      }
    ];
    return (
      <>
        <Head>
          <title>Email templates</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Email templates</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Page>
          <SearchFilter keyword onSubmit={this.handleFilter.bind(this)} />
          <Table
            dataSource={list}
            columns={columns}
            rowKey="_id"
            loading={searching}
            onChange={this.handleTableChange.bind(this)}
          />
        </Page>
      </>
    );
  }
}

export default EmailTemplates;
