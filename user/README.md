This is a base probject with next + antd

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js/) - your feedback and contributions are welcome!

## Note
- Do not upgrade to react 18.x. Since antd has a lot of issues with this react version

## Multi lang
- open `i18n.js` and add supported languages to locales field. Support ISO 639-1 Alpha-2 format
- change `http://localhost:8080` to api base env. Since we cannot load from `.env` file