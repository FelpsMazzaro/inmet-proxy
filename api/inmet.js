import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
    try {
        // Buscar HTML da página do INMET
        const url = "https://portal.inmet.gov.br/paginas/catalogoaut";
        const response = await fetch(url);
        const html = await response.text();

        // Parsear HTML
        const dom = new JSDOM(html);
        const rows = dom.window.document.querySelectorAll("table tbody tr");

        const data = [];
        rows.forEach(row => {
            const cols = row.querySelectorAll("td");
            if (cols.length >= 5) {
                const codigo = cols[0].textContent.trim();
                const nome = cols[1].textContent.trim()
                    .toLowerCase()
                    .replace(/\b\w/g, l => l.toUpperCase());
                const estado = cols[2].textContent.trim();
                const latitude = parseFloat(cols[3].textContent.trim().replace(",", "."));
                const longitude = parseFloat(cols[4].textContent.trim().replace(",", "."));

                data.push({ codigo, nome, estado, latitude, longitude });
            }
        });

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar dados do INMET" });
    }
}
