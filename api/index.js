const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        const resultPO = await model.generateContent(`Aja como um Product Owner Sênior. Gere Critérios de Aceite em Gherkin. Requisito: ${requisito}`);
        const textoPO = resultPO.response.text();

        // AGENTE 2: QA
        const resultQA = await model.generateContent(`Aja como Analista de QA Sênior. Gere Plano de Testes estruturado baseado em: ${textoPO}`);
        const textoQA = resultQA.response.text();

        // AGENTE 3: RM
        const resultRM = await model.generateContent(`Aja como Release Manager. Gere relatório executivo (Escopo, Risco, Impacto) baseado em: ${textoPO} e ${textoQA}`);
        const textoRM = resultRM.response.text();

        // AGENTE 4: SIZING
        const resultSizing = await model.generateContent(`Aja como Gerente de Sizing. Estime horas e perfis técnicos com 15% Gestão e 10% Buffer. Base: ${textoPO} e ${textoQA}`);
        const textoSizing = resultSizing.response.text();

        // AGENTE 5: WAR ROOM
        const resultWarRoom = await model.generateContent(`Aja como Moderador. Gere um diálogo de alinhamento de 4 falas entre PO, QA e Sizing discutindo o projeto. Base: ${textoPO}, ${textoQA} e ${textoSizing}`);
        const textoWarRoom = resultWarRoom.response.text();

        console.log(`✅ Sucesso total com o modelo ${modeloFinal}`);

        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });

    } catch (error) {
        console.error(`❌ ERRO NO MOTOR ${modeloFinal}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
