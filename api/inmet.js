import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  try {
    const url = "https://portal.inmet.gov.br/paginas/catalogoaut";
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: "Erro ao acessar o site do INMET" });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    const estacoes = rows.map(row => {
      const cols = row.querySelectorAll("td");
      return {
        codigo: cols[7]?.textContent.trim(),
        nome: cols[0]?.textContent.trim().toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase()),
        estado: cols[1]?.textContent.trim(),
        latitude: parseFloat(cols[3]?.textContent.replace(",", ".")),
        longitude: parseFloat(cols[4]?.textContent.replace(",", "."))
      };
    }).filter(est => est.codigo && !isNaN(est.latitude) && !isNaN(est.longitude));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(estacoes);

  } catch (error) {
    console.error("Erro no handler:", error);
    return res.status(500).json({ error: "Erro ao processar dados" });
  }
}
