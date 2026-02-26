const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/processar", async (req, res) => {
    try {
        const { requisito } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // PROMPT AGENTE PO
        const promptPO = `Aja como PO Sênior. Gere APENAS Critérios de Aceite em Gherkin. Sem introduções. Requisito: ${requisito}`;
        const resultPO = await model.generateContent(promptPO);
        const textoPO = resultPO.response.text();

        // PROMPT AGENTE QA (Lê o PO)
        const promptQA = `Aja como QA Sênior. Gere APENAS Plano de Testes (ID, Passo, Resultado) baseado nisso: ${textoPO}`;
        const resultQA = await model.generateContent(promptQA);
        const textoQA = resultQA.response.text();

        // PROMPT AGENTE SIZING
        const promptSizing = `Aja como Sizing Manager. Gere estimativa de horas, perfis e níveis (Jr/Pl/Sr). Adicione 15% Gestão e 10% Garantia. Base: ${textoPO} e ${textoQA}`;
        const resultSizing = await model.generateContent(promptSizing);
        const textoSizing = resultSizing.response.text();

        res.json({ po: textoPO, qa: textoQA, sizing: textoSizing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
