import '../lib/dayjs'

import type { AppProps } from 'next/app'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { DefaultSeo } from 'next-seo'

import { globalStyles } from '@/styles/global'
import { queryClient } from '@/lib/react-query'

globalStyles()

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <DefaultSeo
          openGraph={{
            type: 'website',
            locale: 'pt_BR',
            url: 'https://ignite-call.juliano.com.br',
            siteName: 'Ignite Call',
          }}
        />
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  )
}
