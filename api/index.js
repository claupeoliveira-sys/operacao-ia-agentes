const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/processar", async (req, res) => {
    try {
        const { requisito } = req.body;
        if (!process.env.GEMINI_API_KEY) throw new Error("API KEY faltando nas variáveis de ambiente.");

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // AGENTE 1: PO
        const resultPO = await model.generateContent(`Aja como PO Sênior. Gere APENAS Critérios de Aceite em Gherkin. Sem saudações. Requisito: ${requisito}`);
        const textoPO = resultPO.response.text();

        // AGENTE 2: QA
        const resultQA = await model.generateContent(`Aja como Analista de QA. Gere APENAS o Plano de Testes estruturado baseado nos critérios: ${textoPO}`);
        const textoQA = resultQA.response.text();

        // AGENTE 3: RELEASE MANAGER
        const resultRM = await model.generateContent(`Aja como Release Manager. Gere um relatório técnico (Escopo, Risco, Impacto) baseado em: ${textoPO} e ${textoQA}`);
        const textoRM = resultRM.response.text();

        // AGENTE 4: SIZING (Baseado no seu Case de Sizing)
        const resultSizing = await model.generateContent(`Aja como Gerente de Sizing. Estime horas e perfis técnicos (Jr/Pl/Sr) com 15% Gestão e 10% Garantia. Referência: ${textoQA}`);
        const textoSizing = resultSizing.response.text();

        // AGENTE 5: WAR ROOM (A "Discussão" solicitada)
        const resultWarRoom = await model.generateContent(`Modere uma discussão técnica entre PO, QA e Sizing sobre este projeto. Gere 4 falas curtas e uma decisão final. Base: ${textoPO} e ${textoSizing}`);
        const textoWarRoom = resultWarRoom.response.text();

        // Retorno garantido como JSON
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            po: textoPO,
            qa: textoQA,
            rm: textoRM,
            sizing: textoSizing,
            warroom: textoWarRoom
        });

    } catch (error) {
        console.error("ERRO BACKEND:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
