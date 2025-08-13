import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  // Libera CORS para qualquer origem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Trata requisição OPTIONS (pré-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Busca a página HTML do catálogo do INMET
    const response = await fetch("https://portal.inmet.gov.br/paginas/catalogoaut");
    const html = await response.text();

    // Parse do HTML usando jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Pega todas as linhas da tabela
    const rows = [...document.querySelectorAll("table tbody tr")];

    // Converte para JSON
    const stations = rows.map(tr => {
      const cols = tr.querySelectorAll("td");
      return {
        codigo: cols[7]?.textContent.trim(),
        nome: cols[0]?.textContent.trim().toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase()),
        estado: cols[1]?.textContent.trim(),
        latitude: parseFloat(cols[3]?.textContent.replace(",", ".")),
        longitude: parseFloat(cols[4]?.textContent.replace(",", "."))
      };
    }).filter(s => s.codigo && !isNaN(s.latitude) && !isNaN(s.longitude));

    res.status(200).json(stations);

  } catch (error) {
    console.error("Erro ao buscar estações:", error);
    res.status(500).json({ error: "Erro ao buscar estações" });
  }
}
