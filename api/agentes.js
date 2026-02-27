// VERSÃO CONSOLIDADA 3.1 - REPOSITÓRIO DE PROMPTS MODULARIZADOS
const agentes = {
    getRegra: (profundidade) => {
        return {
            curta: "Seja extremamente conciso, use bullets curtos e foque apenas no essencial (saída superficial).",
            media: "Forneça um detalhamento intermediário, com explicações moderadas e estrutura padrão corporativa.",
            longa: "Forneça uma resposta exaustiva, profunda e detalhada, explorando todos os cenários e exceções possíveis."
        }[profundidade] || "";
    },

    po: (req, prof) => `Aja como um Product Owner Sênior. Forneça EXCLUSIVAMENTE Critérios de Aceite Gherkin para: ${req}. ${agentes.getRegra(prof)} Proibido saudações ou polidez.`,

    qa: (po, prof) => `Aja como QA Analyst Sênior. Gere APENAS Plano de Testes UI (Steps/Resultados) baseado em: ${po}. ${agentes.getRegra(prof)} Sem textos introdutórios.`,

    rm: (po, qa, prof) => `Aja como Release Manager. Produza EXCLUSIVAMENTE Relatório de Impacto e Release Notes. Base: ${po} e ${qa}. ${agentes.getRegra(prof)}`,

    sizing: (qa, prof) => `Aja como Gerente de Sizing. Gere APENAS tabela de esforço (Perfis, Horas, +15% Gestão, +10% Buffer). Base: ${qa}. ${agentes.getRegra(prof)}`,

    warroom: (po, qa, sz, prof) => `Aja como Moderador Técnico. Gere diálogo de 4 falas sobre Riscos e Veredito GO/NO-GO. Base: ${po}, ${qa} e ${sz}. ${agentes.getRegra(prof)}`
};

module.exports = agentes;
