/**
 * ============================================================================
 * PET-Saúde: Clima UFG — Extensão para Google Sheets
 * ============================================================================
 * Este script adiciona um menu interativo ao seu Google Sheets para inserir
 * novas linhas de atividades de forma 100% segura, sem quebrar fórmulas e
 * sem causar o erro de duplicação do TOTAL ao arrastar.
 * 
 * COMO INSTALAR NO GOOGLE SHEETS:
 * 1. Abra sua planilha de frequência no Google Sheets (online).
 * 2. No menu superior, clique em: Extensões > Apps Script.
 * 3. Apague qualquer código existente no editor, cole este código completo e clique no ícone de Salvar (💾).
 * 4. Recarregue a página da planilha (F5).
 * 5. Um novo menu chamado "🌿 PET-Saúde" aparecerá na barra de ferramentas!
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌿 PET-Saúde')
    .addItem('➕ Inserir Nova Linha de Atividade', 'inserirLinhaAtividade')
    .addItem('🔄 Recalcular e Reparar Fórmulas', 'repararFormulas')
    .addSeparator()
    .addItem('ℹ️ Sobre as Horas PET (Regra de Arredondamento)', 'mostrarInfoRegra')
    .addToUi();
}

/**
 * Insere uma nova linha vazia de atividade em 'Lançamentos' e espelha em 'Folha de Frequência'
 */
function inserirLinhaAtividade() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lancSheet = ss.getSheetByName('Lançamentos');
  const folhaSheet = ss.getSheetByName('Folha de Frequência');

  if (!lancSheet || !folhaSheet) {
    SpreadsheetApp.getUi().alert('Erro: Certifique-se de que as abas se chamam "Lançamentos" e "Folha de Frequência".');
    return;
  }

  // Encontra a linha de TOTAL em Lançamentos (coluna F com fórmula SUM)
  const lastRowLanc = lancSheet.getLastRow();
  let totalRowLanc = -1;
  for (let r = 10; r <= lastRowLanc; r++) {
    const val = String(lancSheet.getRange(r, 1).getValue());
    if (val.includes('Preencha esta aba') || val.includes('TOTAL')) {
      totalRowLanc = r;
      break;
    }
  }

  if (totalRowLanc === -1) {
    totalRowLanc = lastRowLanc;
  }

  // Insere nova linha acima do total em Lançamentos
  lancSheet.insertRowBefore(totalRowLanc);
  const newRowLanc = totalRowLanc;

  // Copia a fórmula de Horas PET para a coluna F da nova linha
  const formulaHoras = '=IF(OR(B' + newRowLanc + '="",C' + newRowLanc + '=""),"",IF(C' + newRowLanc + '=B' + newRowLanc + ',0,CEILING(B' + newRowLanc + '*24+MOD(C' + newRowLanc + '-B' + newRowLanc + ',1)*24,1)-FLOOR(B' + newRowLanc + '*24,1)))';
  lancSheet.getRange(newRowLanc, 6).setFormula(formulaHoras);
  lancSheet.getRange(newRowLanc, 1, 1, 6).setFontFamily('Arial').setFontSize(10);
  lancSheet.getRange(newRowLanc, 1).setNumberFormat('dd/mm/yyyy');
  lancSheet.getRange(newRowLanc, 2).setNumberFormat('hh:mm');
  lancSheet.getRange(newRowLanc, 3).setNumberFormat('hh:mm');

  // Ajusta a fórmula do TOTAL em Lançamentos para cobrir da linha 9 até a nova linha
  const newTotalRowLanc = totalRowLanc + 1;
  lancSheet.getRange(newTotalRowLanc, 6).setFormula('=SUM(F9:F' + newRowLanc + ')');

  // Agora espelha na aba Folha de Frequência
  const lastRowFolha = folhaSheet.getLastRow();
  let totalRowFolha = -1;
  for (let r = 10; r <= lastRowFolha; r++) {
    const val = String(folhaSheet.getRange(r, 1).getValue()).trim().toUpperCase();
    if (val.startsWith('TOTAL')) {
      totalRowFolha = r;
      break;
    }
  }

  if (totalRowFolha !== -1) {
    folhaSheet.insertRowBefore(totalRowFolha);
    const newRowFolha = totalRowFolha;

    folhaSheet.getRange(newRowFolha, 1).setFormula('=IF(\'Lançamentos\'!A' + newRowLanc + '="","\',\'Lançamentos\'!A' + newRowLanc + ')');
    folhaSheet.getRange(newRowFolha, 1).setFormula('=IF(\'Lançamentos\'!A' + newRowLanc + '="","\',\'Lançamentos\'!A' + newRowLanc + ')');
    folhaSheet.getRange(newRowFolha, 1).setFormula('=IF(\'Lançamentos\'!A' + newRowLanc + '="","",\'Lançamentos\'!A' + newRowLanc + ')');
    folhaSheet.getRange(newRowFolha, 2).setFormula('=IF(\'Lançamentos\'!B' + newRowLanc + '="","",\'Lançamentos\'!B' + newRowLanc + ')');
    folhaSheet.getRange(newRowFolha, 3).setFormula('=IF(OR(\'Lançamentos\'!B' + newRowLanc + '="",\'Lançamentos\'!C' + newRowLanc + '=""),"",TEXT(\'Lançamentos\'!C' + newRowLanc + ',"hh:mm")&" ("&\'Lançamentos\'!F' + newRowLanc + '&"h)")');
    folhaSheet.getRange(newRowFolha, 4).setFormula('=IF(\'Lançamentos\'!D' + newRowLanc + '="","",\'Lançamentos\'!D' + newRowLanc + ')');
    folhaSheet.getRange(newRowFolha, 5).setFormula('=IF(\'Lançamentos\'!E' + newRowLanc + '="","",\'Lançamentos\'!E' + newRowLanc + ')');

    // Atualiza TOTAL na Folha de Frequência
    const newTotalRowFolha = totalRowFolha + 1;
    folhaSheet.getRange(newTotalRowFolha, 2).setFormula('=SUM(\'Lançamentos\'!F9:F' + newRowLanc + ')&IF(SUM(\'Lançamentos\'!F9:F' + newRowLanc + ')=1," hora"," horas")');
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Nova linha de atividade inserida com sucesso!', '🌿 PET-Saúde', 3);
}

/**
 * Exibe explicação modal da regra de arredondamento de horas
 */
function mostrarInfoRegra() {
  const ui = SpreadsheetApp.getUi();
  const msg = '📌 Regra Oficial de Horas do PET-Saúde:\n\n' +
              '• Cada hora do relógio iniciada conta como 1 hora cheia.\n' +
              '• Exemplos práticos:\n' +
              '  - 14:00 às 15:30 = 2 horas\n' +
              '  - 13:30 às 17:30 = 5 horas\n' +
              '  - 19:00 às 20:07 = 2 horas\n' +
              '  - 15:00 às 16:00 = 1 hora\n\n' +
              'Cálculo Matemático: CEILING(Saída) - FLOOR(Chegada)\n' +
              'Carga horária semanal obrigatória: 8h semanais.';
  ui.alert('Regra de Cálculo de Horas PET', msg, ui.ButtonSet.OK);
}
