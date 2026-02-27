const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const agentes = require("./agentes");
const app = express();
app.use(express.json());

const delay = ms => new Promise(res => setTimeout(res, ms));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, profundidade } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const resPO = await model.generateContent(agentes.po(requisito, profundidade));
        const textoPO = resPO.response.text();
        await delay(3000);

        const resQA = await model.generateContent(agentes.qa(textoPO, profundidade));
        const textoQA = resQA.response.text();
        await delay(3000);

        const resRM = await model.generateContent(agentes.rm(textoPO, textoQA, profundidade));
        const textoRM = resRM.response.text();
        await delay(3000);

        const resSizing = await model.generateContent(agentes.sizing(textoQA, profundidade));
        const textoSizing = resSizing.response.text();
        await delay(3000);

        const resWar = await model.generateContent(agentes.warroom(textoPO, textoQA, textoSizing, profundidade));
        const textoWarRoom = resWar.response.text();

        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
