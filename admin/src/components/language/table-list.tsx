/* eslint-disable react/no-unstable-nested-components */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common';
import {
  Button, Form, Input, Space,
  Table
} from 'antd';
import { useState } from 'react';
import { formatDate } from 'src/lib/date';

interface IProps {
  dataSource: any;
  rowKey?: string;
  loading?: boolean;
  onChange: Function;
  onDelete: Function;
  onUpdate: Function;
  pagination: any;
}

function LanguageSettingTable({
  dataSource,
  rowKey = '',
  loading = false,
  onChange,
  onDelete,
  onUpdate,
  pagination
}: IProps) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (id: string) => id === editingKey;

  function EditableCell({
    editing,
    dataIndex,
    title,
    children,
    ...restProps
  }: any) {
    const inputNode = <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`
              }
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  }

  const save = async () => {
    const store = await form.validateFields();
    const record = dataSource.find((d) => d._id === editingKey);
    if (record) {
      onUpdate && onUpdate({ ...record, ...store });
      setEditingKey('');
    }
  };

  const renderAction = (record) => [
    {
      key: 'update',
      label: 'Update',
      children: (
        <span>
          <EditOutlined />
          {' '}
          Update
        </span>
      ),
      // onClick: () => console.log(record._id)
      onClick: () => [form.setFieldsValue({
        key: '', value: '', locale: '', ...record
      }), setEditingKey(record._id)]
    },
    {
      key: 'delete',
      label: 'Delete',
      children: (
        <span>
          <DeleteOutlined />
          {' '}
          Delete
        </span>
      ),
      onClick: () => onDelete && onDelete(record._id)
    }
  ];
  const column = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      editable: true,
      sorter: false
    },
    {
      title: 'Locale',
      dataIndex: 'locale',
      key: 'locale',
      editable: true,
      sorter: false
    },
    {
      title: 'Text',
      dataIndex: 'value',
      key: 'value',
      editable: true,
      sorter: false
    },
    {
      title: 'Date',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (createdAt: Date) => (
        <span>{formatDate(createdAt, 'DD/MM/YYYY HH:mm')}</span>
      ),
      sorter: false
    },
    {
      title: '#',
      key: 'action',
      render: (record) => {
        const editable = isEditing(record._id);
        if (editable) {
          return (
            <Space>
              <Button onClick={save}>Save</Button>
              <Button onClick={() => setEditingKey('')}>Cancel</Button>
            </Space>
          );
        }
        return <DropdownAction menuOptions={renderAction(record)} />;
      }
    }
  ];
  const mergedColumns = column.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record._id)
      })
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        columns={mergedColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        onChange={onChange.bind(this)}
        pagination={pagination}
        scroll={{ x: 700, y: 500 }}
        components={{
          body: {
            cell: EditableCell
          }
        }}
      />
    </Form>
  );
}

export default LanguageSettingTable;
