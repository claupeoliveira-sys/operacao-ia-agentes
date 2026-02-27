const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const delay = ms => new Promise(res => setTimeout(res, ms));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, modelo } = req.body;
    const modeloFinal = modelo || "gemini-2.5-flash";

    try {
        const model = genAI.getGenerativeModel({ model: modeloFinal });

        console.log("-> Agente PO...");
        const resPO = await model.generateContent(agentes.po(requisito));
        const textoPO = resPO.response.text();
        await delay(3000);

        console.log("-> Agente QA...");
        const resQA = await model.generateContent(agentes.qa(textoPO));
        const textoQA = resQA.response.text();
        await delay(3000);

        console.log("-> Agente RM...");
        const resRM = await model.generateContent(agentes.rm(textoPO, textoQA));
        const textoRM = resRM.response.text();
        await delay(3000);

        console.log("-> Agente Sizing...");
        const resSizing = await model.generateContent(agentes.sizing(textoQA));
        const textoSizing = resSizing.response.text();
        await delay(3000);

        console.log("-> Agente War Room...");
        const resWar = await model.generateContent(agentes.warroom(textoPO, textoQA, textoSizing));
        const textoWarRoom = resWar.response.text();

        console.log(`✅ Sucesso com ${modeloFinal}`);
        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
