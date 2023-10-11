import { authService } from '@services/auth.service';
import Router from 'next/router';

export function getResponseError(data: any) {
  if (!data) {
    return '';
  }

  if (Array.isArray(data.message)) {
    const item = data.message[0];
    if (!item.constraints) {
      return data.error || 'Bad request!';
    }
    return Object.values(item.constraints)[0];
  }

  // TODO - parse for langauge or others
  return typeof data.message === 'string' && (data.message === 'cyclic object value' ? 'Bad request!' : data.message);
}

export function validateUsername(text: string) {
  return /^[a-z0-9]+$/.test(text);
}

export function redirectLogin(ctx) {
  if (typeof window !== 'undefined') {
    authService.removeToken();
    Router.push('/auth/login');
    return;
  }

  ctx.res.clearCookie && ctx.res.clearCookie('token');
  ctx.res.clearCookie && ctx.res.clearCookie('role');
  ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/auth/login' });
  ctx.res.end && ctx.res.end();
}
