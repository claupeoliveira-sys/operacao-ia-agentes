const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, modelo } = req.body;
    const modeloFinal = modelo || "gemini-2.0-flash"; // Fallback caso não venha nada

    console.log(`[${new Date().toISOString()}] 🚀 Novo processamento solicitado usando: ${modeloFinal}`);

    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("Chave API não configurada.");

        // Inicializa o modelo selecionado pelo usuário
        const model = genAI.getGenerativeModel({ model: modeloFinal });

        console.log("-> Executando agentes em cascata...");

        // AGENTE 1: PO
        const resultPO = await model.generateContent(`Aja como um Product Owner Sênior. Sua saída deve conter APENAS os Critérios de Aceite (Acceptance Criteria) em formato Gherkin para o requisito: ${requisito}. Proibido introduções.`);
        const textoPO = resultPO.response.text();

        // AGENTE 2: QA
        const resultQA = await model.generateContent(`Aja como QA Analyst. Com base nos critérios abaixo, quebre o requisito em steps e gere APENAS os Casos de Teste de UI (UI Test Cases) estruturados. Documento: ${textoPO}`);
        const textoQA = resultQA.response.text();

        // AGENTE 3: RM
        const resultRM = await model.generateContent(`Aja como Release Manager. Analise o impacto e gere um Release Notes técnico e relevante para diretoria, focando no que é crítico para o produto. Base: ${textoPO} e ${textoQA}`;
        const textoRM = resultRM.response.text();

        // AGENTE 4: SIZING
        const resultSizing = await model.generateContent(`Aja como Gerente de Sizing. Estime o esforço em horas e perfis necessários, aplicando governança de 15% Gestão e 10% Buffer. Considere a meta de eficiência operacional. Base: ${textoPO} e ${textoQA} e ${textoRM}`;
        const textoSizing = resultSizing.response.text();

        // AGENTE 5: WAR ROOM
        const resultWarRoom = await model.generateContent(`Aja como Moderador Técnico. Gere um diálogo de 4 falas ao total e duas de cada vez, entre PO, QA e Sizing discutindo riscos de regressão e a decisão final de GO/NO-GO para o deploy. Base: ${textoPO} e ${textoSizing} e ${textoQA} e ${textoRM}`);
        const textoWarRoom = resultWarRoom.response.text();

        console.log(`✅ Sucesso total com o modelo ${modeloFinal}`);

        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });

    } catch (error) {
        console.error(`❌ ERRO NO MOTOR ${modeloFinal}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
