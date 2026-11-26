import type { Metadata } from "next";
import Link from "next/link";
import "./privacidade.css";

export const metadata: Metadata = {
  title: "Política de privacidade · PET Folha",
  description: "Como o PET Folha usa a sua conta Google e o seu Google Drive.",
};

const CONTACT = "petsaudeufg.smsgoiania@gmail.com";

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <article>
        <p className="privacy-back"><Link href="/">← Voltar ao PET Folha</Link></p>
        <h1>Política de privacidade</h1>
        <p className="privacy-updated">Atualizada em 25 de novembro de 2026.</p>

        <p>
          O PET Folha ajuda participantes do PET-Saúde Clima UFG a registrar atividades, anexar comprovantes e imprimir a
          folha de frequência mensal. Esta página explica quais dados o app usa, onde eles ficam e como apagá-los.
        </p>

        <h2>Onde seus dados ficam</h2>
        <ul>
          <li><strong>No seu navegador.</strong> Perfil, atividades e comprovantes ficam guardados neste aparelho para o app funcionar mesmo sem internet.</li>
          <li><strong>No seu Google Drive.</strong> Uma cópia de cada mês é enviada para a pasta <strong>PET Folha</strong> do seu próprio Drive. Você pode abrir, baixar ou apagar esses arquivos quando quiser.</li>
          <li><strong>Não há banco de dados do PET.</strong> O servidor do app não guarda suas atividades, comprovantes nem cópias.</li>
        </ul>

        <h2>Dados da sua conta Google</h2>
        <p>Ao entrar com o Google, o app pede somente:</p>
        <ul>
          <li><strong>Nome, e-mail e identificador da conta</strong>, para reconhecer você e preencher o cadastro.</li>
          <li><strong>Acesso aos arquivos que o próprio app cria no seu Drive</strong> (permissão <code>drive.file</code>). O app não vê, não lê e não altera nenhum outro arquivo do seu Drive.</li>
        </ul>
        <p>
          Para manter a cópia automática funcionando, o servidor guarda uma chave de renovação do Google <strong>criptografada
          num cookie do seu próprio navegador</strong>. Ela não fica gravada em nenhum outro lugar e é apagada quando você sai da conta.
        </p>
        <p>
          O uso e a transferência das informações recebidas das APIs do Google seguem a{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de uso limitado. Os dados não são vendidos, compartilhados com terceiros nem usados para publicidade ou treinamento de modelos.
        </p>

        <h2>Estatísticas de acesso</h2>
        <p>
          O site usa o Vercel Analytics para contar visitas de forma agregada, sem cookies de rastreamento e sem acesso ao conteúdo da sua folha.
        </p>

        <h2>Como apagar seus dados</h2>
        <ul>
          <li>Neste aparelho: em <strong>Sair da conta</strong>, marque <strong>Apagar os dados deste aparelho</strong>.</li>
          <li>No Drive: apague a pasta <strong>PET Folha</strong>.</li>
          <li>
            Acesso do app: remova o PET Folha em{" "}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.
          </li>
        </ul>

        <h2>Seus direitos (LGPD)</h2>
        <p>
          Você pode pedir informações sobre o tratamento dos seus dados, correção ou eliminação. Como os dados ficam no seu aparelho
          e no seu Drive, você mesmo controla a maior parte dessas ações. Para dúvidas, escreva para{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </article>
    </main>
  );
}
