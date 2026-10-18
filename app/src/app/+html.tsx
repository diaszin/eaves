import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Eaves App</title>
        <meta name="description" content="Cuide da sua saúde mental" />
        <meta
          http-equiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />

        {/* Adicione outras meta tags aqui */}
      </head>
      <body>{children}</body>
    </html>
  );
}
