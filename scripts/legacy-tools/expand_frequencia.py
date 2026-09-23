#!/usr/bin/env python3
"""
Script de expansão e correção de fórmulas da Folha de Frequência Mensal do PET-Saúde.
Expande a capacidade de 7 atividades para 35 atividades (linhas 9 a 43 em Lançamentos,
e 10 a 44 em Folha de Frequência), ajusta o TOTAL e evita o erro de soma mágica ao arrastar.
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from copy import copy

SOURCE_FILE = 'PET - Folha de Frequência Mensal.xlsx'
OUTPUT_FILE = 'PET - Folha de Frequência Mensal.xlsx'

def fix_and_expand():
    wb = openpyxl.load_workbook(SOURCE_FILE)
    ws_folha = wb['Folha de Frequência']
    ws_lanc = wb['Lançamentos']

    print("Carregado arquivo:", SOURCE_FILE)

    # 1. Unmerge de linhas que serão movidas/limpas primeiro
    for m in list(ws_lanc.merged_cells.ranges):
        if any(f':{col}17' in str(m) or f'{col}17:' in str(m) or str(m) == 'A17:E17' for col in ['A','B','C','D','E','F']):
            ws_lanc.unmerge_cells(str(m))

    for m in list(ws_folha.merged_cells.ranges):
        s = str(m)
        if any(x in s for x in ['18', '24', '25']):
            ws_folha.unmerge_cells(s)

    # 2. Obter estilos de referência de Lançamentos (linha 10)
    ref_font_lanc = {c: copy(ws_lanc.cell(10, c).font) for c in range(1, 7)}
    ref_border_lanc = {c: copy(ws_lanc.cell(10, c).border) for c in range(1, 7)}
    ref_align_lanc = {c: copy(ws_lanc.cell(10, c).alignment) for c in range(1, 7)}
    ref_numfmt_lanc = {c: ws_lanc.cell(10, c).number_format for c in range(1, 7)}

    # Limpar linha 17 de Lançamentos
    for c in range(1, 7):
        ws_lanc.cell(16, c).value = None
        ws_lanc.cell(17, c).value = None

    # Preencher linhas 9 a 43 em Lançamentos (35 linhas de atividades)
    for r in range(9, 44):
        for c in range(1, 7):
            cell = ws_lanc.cell(r, c)
            if c in ref_font_lanc:
                cell.font = copy(ref_font_lanc[c])
                cell.border = copy(ref_border_lanc[c])
                cell.alignment = copy(ref_align_lanc[c])
                cell.number_format = ref_numfmt_lanc[c]
        
        # Fórmula de Horas PET na coluna F
        ws_lanc.cell(r, 6).value = f'=IF(OR(B{r}="",C{r}=""),"",IF(C{r}=B{r},0,CEILING(B{r}*24+MOD(C{r}-B{r},1)*24,1)-FLOOR(B{r}*24,1)))'
        ws_lanc.cell(r, 6).number_format = '0'

    # Linha 45 de Lançamentos: Total e Instrução
    total_row_lanc = 45
    ws_lanc.cell(total_row_lanc, 1).value = 'Preencha esta aba. A folha oficial é atualizada automaticamente. Cada hora do relógio iniciada conta como 1h (ex.: 14:00–15:30 = 2h; 13:30–17:30 = 5h).'
    ws_lanc.cell(total_row_lanc, 1).font = Font(name='Arial', size=9, italic=True)
    ws_lanc.cell(total_row_lanc, 6).value = '=SUM(F9:F43)'
    ws_lanc.cell(total_row_lanc, 6).font = Font(name='Arial', size=11, bold=True)
    ws_lanc.cell(total_row_lanc, 6).alignment = Alignment(horizontal='right')
    ws_lanc.cell(total_row_lanc, 6).number_format = '0" h"'
    ws_lanc.merge_cells(f'A{total_row_lanc}:E{total_row_lanc}')

    # 3. Obter estilos de referência de Folha de Frequência (linha 11)
    ref_font_folha = {c: copy(ws_folha.cell(11, c).font) for c in range(1, 6)}
    ref_border_folha = {c: copy(ws_folha.cell(11, c).border) for c in range(1, 6)}
    ref_align_folha = {c: copy(ws_folha.cell(11, c).alignment) for c in range(1, 6)}
    ref_numfmt_folha = {c: ws_folha.cell(11, c).number_format for c in range(1, 6)}

    # Limpar linhas 17 a 30 de Folha de Frequência
    for r in range(17, 30):
        for c in range(1, 6):
            cell = ws_folha.cell(r, c)
            if not isinstance(cell, openpyxl.cell.cell.MergedCell):
                cell.value = None

    # Preencher linhas 10 a 44 em Folha de Frequência (correspondem às linhas 9 a 43 de Lançamentos)
    for idx, r_folha in enumerate(range(10, 45)):
        r_lanc = 9 + idx
        for c in range(1, 6):
            cell = ws_folha.cell(r_folha, c)
            cell.font = copy(ref_font_folha[c])
            cell.border = copy(ref_border_folha[c])
            cell.alignment = copy(ref_align_folha[c])
            cell.number_format = ref_numfmt_folha[c]

        ws_folha.cell(r_folha, 1).value = f"=IF('Lançamentos'!A{r_lanc}=\"\",\"\",'Lançamentos'!A{r_lanc})"
        ws_folha.cell(r_folha, 2).value = f"=IF('Lançamentos'!B{r_lanc}=\"\",\"\",'Lançamentos'!B{r_lanc})"
        ws_folha.cell(r_folha, 3).value = f"=IF(OR('Lançamentos'!B{r_lanc}=\"\",'Lançamentos'!C{r_lanc}=\"\"),\"\",TEXT('Lançamentos'!C{r_lanc},\"hh:mm\")&\" (\"&'Lançamentos'!F{r_lanc}&\"h)\")"
        ws_folha.cell(r_folha, 4).value = f"=IF('Lançamentos'!D{r_lanc}=\"\",\"\",'Lançamentos'!D{r_lanc})"
        ws_folha.cell(r_folha, 5).value = f"=IF('Lançamentos'!E{r_lanc}=\"\",\"\",'Lançamentos'!E{r_lanc})"

    # Linha TOTAL em Folha de Frequência (linha 46)
    total_row_folha = 46
    thin_border = Border(
        left=Side(style='thin', color='000000'),
        right=Side(style='thin', color='000000'),
        top=Side(style='thin', color='000000'),
        bottom=Side(style='thin', color='000000')
    )
    for c in range(1, 6):
        ws_folha.cell(total_row_folha, c).border = thin_border

    ws_folha.cell(total_row_folha, 1).value = 'TOTAL:'
    ws_folha.cell(total_row_folha, 1).font = Font(name='Arial', size=11, bold=True)
    ws_folha.cell(total_row_folha, 1).alignment = Alignment(horizontal='center', vertical='center')

    ws_folha.cell(total_row_folha, 2).value = f'=SUM(\'Lançamentos\'!F9:F43)&IF(SUM(\'Lançamentos\'!F9:F43)=1," hora"," horas")'
    ws_folha.cell(total_row_folha, 2).font = Font(name='Arial', size=11, bold=True)
    ws_folha.cell(total_row_folha, 2).alignment = Alignment(horizontal='left', vertical='center')
    ws_folha.merge_cells(f'B{total_row_folha}:C{total_row_folha}')

    # Rodapé em Folha de Frequência
    rodape_1 = total_row_folha + 4  # linha 50
    rodape_2 = rodape_1 + 1         # linha 51

    ws_folha.cell(rodape_1, 1).value = '* Envio obrigatório até primeiro dia útil do mês posterior as atividades para o e-mail oficial do projeto. O não envio desta ficha devidamente preenchida no prazo estabelecido acarretará a não validação da bolsa.'
    ws_folha.cell(rodape_1, 1).font = Font(name='Arial', size=8, italic=True)
    ws_folha.merge_cells(f'A{rodape_1}:E{rodape_1}')

    ws_folha.cell(rodape_2, 1).value = '**Estudante, Orientador de Serviço, Preceptor, Tutor, Coordenador de GAT'
    ws_folha.cell(rodape_2, 1).font = Font(name='Arial', size=8, italic=True)
    ws_folha.merge_cells(f'A{rodape_2}:E{rodape_2}')

    wb.save(OUTPUT_FILE)
    print("Sucesso! Planilha expandida e salva com segurança em:", OUTPUT_FILE)

if __name__ == '__main__':
    fix_and_expand()
