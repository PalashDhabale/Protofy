import '@tamagui/core/reset.css'
import '@tamagui/font-inter/css/400.css'
import '@tamagui/font-inter/css/700.css'
import '../app.css'
import 'raf/polyfill'
import 'reactflow/dist/style.css'
import 'protoflow/src/styles.css'
import 'protoflow/src/diagram/menu.module.css'
import 'react-sliding-side-panel/lib/index.css'
import 'protolib/styles/datatable.css';
import '../chat.css'
import '../map.css'
import '../chonky.css'
import '../dashboard.css'
import '../blueprint.css'
import 'react-dropzone-uploader/dist/styles.css'
import 'react-chat-widget/lib/styles.css';
import "@blueprintjs/table/lib/css/table.css";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { Provider } from 'app/provider'
import Head from 'next/head'
import React from 'react'
import type { SolitoAppProps } from 'solito'
import { AppConfig } from '../conf'
import { Provider as JotaiProvider } from 'jotai'
import { setConfig, initSchemaSystem } from 'protobase';
import { getBaseConfig } from '@my/config'
import { useSession } from 'protolib/lib/Session'
import { AppConfContext } from 'protolib/providers/AppConf'
import { getBrokerUrl } from 'protolib/lib/Broker'
import { Connector } from 'protolib/lib/mqtt'
import Workspaces from 'app/bundles/workspaces'
import { PanelLayout } from 'app/layout/PanelLayout'

setConfig(getBaseConfig("electron", process))
initSchemaSystem()

if (process.env.NODE_ENV === 'production') {
  require('../public/tamagui.css')
}

function MyApp({ Component, pageProps }: SolitoAppProps) {
  //@ts-ignore
  const [session] = useSession(pageProps['pageSession'])
  const isElectron = () => {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
      return true;
    }

    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
      return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
      return true;
    }

    return false;
  }
  const brokerUrl = getBrokerUrl()

  return (
    <>
      <Head>
        <title>Protofy - AI Supercharged LowCode Platform CMS and Framework</title>
        <meta name="description" content="Next Generation Development Platform for web, mobile and IoT. Based on proven tech: React, ChatGPT, ESPHome, Express, Next, Node, Tamagui, Zod, LevelDB an much more." />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <JotaiProvider>
        <Connector brokerUrl={brokerUrl} options={{ username: session?.user?.id, password: session?.token }}>
          <ThemeProvider>
            <AppConfContext.Provider value={{
              ...AppConfig, bundles: {
                workspaces: Workspaces
              }, layout: { PanelLayout }
            }}>
              <Component {...pageProps} />
            </AppConfContext.Provider>
          </ThemeProvider>
        </Connector>
      </JotaiProvider>
    </>
  )
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useRootTheme()

  return (
    <NextThemeProvider
      onChangeTheme={(next) => {
        setTheme(next as any)
      }}
    >
      <Provider disableRootThemeClass defaultTheme={theme}>
        {children}
      </Provider>
    </NextThemeProvider>
  )
}

export default MyApp
