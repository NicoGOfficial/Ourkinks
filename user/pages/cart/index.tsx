import { ArrowLeftOutlined } from '@ant-design/icons';
import CheckOutForm from '@components/cart/form-checkout';
import { TableCart } from '@components/cart/table-cart';
import PageTitle from '@components/common/page-title';
import {
  Layout, message, PageHeader,
  Spin
} from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  ICoupon, IProduct, ISettings
} from 'src/interfaces';
import { removeCart, updateCartTotal } from 'src/redux/cart/actions';
import { cartService, paymentService, productService } from 'src/services';

import style from './cart.module.less';

type IProps = {
  settings: ISettings;
}

function CartPage({ settings }: IProps) {
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [coupon, setCoupon] = useState(null as ICoupon);
  const [isApplyCoupon, setIsApplyCoupon] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  function mapQuantiy(items, existCart) {
    existCart.forEach((item) => {
      const index = items.findIndex((element) => element._id === item._id);
      // eslint-disable-next-line no-param-reassign
      if (index > -1) items[index].quantity = item.quantity;
    });
    return items;
  }

  const calTotal = (items, couponValue?: number) => {
    let total = 0;
    items?.length
      && items.forEach((item) => {
        total += (item.quantity || 1) * item.price;
      });
    if (couponValue) {
      // total -= total * couponValue;
      total *= couponValue;
    }
    return total.toFixed(2) || 0;
  };

  const handleApplyCoupon = async (couponCode: string) => {
    try {
      if (isApplyCoupon) {
        setIsApplyCoupon(false);
        setCoupon(null);
        return;
      }
      await setRequesting(true);
      const resp = await paymentService.applyCoupon(couponCode);
      setIsApplyCoupon(true);
      setCoupon(resp.data);
      setRequesting(false);
      message.success(
        `${t('common:successApplyCoupon')} $${calTotal(products, resp.data.value)}!`
      );
    } catch (error) {
      const e = await error;
      message.error(e?.message || t('common:errCommon'));
      setRequesting(false);
    }
  };

  const onChangeQuantity = (item, quantity) => {
    const index = products.findIndex((element) => element._id === item._id);
    if (index > -1) {
      const newArray = [...products];
      newArray[index] = {
        ...newArray[index],
        quantity: quantity || 1
      };
      setProducts(newArray);
    }
  };

  const removeItemCart = (product: IProduct) => {
    let oldCart = localStorage.getItem('cart') as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    let newCart = [...oldCart];
    newCart = newCart.filter((item: IProduct) => item._id !== product._id);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const onRemove = (item) => {
    dispatch(removeCart([item]));
    removeItemCart(item);
    setProducts(products.filter((product: IProduct) => product._id !== item._id));
  };

  const getProducts = async () => {
    try {
      await setLoading(true);
      const existCart = cartService.getCartItems();
      if (existCart && existCart.length > 0) {
        const itemIds = existCart.map((i) => i._id);
        const resp = await productService.userSearch({
          includedIds: itemIds,
          limit: 100
        });
        setProducts(mapQuantiy(resp.data.data, existCart));
        setLoading(false);
        updateCartTotal(resp.data.total);
      } else {
        setLoading(false);
      }
    } catch (e) {
      message.error(t('common:errCommon'));
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const purchaseProducts = async ({
    deliveryAddress,
    phoneNumber,
    postalCode,
    couponCode,
    paymentGateway = 'ccbill'
  }) => {
    if (!products.length) return;
    if (calTotal(products) > 300) {
      message.error(t('common:errPurchaseProducts'));
      return;
    }
    try {
      await setSubmiting(true);
      const items = products.map((p) => ({
        quantity: p.quantity || 1,
        _id: p._id
      }));
      const data = {
        paymentGateway,
        products: items,
        couponCode: couponCode || '',
        phoneNumber,
        postalCode,
        deliveryAddress
      };
      if (data.paymentGateway === 'wallet') {
        await paymentService.purchaseProductsWallet(data);
        window.location.href = '/payment/success';
      } else {
        const resp = await (await paymentService.purchaseProducts(data)).data;
        message.info(
          t('common:paymentRedirecting'),
          15
        );
        window.location.href = resp.paymentUrl;
      }
    } catch (error) {
      const e = await error;
      message.error(e?.message || t('common:errCommon'));
      setSubmiting(false);
    } finally {
      setSubmiting(false);
    }
  };

  return (
    <Layout>
      <PageTitle title="Shopping Cart" />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={t('common:titleShoppingCart')}
        />
        {!loading && products && products.length > 0 && (
        <div className="table-responsive">
          <TableCart
            dataSource={products}
            rowKey="_id"
            onChangeQuantity={(item, quantity) => onChangeQuantity(item, quantity)}
            onRemoveItemCart={(item) => onRemove(item)}
          />
        </div>
        )}
        {!loading && products && products.length > 0 && (
        <CheckOutForm
          settings={settings as any}
          onFinish={purchaseProducts}
          products={products}
          submiting={submiting || requesting}
          coupon={coupon}
          isApplyCoupon={isApplyCoupon}
          onApplyCoupon={(couponCode) => handleApplyCoupon(couponCode)}
        />
        )}
        {!loading && !products.length && (
        <p className="text-center">
          {t('common:cartEmpty')}
          ,
          {' '}
          <a className={style['text-link']} href="/store">
            {t('common:goShopping')}
          </a>
        </p>
        )}
        {loading && (
        <div className="text-center">
          <Spin />
        </div>
        )}
      </div>
    </Layout>
  );
}

const mapStates = (state: any) => ({
  settings: state.settings
});

const mapDispatch = { removeCart, updateCartTotal };
export default connect(mapStates, mapDispatch)(CartPage);
