import { LockOutlined } from '@ant-design/icons';
import { PurchasePhotoForm } from '@components/photo/purchase-photo-form';
import { Image, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { IPhotos } from 'src/interfaces';

type IProps = {
  photos: IPhotos[];
  isBlur: boolean;
}

function PhotoPreviewList({
  photos, isBlur
}: IProps) {
  const [openModal, setOpenModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const { t } = useTranslation();
  return (
    <Image.PreviewGroup>
      {photos.map((item) => (
        <div key={item._id} className={`photo-card ${item.photo?.url || (item.photo?.thumbnails && item.photo?.thumbnails[0]) ? '' : 'blur'}`}>
          <Image
            src={(item.isSale && !item.isBought) ? item.photo?.blurImagePath : item.photo?.url || (item.photo?.thumbnails && item.photo?.thumbnails[0])}
            preview={isBlur || (item.isSale && !item.isBought) ? false : {
              src: item.photo?.url || (item.photo?.thumbnails && item.photo?.thumbnails[0]) || item.photo?.blurImagePath
            }}
          />
          {item.isSale && !item.isBought && (
          <div className="purchase-block">
            <p>{t('common:unlockPhotoPrice', { price: item.price })}</p>
            <p><LockOutlined onClick={() => { setOpenModal(true); setCurrentPhoto(item); }} /></p>
          </div>
          )}

          <Modal
            centered
            width={500}
            title={t('common:purchasePhoto')}
            footer={null}
            visible={openModal}
            onCancel={() => { setOpenModal(false); setCurrentPhoto(null); }}
            destroyOnClose
          >
            <PurchasePhotoForm photo={currentPhoto} />
          </Modal>
        </div>
      ))}
    </Image.PreviewGroup>
  );
}
export default PhotoPreviewList;
