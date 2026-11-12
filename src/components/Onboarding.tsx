"use client";

import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";

/** Introductory steps; the existing identification form supplies the third step. */
export function Onboarding({ onComplete, onRestore }: { onComplete: () => void; onRestore: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  return (
    <section className="onboarding-steps" aria-labelledby="onboarding-title">
      <div className="onboarding-actions"><span className="section-kicker">PET Folha</span><button type="button" onClick={onComplete}>Pular</button></div>
      {step === 1 ? (
        <>
          <div className="entry-preview-note"><Clock size={20} aria-hidden="true" /><span><strong>14:00 às 15:30 = 2 horas</strong><br />a hora iniciada conta inteira</span></div>
          <h2 id="onboarding-title">Sua frequência do PET, sem planilha.</h2>
          <p>Anote as atividades pelo celular e receba a folha do mês pronta para assinar.</p>
        </>
      ) : (
        <>
          <p className="section-kicker">Como funciona</p>
          <h2 id="onboarding-title">Você anota. A folha se monta.</h2>
          <p>O mês inteiro em quatro passos curtos.</p>
          <ol><li>Registre suas atividades.</li><li>Confira as horas da semana.</li><li>Prepare o relatório e a folha para assinatura.</li><li>Guarde sua cópia e envie a folha assinada.</li></ol>
        </>
      )}
      <div className="onboarding-dots" role="img" aria-label={`Passo ${step} de 3`}><span data-active={step === 1} /><span data-active={step === 2} /><span /></div>
      <button className="primary-button w-full" type="button" onClick={() => step === 1 ? setStep(2) : onComplete()}>{step === 1 ? "Como funciona" : "Continuar"} <ArrowRight size={18} /></button>
      <button type="button" onClick={onRestore}>Já tenho uma cópia</button>
    </section>
  );
}
