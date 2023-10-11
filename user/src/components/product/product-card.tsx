import { DollarOutlined, PictureOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import Price from '@components/price';
import { addCart, clearCart } from '@redux/cart/actions';
import { Button, message, Tooltip } from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IProduct, IUser } from 'src/interfaces';

import style from './product-card.module.less';

type IProps = {
  product: IProduct;
  addCart: Function;
  clearCart: Function;
  cart: any;
  user: IUser;
  i18n: any;
}

class ProductCard extends PureComponent<IProps> {
  async onAddCart() {
    const { t } = this.props.i18n;
    const {
      addCart: addCartHandler, clearCart: handleClearCart, product, cart, user
    } = this.props;
    if (!user._id) {
      message.error(t('common:errRequireLoginToBuy'));
      Router.push('/auth/login');
      return;
    }
    if (cart.items && cart.items.length === 10) {
      message.error(t('common:errLimitCartItems'));
      return;
    }
    const { stock, type, performerId } = product;
    if ((type === 'physical' && !stock) || (type === 'physical' && stock < 1)) {
      message.error(t('common:outOfStock'));
      return;
    }
    if (type === 'digital' && !!cart.items.find((item) => item._id === product._id)) {
      return;
    }
    const difPerformerProducts = cart.items.filter((item) => item.performerId !== performerId);
    if (difPerformerProducts && difPerformerProducts.length) {
      if (!window.confirm(t('common:errMultiModelInCart'))) return;
      // clear cart before add new item from another performer
      handleClearCart();
      localStorage.setItem('cart', '[]');
    }
    message.success(t('common:itemHasBeenAddedToCard'));
    addCartHandler([{ _id: product?._id, quantity: 1, performerId }]);
    this.updateCartLocalStorage({ _id: product?._id, quantity: 1, performerId });
  }

  onBuyNow() {
    const { t } = this.props.i18n;
    const { user } = this.props;
    if (!user._id) {
      message.error(t('common:errRequireLoginToBuy'));
      Router.push('/auth/login');
      return;
    }
    this.onAddCart();
    setTimeout(() => { Router.push('/cart'); }, 1000);
  }

  updateCartLocalStorage(item) {
    let oldCart = localStorage.getItem('cart') as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    let newCart = [...oldCart];
    const addedProduct = oldCart.find((c) => c._id === item._id);
    if (addedProduct) {
      const { quantity } = addedProduct;
      newCart = oldCart.map((_item) => {
        if (_item._id === addedProduct?._id) {
          return {
            ..._item,
            quantity: (quantity || 0) + 1
          };
        }
        return _item;
      });
    } else {
      newCart.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(newCart));
  }

  render() {
    const { t } = this.props.i18n;
    const { product, user } = this.props;
    const thumbUrl = (product?.images && product?.images[0]?.thumbnails && product?.images[0]?.thumbnails[0]) || (product?.images && product?.images[0]?.url) || '/no-image.jpg';
    return (
      <div className={style['prd-card']}>
        <div className="label-wrapper">
          {!product?.stock && product?.type === 'physical' && (
            <div className="label-wrapper-digital">{t('common:outOfStock')}</div>
          )}
          {product?.stock > 0 && product?.type === 'physical' && (
            <div className="label-wrapper-digital">
              {product?.stock}
              {' '}
              in stock
            </div>
          )}
          {product?.type === 'digital' && (
            <span className="label-wrapper-digital">{t('common:digital')}</span>
          )}
          {product?.price && !product.isBought && (
            <span className="label-wrapper-price">
              <Price amount={product.price} />
            </span>
          )}
        </div>
        <div
          style={{ cursor: (!user?._id || (user?.isPerformer && product?.performer?._id !== user?._id)) ? 'not-allowed' : 'pointer' }}
          aria-hidden
          className={style['prd-thumb']}
          onClick={() => {
            if (!user?._id) {
              message.error(t('common:errRequireLoginCheckoutProduct'));
              Router.push('/auth/login');
              return;
            }
            if (user?.isPerformer && user?._id !== product?.performerId) return;
            Router.push(
              {
                pathname: '/store/[id]',
                query: { id: product?.slug || product?._id }
              },
              `/store/${product?.slug || product?._id}`
            );
          }}
        >
          <img alt="" src={thumbUrl} />
        </div>
        <Tooltip title={product?.name}>
          <div className={style['prd-info']}>
            {product?.name}
          </div>
        </Tooltip>
        <div className={style['no-of-images']}>
          <PictureOutlined />
          {' '}
          {(product?.images && product?.images.length) || 0}
        </div>
        <div className="prd-button">
          <Button
            className="primary"
            disabled={user.isPerformer || (product?.type === 'physical' && !product?.stock)}
            onClick={this.onAddCart.bind(this)}
          >
            <ShoppingCartOutlined />
            {t('common:addToCart')}
          </Button>
          <Button
            disabled={user.isPerformer || (product?.type === 'physical' && !product?.stock)}
            className="primary"
            onClick={this.onBuyNow.bind(this)}
          >
            <DollarOutlined />
            {t('common:buyNow')}
          </Button>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  cart: state.cart,
  user: state.user.current
});

const mapDispatch = {
  addCart, clearCart
};

export default connect(mapStates, mapDispatch)(withTranslation(ProductCard));
