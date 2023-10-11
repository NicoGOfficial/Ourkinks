/* eslint-disable no-nested-ternary */
import {
  CameraOutlined, EditOutlined, FileImageOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import { BreadcrumbComponent, DropdownAction } from '@components/common';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/performer/search-filter';
import { formatDate } from '@lib/date';
import { performerService } from '@services/performer.service';
import {
  Avatar,
  message, Table, Tag
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';

interface IProps {
  status: string;
}
class Performers extends PureComponent<IProps> {
  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [],
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc'
  };

  async componentDidMount() {
    const { status } = this.props;
    if (status) {
      await this.setState({ filter: { status } });
    }
    this.search();
  }

  async handleTableChange(pagination, filters, sorter) {
    const pager = { ...pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  }

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    const {
      limit, sort, filter, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });

      const resp = await performerService.search({
        limit,
        offset: (page - 1) * limit,
        ...filter,
        sort,
        sortBy
      });
      this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const columns = [
      {
        title: '#',
        dataIndex: 'avatar',
        render(avatar) {
          return <Avatar src={avatar || '/no-avatar.png'} />;
        }
      },
      {
        title: 'Display name',
        dataIndex: 'name'
      },
      {
        title: 'Username',
        dataIndex: 'username'
      },
      {
        title: 'Email address',
        dataIndex: 'email'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status) {
          switch (status) {
            case 'active':
              return <Tag color="green">Active</Tag>;
            case 'inactive':
              return <Tag color="red">Inactive</Tag>;
            case 'pending-email-confirmation':
              return <Tag color="default">Pending</Tag>;
            default: return <Tag color="default">{status}</Tag>;
          }
        }
      },
      {
        title: 'Verified Email?',
        dataIndex: 'verifiedEmail',
        render(status) {
          switch (status) {
            case true:
              return <Tag color="green">Y</Tag>;
            case false:
              return <Tag color="red">N</Tag>;
            default: return <Tag color="default">{status}</Tag>;
          }
        }
      },
      {
        title: 'Verified ID?',
        dataIndex: 'verifiedDocument',
        render(status) {
          switch (status) {
            case true:
              return <Tag color="green">Y</Tag>;
            case false:
              return <Tag color="red">N</Tag>;
            default: return <Tag color="default">{status}</Tag>;
          }
        }
      },
      {
        title: 'Updated on',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: '#',
        dataIndex: '_id',
        render(id: string) {
          return (
            <DropdownAction
              menuOptions={[
                {
                  key: 'update',
                  label: 'Update',
                  href: {
                    pathname: '/performer/update',
                    query: { id }
                  },
                  icon: <EditOutlined />
                },
                {
                  key: 'update',
                  label: 'Photos',
                  href: {
                    pathname: '/photos',
                    query: { performerId: id, breadcrumb: 'performer' }
                  },
                  icon: <CameraOutlined />
                },
                {
                  key: 'update',
                  label: 'Galleries',
                  href: {
                    pathname: '/gallery',
                    query: { performerId: id, breadcrumb: 'performer' }
                  },
                  icon: <FileImageOutlined />
                },
                {
                  key: 'video',
                  label: 'Videos',
                  href: {
                    pathname: '/video',
                    query: { performerId: id, breadcrumb: 'performer' }
                  },
                  icon: <VideoCameraOutlined />
                }
                // {
                //   key: 'product',
                //   label: 'Products',
                //   href: {
                //     pathname: '/product',
                //     query: { performerId: id, breadcrumb: 'performer' }
                //   },
                //   icon: <VideoCameraOutlined />
                // }
              ]}
            />
          );
        }
      }
    ];
    return (
      <>
        <Head>
          <title>Models</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Models' }]} />
        <Page>
          <SearchFilter onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '10px' }} />
          <Table
            dataSource={list}
            columns={columns}
            rowKey="_id"
            loading={searching}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTableChange.bind(this)}
          />
        </Page>
      </>
    );
  }
}
export default Performers;
