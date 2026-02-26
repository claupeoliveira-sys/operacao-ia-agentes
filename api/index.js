const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/processar", async (req, res) => {
    try {
        const { requisito } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // AGENTE 1: PO (Critérios de Aceite)
        const promptPO = `Aja como um Product Owner Sênior. Sua saída deve conter APENAS o documento técnico de Critérios de Aceite em Gherkin. Proibido introduções ou saudações. Requisito: ${requisito}`;
        const resultPO = await model.generateContent(promptPO);
        const textoPO = resultPO.response.text();

        // AGENTE 2: QA (Plano de Testes)
        const promptQA = `Aja como Analista de QA Sênior. Com base nos Critérios abaixo, gere APENAS o Plano de Testes estruturado. Sem diálogos. Critérios: ${textoPO}`;
        const resultQA = await model.generateContent(promptQA);
        const textoQA = resultQA.response.text();

        // AGENTE 3: RELEASE MANAGER (Relatório de Risco)
        const promptRM = `Aja como Release Manager. Gere um relatório executivo técnico para diretoria. Proibido introduções. ESTRUTURA: ### RELATÓRIO DE RELEASE | Escopo | Análise de Risco | Impacto. Referências: ${textoPO} e ${textoQA}`;
        const resultRM = await model.generateContent(promptRM);
        const textoRM = resultRM.response.text();

        // AGENTE 4: SIZING (Precificação)
        const promptSizing = `Aja como Gerente de Sizing e Costing. Gere uma estimativa técnica para faturamento. Proibido introduções. REGRAS: 15% Gestão e 10% Garantia. Referências: ${textoPO} e ${textoQA}`;
        const resultSizing = await model.generateContent(promptSizing);
        const textoSizing = resultSizing.response.text();

        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
