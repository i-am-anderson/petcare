const BASE_DATE = new Date("2026-05-21T00:00:00.000Z");

// Encontra a ocorrência mais recente de um dia da semana, a partir de uma data de referência
const getAnchor = (reference, targetDayOfWeek) => {
  const anchor = new Date(reference);
  anchor.setUTCHours(0, 0, 0, 0);

  while (anchor.getUTCDay() !== targetDayOfWeek) {
    anchor.setUTCDate(anchor.getUTCDate() - 1);
  }

  return anchor;
};

const getDate = (date) => {
  const original = new Date(date);
  const dayOfWeek = original.getUTCDay();

  // Âncora do mesmo dia da semana mais próxima ANTES da BASE_DATE
  const baseAnchor = getAnchor(BASE_DATE, dayOfWeek);

  // Quantas semanas atrás a data original está da âncora base
  const diffMs = baseAnchor.getTime() - original.getTime();
  const weeksBack = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7));

  // Âncora equivalente a partir de hoje
  const todayAnchor = getAnchor(new Date(), dayOfWeek);

  // Aplica o mesmo offset de semanas
  const result = new Date(todayAnchor);
  result.setUTCDate(result.getUTCDate() - weeksBack * 7);

  // Preserva o horário original
  result.setUTCHours(
    original.getUTCHours(),
    original.getUTCMinutes(),
    original.getUTCSeconds(),
    original.getUTCMilliseconds()
  );

  return result.toISOString();
};

export default getDate;