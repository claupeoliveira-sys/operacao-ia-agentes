const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

app.post("/api/processar", async (req, res) => {
    try {
        const { requisito } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) throw new Error("API Key não configurada na Vercel.");
        if (!requisito) throw new Error("Requisito não fornecido.");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Execução em paralelo para ganhar velocidade
        const [resPO, resQA] = await Promise.all([
            model.generateContent(`Aja como PO Sênior. Gere APENAS Critérios de Aceite em Gherkin. Sem introduções. Requisito: ${requisito}`),
            model.generateContent(`Aja como QA Sênior. Gere APENAS Plano de Testes (ID, Passo, Resultado) baseado no requisito: ${requisito}`)
        ]);

        const textoPO = resPO.response.text();
        const textoQA = resQA.response.text();

        // Terceiro agente (Sizing) usa o contexto dos dois anteriores
        const resSizing = await model.generateContent(`Aja como Sizing Manager. Gere estimativa de horas, perfis (Jr/Pl/Sr). Adicione 15% Gestão e 10% Garantia. Base técnico: ${textoPO} e ${textoQA}`);
        const textoSizing = resSizing.response.text();

        res.json({ po: textoPO, qa: textoQA, sizing: textoSizing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
