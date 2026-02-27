const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const delay = ms => new Promise(res => setTimeout(res, ms));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, profundidade } = req.body;
    const modeloFinal = "gemini-2.5-flash"; // Modelo fixo conforme solicitado

    // Definição da restrição de profundidade no prompt
    const regraProfundidade = {
        curta: "Seja extremamente conciso, use bullets curtos e foque apenas no essencial (superficial).",
        media: "Forneça um detalhamento intermediário, com explicações moderadas e estrutura padrão.",
        longa: "Forneça uma resposta exaustiva, profunda e detalhada, explorando todos os cenários possíveis."
    }[profundidade] || "Forneça uma resposta detalhada.";

    console.log(`[${new Date().toISOString()}] 🚀 Processando Profundidade: ${profundidade}`);

    try {
        const model = genAI.getGenerativeModel({ model: modeloFinal });

        console.log("-> Agente PO...");
        const resPO = await model.generateContent(`Aja como um Product Owner Sênior. Forneça Critérios de Aceite Gherkin para: ${requisito}. ${regraProfundidade} Proibido introduções.`);
        const textoPO = resPO.response.text();
        await delay(3000);

        console.log("-> Agente QA...");
        const resQA = await model.generateContent(`Aja como QA Analyst Sênior. Gere Plano de Testes UI (Steps/Resultados) baseado em: ${textoPO}. ${regraProfundidade} Proibido saudações.`);
        const textoQA = resQA.response.text();
        await delay(3000);

        console.log("-> Agente RM...");
        const resRM = await model.generateContent(`Aja como Release Manager. Produza Relatório de Impacto e Release Notes. Base: ${textoPO} e ${textoQA}. ${regraProfundidade}`);
        const textoRM = resRM.response.text();
        await delay(3000);

        console.log("-> Agente Sizing...");
        const resSizing = await model.generateContent(`Aja como Gerente de Sizing. Gere tabela de esforço (Perfis, Horas, +15% Gestão, +10% Buffer). Base: ${textoQA}. ${regraProfundidade}`);
        const textoSizing = resSizing.response.text();
        await delay(3000);

        console.log("-> Agente War Room...");
        const resWar = await model.generateContent(`Aja como Moderador Técnico. Diálogo de 4 falas sobre Riscos e Veredito GO/NO-GO. Base: ${textoPO}, ${textoQA} e ${textoSizing}. ${regraProfundidade}`);
        const textoWarRoom = resWar.response.text();

        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });

    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
