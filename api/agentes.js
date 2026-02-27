// DOCUMENTAÇÃO OFICIAL 2.0 - DEFINIÇÃO DOS AGENTES
const agentes = {
    po: (requisito) => `Aja como um Product Owner Sênior. Sua saída deve ser EXCLUSIVAMENTE o documento de Critérios de Aceite em formato Gherkin para o requisito: ${requisito}. Proibido saudações, explicações ou frases de polidez.`,

    qa: (textoPO) => `Aja como QA Analyst Sênior. Com base nos critérios fornecidos, gere APENAS o Plano de Testes detalhado com Steps, Entradas e Resultados Esperados para Testes de UI. Proibido qualquer texto introdutório. Documento: ${textoPO}`,

    rm: (textoPO, textoQA) => `Aja como Release Manager. Produza EXCLUSIVAMENTE um Relatório Técnico de Release contendo: Sumário Executivo, Análise de Impacto em Produção e Notas de Versão (Release Notes). Sem introduções. Base: ${textoPO} e ${textoQA}`,

    sizing: (textoQA) => `Aja como Gerente de Sizing. Gere APENAS uma tabela de esforço contendo: Perfis Sugeridos, Horas por Fase e aplicação de governança (15% Gestão / 10% Buffer). Saída puramente técnica. Base: ${textoQA}`,

    warroom: (textoPO, textoQA, textoSizing) => `Aja como Moderador de Comitê Técnico. Gere um diálogo estrito de 4 rodadas entre as áreas sobre Riscos de Regressão e Mitigação, finalizando com a Decisão de Deploy (GO/NO-GO). Base: ${textoPO}, ${textoQA} e ${textoSizing}`
};

module.exports = agentes;
