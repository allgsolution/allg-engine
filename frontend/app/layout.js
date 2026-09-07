import './globals.css'

export const metadata = {
  title: 'ALLG Affiliate Engine — Motor de Marketing de Afiliados com IA',
  description:
    'Plataforma inteligente para afiliados: pesquise produtos, crie estratégias com IA, produza conteúdo em escala e gerencie campanhas multicanal.',
  keywords: 'afiliados, marketing digital, shopee, mercado livre, aliexpress, IA, conteúdo, campanhas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0b0f" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
