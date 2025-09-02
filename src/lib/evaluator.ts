// Utilitário de avaliação de transcrição (WPM fornecido externamente)
// Regras:
// - Case sensitive
// - Remover todos os caracteres especiais excepto vírgula e ponto antes de tokenizar
// - Diferenças de acentos contam como erro completo (não há normalização)
// - WER = (S + I + D) / N_ref

export interface AlignmentItem {
  refWord?: string; // palavra de referência (pode faltar em inserções)
  typedWord?: string; // palavra digitada (pode faltar em omissões)
  op: 'correct' | 'sub' | 'ins' | 'del';
}

export interface EvaluationResult {
  wpm: number;
  wer: number; // 0..1
  precisionPercent: number; // 0..100
  substitutions: number;
  insertions: number;
  deletions: number;
  correct: number;
  referenceWordCount: number;
  typedWordCount: number;
  alignment: AlignmentItem[];
}

export interface EvaluateParams {
  reference: string; // transcript oficial
  typed: string; // texto escrito pelo utilizador
  wpm: number; // valor já calculado externamente e congelado
}

// Remove caracteres especiais excepto vírgula e ponto
function sanitize(raw: string): string {
  // Mantemos letras, números, espaços, vírgula e ponto. Substituímos restante por espaço.
  return raw
    .replace(/[\n\r\t]+/g, ' ') // normaliza whitespace
    .replace(/[^\p{L}\p{N} .,]+/gu, ' ') // remove especiais excepto espaço vírgula ponto
    .replace(/\s+/g, ' ') // colapsa espaços
    .trim();
}

function tokenize(raw: string): string[] {
  const cleaned = sanitize(raw);
  if (!cleaned) return [];
  return cleaned.split(' ');
}

// Calcula alinhamento por programação dinâmica (Levenshtein por palavras) guardando operações.
export function evaluateTranscription({ reference, typed, wpm }: EvaluateParams): EvaluationResult {
  const refTokens = tokenize(reference);
  const typedTokens = tokenize(typed);
  const n = refTokens.length;
  const m = typedTokens.length;

  // Matriz de custos
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const back: ('start' | 'del' | 'ins' | 'sub' | 'match')[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill('start'));

  for (let i = 1; i <= n; i++) {
    dp[i][0] = i; // deleções
    back[i][0] = 'del';
  }
  for (let j = 1; j <= m; j++) {
    dp[0][j] = j; // inserções
    back[0][j] = 'ins';
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refTokens[i - 1] === typedTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        back[i][j] = 'match';
      } else {
        const delCost = dp[i - 1][j] + 1; // deleção
        const insCost = dp[i][j - 1] + 1; // inserção
        const subCost = dp[i - 1][j - 1] + 1; // substituição
        const minCost = Math.min(delCost, insCost, subCost);
        dp[i][j] = minCost;
        if (minCost === subCost) back[i][j] = 'sub';
        else if (minCost === delCost) back[i][j] = 'del';
        else back[i][j] = 'ins';
      }
    }
  }

  // Retro-tracking
  let i = n; let j = m;
  const alignment: AlignmentItem[] = [];
  let substitutions = 0, insertions = 0, deletions = 0, correct = 0;
  while (i > 0 || j > 0) {
    const op = back[i][j];
    if (op === 'match') {
      alignment.push({ refWord: refTokens[i - 1], typedWord: typedTokens[j - 1], op: 'correct' });
      correct++; i--; j--;
    } else if (op === 'sub') {
      alignment.push({ refWord: refTokens[i - 1], typedWord: typedTokens[j - 1], op: 'sub' });
      substitutions++; i--; j--;
    } else if (op === 'del') {
      alignment.push({ refWord: refTokens[i - 1], op: 'del' });
      deletions++; i--;
    } else if (op === 'ins') {
      alignment.push({ typedWord: typedTokens[j - 1], op: 'ins' });
      insertions++; j--;
    } else { // start (shouldn't occur except at 0,0)
      break;
    }
  }
  alignment.reverse();

  const wer = n === 0 ? 0 : (substitutions + insertions + deletions) / n;
  const precisionPercent = Math.max(0, 100 * (1 - wer));

  return {
    wpm,
    wer,
    precisionPercent,
    substitutions,
    insertions,
    deletions,
    correct,
    referenceWordCount: n,
    typedWordCount: m,
    alignment,
  };
}
