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
        const resPO = await model.generateContent(`Aja como um Product Owner Sênior. Sua saída deve ser EXCLUSIVAMENTE o documento de Critérios de Aceite em formato Gherkin para o requisito: ${requisito}. Proibido saudações, explicações ou frases de polidez.`);
        const textoPO = resPO.response.text();
        await delay(3000); 

        console.log("-> Agente QA...");
        const resQA = await model.generateContent(`Aja como QA Analyst Sênior. Com base nos critérios fornecidos, gere APENAS o Plano de Testes detalhado com Steps, Entradas e Resultados Esperados para Testes de UI. Proibido qualquer texto introdutório. Documento: ${textoPO}`);
        const textoQA = resQA.response.text();
        await delay(3000);

        console.log("-> Agente RM...");
        const resRM = await model.generateContent(`Aja como Release Manager. Produza EXCLUSIVAMENTE um Relatório Técnico de Release contendo: Sumário Executivo, Análise de Impacto em Produção e Notas de Versão (Release Notes). Sem introduções. Base: ${textoPO} e ${textoQA}`);
        const textoRM = resRM.response.text();
        await delay(3000);

        console.log("-> Agente Sizing...");
        const resSizing = await model.generateContent(`Aja como Gerente de Sizing. Gere APENAS uma tabela de esforço contendo: Perfis Sugeridos, Horas por Fase e aplicação de governança (15% Gestão / 10% Buffer). Saída puramente técnica. Base: ${textoQA}`);
        const textoSizing = resSizing.response.text();
        await delay(3000);

        console.log("-> Agente War Room...");
        const resWar = await model.generateContent(`Aja como Moderador de Comitê Técnico. Gere um diálogo estrito de 4 rodadas entre as áreas sobre Riscos de Regressão e Mitigação, finalizando com a Decisão de Deploy (GO/NO-GO). Base: ${textoPO}, ${textoQA} e ${textoSizing}`);
        const textoWarRoom = resWar.response.text();

       
        console.log(`✅ Sucesso com ${modeloFinal}`);
        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });

    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
