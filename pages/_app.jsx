import '@/styles/globals.css';
import { Provider } from 'react-redux';
import store from '@/store';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <SocketProvider>
        <Head>
          <title>GameSection - Play Free Online Games</title>
          <meta name="description" content="Play free online HTML5 games on GameSection. No downloads required!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID" crossOrigin="anonymous"></script>
        </Head>
        <Layout>
          <Component {...pageProps} />
          <Toaster position="bottom-right" />
        </Layout>
      </SocketProvider>
    </Provider>
  );
}