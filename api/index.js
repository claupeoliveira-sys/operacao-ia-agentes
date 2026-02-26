const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const delay = ms => new Promise(res => setTimeout(res, ms));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, modelo } = req.body;
    const modeloFinal = modelo || "gemini-2.5-flash";

    console.log(`[${new Date().toISOString()}] 🚀 Processando com: ${modeloFinal}`);

    try {
        const model = genAI.getGenerativeModel({ model: modeloFinal });

        console.log("-> Agente PO...");
        const resPO = await model.generateContent(`Aja como um Product Owner Sênior. Sua saída deve conter APENAS os Critérios de Aceite em formato Gherkin para o requisito: ${requisito}. Proibido introduções.`);
        const textoPO = resPO.response.text();
        await delay(3000); 

        console.log("-> Agente QA...");
        const resQA = await model.generateContent(`Aja como QA Analyst. Com base nos critérios abaixo, quebre o requisito em steps e gere APENAS os Casos de Teste de UI estruturados. Documento: ${textoPO}`);
        const textoQA = resQA.response.text();
        await delay(3000);

        console.log("-> Agente RM...");
        const resRM = await model.generateContent(`Aja como Release Manager. Analise o impacto e gere um Release Notes técnico e relevante para diretoria, focando no que é crítico. Base: ${textoPO} e ${textoQA}`);
        const textoRM = resRM.response.text();
        await delay(3000);

        console.log("-> Agente Sizing...");
        const resSizing = await model.generateContent(`Aja como Gerente de Sizing. Estime esforço em horas e perfis, aplicando governança de 15% Gestão e 10% Buffer para eficiência. Base: ${textoQA}`);
        const textoSizing = resSizing.response.text();
        await delay(3000);

        console.log("-> Agente War Room...");
        const resWar = await model.generateContent(`Aja como Moderador Técnico. Gere um diálogo de 4 falas entre PO, QA e Sizing discutindo riscos de regressão e decisão GO/NO-GO. Base: ${textoPO} e ${textoSizing}`);
        const textoWarRoom = resWar.response.text();

        console.log(`✅ Sucesso com ${modeloFinal}`);
        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });

    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
