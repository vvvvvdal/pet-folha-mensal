"use client";

import { useState } from "react";
import { CloudCheck, FileCheck, LockKeyhole, Smartphone } from "lucide-react";
import { GOOGLE_LOGIN_URL } from "@/lib/google-session";
import { Brand } from "./Brand";
import { HelpModal } from "./Help";
import { SiteFooter } from "./SiteFooter";
import { InlineSpinner } from "./LoadingStates";
import "./google-sync.css";

/** Official multicolor "G" mark, as required by Google's sign-in branding guidelines. */
export function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function GoogleButton({ label = "Fazer login com o Google" }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <a className="google-button" href={GOOGLE_LOGIN_URL} aria-busy={busy} onClick={() => setBusy(true)}>
      {busy ? <InlineSpinner size={20} /> : <GoogleMark />}
      <span>{busy ? "Abrindo o Google…" : label}</span>
    </a>
  );
}

export function GoogleLanding({ loginError, onOpenFeedback }: { loginError?: boolean; onOpenFeedback: () => void }) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <div className="screen-only google-landing">
      <header className="google-landing-header">
        <div className="google-landing-bar">
          <Brand />
          <nav aria-label="Ajuda">
            <button type="button" className="text-button" onClick={() => setHelpOpen(true)}>Ajuda</button>
            <a className="text-button" href="/privacidade">Privacidade</a>
          </nav>
        </div>
      </header>
      <main id="conteudo" className="google-landing-main">
        <section className="google-landing-hero" aria-labelledby="entrar-titulo">
          <h1 id="entrar-titulo">Sua folha do PET em qualquer aparelho</h1>
          <p>Registre as atividades, anexe comprovantes e imprima a folha mensal. Tudo fica salvo no seu Google Drive automaticamente.</p>
          {loginError && (
            <p className="operation-notice" role="alert">
              Não foi possível entrar com o Google. Tente novamente. Se continuar, confira se o navegador bloqueia cookies deste site.
            </p>
          )}
          <GoogleButton />
          <p className="google-landing-privacy">
            <LockKeyhole size={18} aria-hidden="true" />
            <span>
              O app cria a pasta <strong>PET Folha</strong> no seu Drive e só enxerga os arquivos que ele mesmo criou.
              Nenhum registro fica guardado em servidor do PET. <a href="/privacidade">Política de privacidade</a>
            </span>
          </p>
        </section>
        <aside className="google-landing-card" aria-labelledby="como-fica">
          <h2 id="como-fica">Como fica depois de entrar</h2>
          <ul>
            <li><span aria-hidden="true"><Smartphone size={20} /></span><span><strong>Celular e computador com a mesma folha</strong><small>Entre com a mesma conta e os meses aparecem.</small></span></li>
            <li><span aria-hidden="true"><CloudCheck size={20} /></span><span><strong>Cópia automática no Drive</strong><small>Cada atividade e comprovante é enviado sozinho. Sem internet, vai quando a conexão voltar.</small></span></li>
            <li><span aria-hidden="true"><FileCheck size={20} /></span><span><strong>Já tem uma folha neste navegador?</strong><small>Depois de entrar, você vincula ela à sua conta uma única vez.</small></span></li>
          </ul>
        </aside>
      </main>
      <SiteFooter onHelp={() => setHelpOpen(true)} onFeedback={onOpenFeedback} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
