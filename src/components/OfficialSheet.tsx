'use client';

import React from 'react';
import { Activity, UserProfile } from '@/types';
import { formatDateBR, formatActivityForSheet } from '@/lib/pet-calculator';

interface OfficialSheetProps {
  user?: UserProfile;
  monthLabel?: string;
  activities?: Activity[];
  totalHours?: number;
  isBlankTemplate?: boolean;
}

export function OfficialSheet({
  user,
  monthLabel = 'Setembro/2026',
  activities = [],
  totalHours = 0,
  isBlankTemplate = false
}: OfficialSheetProps) {
  const emptyRowsCount = isBlankTemplate ? 10 : Math.max(0, 10 - activities.length);

  return (
    <div
      className="official-sheet bg-white text-black p-4 sm:p-6 md:p-7 w-full max-w-[297mm] mx-auto box-border"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* Cabeçalho Tríplice Oficial */}
      <div
        className="flex justify-between items-center mb-3"
        style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}
      >
        <div className="w-[32%] text-center text-[8.5pt] leading-tight text-black font-normal">
          Ministério da Saúde<br />
          Secretaria de Gestão do Trabalho e da Educação na Saúde<br />
          Departamento de Gestão da Educação na Saúde
        </div>
        <div className="w-[36%] text-center flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-horizontal.png"
            alt="PET-Saúde Clima"
            className="h-11 sm:h-12 max-w-full object-contain"
          />
        </div>
        <div className="w-[32%] text-center text-[8.5pt] leading-tight text-black font-normal">
          Secretaria Municipal de Saúde de Goiânia<br />
          Secretaria Estadual de Saúde de Goiás<br />
          Universidade Federal de Goiás
        </div>
      </div>

      {/* Título */}
      <h1 className="text-center text-[15pt] md:text-[16pt] font-bold text-black my-2 tracking-tight">
        Folha de Frequência Mensal*
      </h1>

      {/* Metadados */}
      <div className="text-[10pt] text-black mb-3">
        {/* Linha 1: Nome */}
        <div className="mb-2 flex items-baseline">
          <span className="font-bold mr-1 shrink-0">Nome:</span>
          <span className="flex-1 border-b border-black font-normal px-2 pb-0.5 min-h-[1.2rem]">
            {isBlankTemplate ? '' : (user?.name || '')}
          </span>
        </div>
        {/* Linha 2: Perfil**, Nº do GAT, Mês/ano */}
        <div className="flex items-baseline justify-between gap-6">
          <div className="flex-[2] flex items-baseline min-w-0">
            <span className="font-bold mr-1 shrink-0">Perfil**:</span>
            <span className="flex-1 border-b border-black font-normal px-2 pb-0.5 min-h-[1.2rem] truncate">
              {isBlankTemplate ? '' : (user?.role || '')}
            </span>
          </div>
          <div className="w-44 flex items-baseline shrink-0">
            <span className="font-bold mr-1 shrink-0">Nº do GAT:</span>
            <span className="flex-1 border-b border-black font-normal px-2 pb-0.5 min-h-[1.2rem] text-center">
              {isBlankTemplate ? '' : (user?.gatNumber || '')}
            </span>
          </div>
          <div className="w-56 flex items-baseline shrink-0">
            <span className="font-bold mr-1 shrink-0">Mês/ano:</span>
            <span className="flex-1 border-b border-black font-normal px-2 pb-0.5 min-h-[1.2rem] text-center">
              {isBlankTemplate ? '' : monthLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <table className="official-table w-full border-collapse border-[1.5px] border-black text-[9.5pt] text-black mb-1.5">
        <thead>
          <tr className="bg-white font-bold">
            <th className="border border-black px-2 py-1.5 text-center w-[12%] align-middle">Data</th>
            <th className="border border-black px-2 py-1.5 text-center w-[13%] align-middle leading-tight">
              Horário de<br />Chegada
            </th>
            <th className="border border-black px-2 py-1.5 text-center w-[13%] align-middle leading-tight">
              Horário de<br />Saída
            </th>
            <th className="border border-black px-2 py-1.5 text-center w-[62%] align-middle">Atividade</th>
          </tr>
        </thead>
        <tbody>
          {!isBlankTemplate &&
            activities.map((act) => (
              <tr key={act.id} className="h-7">
                <td className="border border-black px-2 py-1 text-center align-middle font-normal whitespace-nowrap">
                  {formatDateBR(act.date)}
                </td>
                <td className="border border-black px-2 py-1 text-center align-middle font-normal whitespace-nowrap">
                  {act.start}
                </td>
                <td className="border border-black px-2 py-1 text-center align-middle font-normal whitespace-nowrap">
                  {act.end}
                </td>
                <td className="border border-black px-2 py-1 text-left align-middle font-normal break-words">
                  {formatActivityForSheet(act.description, act.modality)}
                </td>
              </tr>
            ))}

          {/* Linhas em branco de preenchimento */}
          {Array.from({ length: emptyRowsCount }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-7">
              <td className="border border-black px-2 py-1 text-center align-middle"></td>
              <td className="border border-black px-2 py-1 text-center align-middle"></td>
              <td className="border border-black px-2 py-1 text-center align-middle"></td>
              <td className="border border-black px-2 py-1 text-left align-middle"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total de Horas (exibido apenas quando preenchido para validação das 32h) */}
      {!isBlankTemplate && (
        <div className="text-[10pt] font-bold text-black mt-1 mb-2">
          TOTAL: {totalHours} horas
        </div>
      )}

      {/* Assinaturas Digitais (Espaço dedicado para carimbos e assinaturas do Gov.br) */}
      <div className="flex justify-between items-end mt-12 mb-4 px-10">
        <div className="w-[42%] text-center">
          <div className="text-[10pt] font-normal text-black">
            Assinatura do Participante
          </div>
        </div>
        <div className="w-[42%] text-center">
          <div className="text-[10pt] font-normal text-black">
            Assinatura da Supervisão do GAT
          </div>
        </div>
      </div>

      {/* Nota de Rodapé Oficial */}
      <div className="text-[7.5pt] text-black leading-tight mt-6">
        <p>**Estudante, Orientador de Serviço, Preceptor, Tutor, Coordenador de GAT</p>
      </div>
    </div>
  );
}
