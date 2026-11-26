"use client";

import { useEffect, useRef } from "react";
import { GOOGLE_LOGIN_URL, type GoogleLoginError } from "@/lib/google-session";
import "./google-sync.css";

/** Official multicolor "G" mark, as required by Google's sign-in branding guidelines. */
function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const loginMessages: Record<Exclude<GoogleLoginError, "permission">, string> = {
  denied: "A entrada com Google não foi autorizada",
  unavailable: "Não foi possível verificar o login. Confira sua conexão e tente de novo.",
  failed: "Não foi possível entrar com o Google. Tente de novo em instantes.",
};

export function GoogleAccess({ error }: { error?: GoogleLoginError }) {
  const errorMessage = useRef<HTMLParagraphElement>(null);
  const needsConsent = error === "permission";

  useEffect(() => {
    if (error) errorMessage.current?.focus();
  }, [error]);

  return (
    <div id="acesso" className="entry-google-access" tabIndex={-1}>
      {error && (
        <p ref={errorMessage} className="entry-login-message" tabIndex={-1}>
          {error === "permission"
            ? <>Ao tentar de novo, marque a caixa do Drive e selecione <strong>Continuar</strong> para entrar.</>
            : loginMessages[error]}
        </p>
      )}
      <a className="google-button" href={needsConsent ? `${GOOGLE_LOGIN_URL}?prompt=consent` : GOOGLE_LOGIN_URL}>
        <GoogleMark />
        <span>{error ? "Tentar novamente com o Google" : "Fazer login com o Google"}</span>
      </a>
      <div className="entry-drive-help">
        {!needsConsent && (
          <p>
            Se o Google mostrar a caixa do Drive, marque-a e selecione <strong>Continuar</strong>.
            {" "}Essa permissão é necessária para salvar e recuperar sua folha.
          </p>
        )}
        <details open={needsConsent || undefined}>
          <summary>Ver onde marcar</summary>
          <div className="entry-drive-example">
            {/* eslint-disable-next-line @next/next/no-img-element -- Small static screenshot shown on demand. */}
            <img
              src="/images/google-drive-permissao.png"
              alt="Na tela do Google, a caixa fica à direita da permissão do Google Drive."
              width={497}
              height={181}
              loading="lazy"
            />
          </div>
        </details>
      </div>
    </div>
  );
}
