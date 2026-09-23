'use client';

import React from 'react';
import { Activity, UserProfile } from '@/types';
import { formatDateBR } from '@/lib/pet-calculator';

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
  const emptyRowsCount = isBlankTemplate ? 10 : Math.max(0, 7 - activities.length);
  const totalDisplayRows = isBlankTemplate ? 10 : Math.max(7, activities.length);

  return (
    <div
      className="official-sheet bg-white text-black p-4 sm:p-6 md:p-7 font-sans w-full max-w-[297mm] mx-auto box-border"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Cabeçalho Tríplice Oficial */}
      <div className="flex justify-between items-center mb-2">
        <div className="w-[32%] text-center text-[8.5pt] leading-tight text-black font-normal">
          Ministério da Saúde<br />
          Secretaria de Gestão do Trabalho e da Educação na Saúde<br />
          Departamento de Gestão da Educação na Saúde
        </div>
        <div className="w-[36%] text-center flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-pet-clima.png"
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
      <h1 className="text-center text-[15pt] md:text-[16pt] font-bold text-black my-1 tracking-tight">
        Folha de Frequência Mensal*
      </h1>

      {/* Metadados */}
      {isBlankTemplate ? (
        <div className="text-[9.5pt] md:text-[10pt] text-black mb-2 leading-relaxed">
          <div className="mb-1 flex items-baseline">
            <span className="font-bold mr-1 shrink-0">Nome:</span>
            <span className="flex-1 border-b border-black h-3.5"></span>
          </div>
          <div className="flex justify-between items-baseline gap-4">
            <span className="flex-1 flex items-baseline">
              <span className="font-bold mr-1 shrink-0">Perfil**:</span>
              <span className="flex-1 border-b border-black h-3.5"></span>
            </span>
            <span className="w-36 flex items-baseline">
              <span className="font-bold mr-1 shrink-0">Nº do GAT:</span>
              <span className="flex-1 border-b border-black h-3.5"></span>
            </span>
            <span className="w-48 flex items-baseline">
              <span className="font-bold mr-1 shrink-0">Mês/ano:</span>
              <span className="flex-1 border-b border-black h-3.5"></span>
            </span>
          </div>
        </div>
      ) : (
        <div className="text-[9.5pt] md:text-[10pt] text-black mb-2 leading-relaxed">
          <div className="mb-0.5">
            <span className="font-bold">Nome:</span> {user?.name || ''}
          </div>
          <div className="flex justify-between">
            <span>
              <span className="font-bold">Perfil:</span> {user?.role || ''}
            </span>
            <span>
              <span className="font-bold">Nº do GAT:</span> {user?.gatNumber || ''}
            </span>
            <span>
              <span className="font-bold">Mês/ano:</span> {monthLabel}
            </span>
          </div>
        </div>
      )}

      {/* Tabela de Lançamentos */}
      <table className="official-table w-full border-collapse border-[1.5px] border-black text-[9pt] text-black mb-1.5">
        <thead>
          <tr className="bg-white font-bold">
            <th className="border border-black px-2 py-1 text-center w-[11%]">Data</th>
            <th className="border border-black px-2 py-1 text-center w-[12%]">Horário de Chegada</th>
            <th className="border border-black px-2 py-1 text-center w-[12%]">Horário de Saída</th>
            <th className="border border-black px-2 py-1 text-center w-[47%]">Atividade</th>
            <th className="border border-black px-2 py-1 text-center w-[18%]">Assinatura</th>
          </tr>
        </thead>
        <tbody>
          {!isBlankTemplate &&
            activities.map((act, index) => {
              const isLast = index === totalDisplayRows - 1 && emptyRowsCount === 0;
              return (
                <tr key={act.id}>
                  <td className={`border border-black px-2 py-1 text-center ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}>
                    {formatDateBR(act.date)}
                  </td>
                  <td className={`border border-black px-2 py-1 text-center ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}>
                    {act.start}
                  </td>
                  <td className={`border border-black px-2 py-1 text-center ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}>
                    {act.end} ({act.hours}h)
                  </td>
                  <td className={`border border-black px-2 py-1 text-left ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}>
                    {act.description}
                  </td>
                  <td className={`border border-black px-2 py-1 text-center ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}></td>
                </tr>
              );
            })}

          {/* Linhas em branco de preenchimento */}
          {Array.from({ length: emptyRowsCount }).map((_, i) => {
            const isLast = i === emptyRowsCount - 1;
            return (
              <tr key={`empty-${i}`}>
                <td className={`border border-black px-2 py-1 text-center h-6 ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}></td>
                <td className={`border border-black px-2 py-1 text-center ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}></td>
                <td className={`border border-black px-2 py-1 text-center ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}></td>
                <td className={`border border-black px-2 py-1 text-left ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}></td>
                <td className={`border border-black px-2 py-1 text-center ${isLast ? 'border-b-[1.5px] border-b-black' : ''}`}></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Total de Horas */}
      <div className="text-[10.5pt] md:text-[11pt] font-bold text-black my-1">
        TOTAL: {isBlankTemplate ? 0 : totalHours} horas
      </div>

      {/* Notas de Rodapé Oficiais */}
      <div className="text-[7.5pt] text-gray-800 border-t border-gray-300 pt-1.5 leading-tight">
        <p>
          * Envio obrigatório até primeiro dia útil do mês posterior as atividades para o e-mail oficial do projeto. O não
          envio desta ficha devidamente preenchida no prazo estabelecido acarretará a não validação da bolsa.
        </p>
        <p className="mt-0.5">
          **Estudante, Orientador de Serviço, Preceptor, Tutor, Coordenador de GAT
        </p>
      </div>
    </div>
  );
}
