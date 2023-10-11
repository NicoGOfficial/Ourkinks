import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { performerService } from '@services/performer.service';
import {
  Button, Divider, Dropdown, Form, FormInstance, Input, Menu, message, Table
} from 'antd';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

export function RankingPerformers() {
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);

  const getRankingModels = async () => {
    setLoading(true);
    const data = await performerService.getRankingModels();
    setPerformers(data.data);
    setLoading(false);
  };

  const remove = async (id) => {
    await performerService.deleteRanking(id);
    message.success('Item has been deleted');
    await getRankingModels();
  };

  const update = async (ranking, ordering) => {
    await performerService.updateRanking(ranking._id, {
      performerId: ranking.performerId,
      ordering: parseInt(ordering, 10)
    });
    message.success('Updated successfully');
    await getRankingModels();
  };

  const create = async (data) => {
    try {
      setLoading(true);
      await performerService.createRanking({
        ...data,
        ordering: parseInt(data.ordering, 10)
      });
      message.success('Created successfully');
      await getRankingModels();
    } catch (e) {
      const error = await e;
      message.error(error.message || 'An error occurred, plesae check');
    } finally {
      setLoading(false);
    }
  };

  const setOrdering = (id, ordering) => {
    const performer = performers.find((p) => p._id === id);
    if (performer) {
      performer.ordering = ordering;
    }
    setPerformers([...performers]);
  };

  const setFormVal = (field: string, val: any) => {
    const instance = formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  };

  useEffect(() => {
    getRankingModels();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: 'Username',
      dataIndex: 'username'
    },
    {
      title: 'Ordering',
      dataIndex: 'ordering',
      render(ordering, record) {
        return (
          <Input
            type="number"
            value={ordering}
            onChange={(e) => setOrdering(record._id, e.target.value)}
            onPressEnter={(e: any) => update(record, e.target.value)}
          />
        );
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      render(id) {
        return (
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item key="delete" onClick={() => remove(id)}>
                  <span>
                    <DeleteOutlined />
                    {' '}
                    Delete
                  </span>
                </Menu.Item>
              </Menu>
            )}
          >
            <Button>
              Actions
              {' '}
              <DownOutlined />
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <>
      <Head>
        <title>Ranking models</title>
      </Head>
      <BreadcrumbComponent breadcrumbs={[{ title: 'Models', href: '/performer' }]} />
      <Page>
        <div style={{ marginBottom: '20px' }} />
        <Table loading={loading} columns={columns} dataSource={performers} />

        <Divider />
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={create}
          autoComplete="off"
          ref={formRef}
        >
          <Form.Item label="Model" name="performerId" rules={[{ required: true, message: 'Please select a model!' }]}>
            <SelectPerformerDropdown
              noEmpty
              defaultValue=""
              onSelect={(val) => setFormVal('performerId', val)}
            />
          </Form.Item>

          <Form.Item
            label="Ordering"
            name="ordering"
            rules={[{ required: true, message: 'Please input model\'s ordering!' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" disabled={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Page>
    </>
  );
}

export default RankingPerformers;
