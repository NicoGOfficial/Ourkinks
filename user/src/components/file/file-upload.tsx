import { FileAddOutlined, FileDoneOutlined, LoadingOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import getConfig from 'next/config';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

type IProps = {
  accept?: string;
  fieldName?: string;
  fileUrl?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  onFileReaded?: Function;
}

export function FileUpload({
  accept = '*',
  fieldName = 'file',
  headers = null,
  fileUrl = '',
  uploadUrl = '',
  onUploaded = () => {},
  onFileReaded = () => {}
}: IProps) {
  const [loading, setLoading] = useState(false);
  const [fileDataUrl, setFileDataUrl] = useState(fileUrl);
  const { t } = useTranslation();

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      onFileReaded && onFileReaded(info.file.originFileObj);
      setLoading(false);
      setFileDataUrl(info.file.response.data ? info.file.response.data.url : t('common:done'));
      onUploaded && onUploaded({
        response: info.file.response
      });
    }
  };

  const beforeUpload = (file) => {
    const { publicRuntimeConfig: config } = getConfig();
    const isLt2M = file.size / 1024 / 1024 < (config.MAX_SIZE_FILE || 20);
    if (!isLt2M) {
      message.error(t('common:errFileTooLarge', { size: config.MAX_SIZE_FILE || 20 }));
    }
    return isLt2M;
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <FileAddOutlined />}
    </div>
  );
  return (
    <Upload
      accept={accept || '*'}
      name={fieldName}
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action={uploadUrl}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      headers={headers}
    >
      {fileDataUrl ? (
        <FileDoneOutlined style={{ fontSize: '28px', color: '#00ce00' }} />
      ) : (
        uploadButton
      )}
    </Upload>
  );
}

export default FileUpload;
