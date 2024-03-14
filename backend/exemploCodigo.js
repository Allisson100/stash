const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ROTAS -----------
app.use("/", (req, res) => {
  console.log("Dados da linha enviados para a rota:", req.body);
  res.send("SAlve");
});

//FUNCAO ----------------
async function processarLinhasDoCSV(caminhoArquivoCSV, rota) {
  const linhasNaoProcessadas = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(caminhoArquivoCSV)
      .pipe(csv())
      .on("data", async (linha) => {
        try {
          const response = await axios.post(rota, linha);
          if (response.status !== 200) {
            linhasNaoProcessadas.push(linha);
          }
        } catch (error) {
          console.error("Erro ao processar linha:", error);
          linhasNaoProcessadas.push(linha);
        }
      })
      .on("end", () => {
        resolve(linhasNaoProcessadas);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function salvarLinhasNaoProcessadas(
  linhasNaoProcessadas,
  caminhoArquivo
) {
  const conteudo = JSON.stringify(linhasNaoProcessadas, null, 2);
  fs.writeFileSync(caminhoArquivo, conteudo);
  console.log("Linhas não processadas salvas em", caminhoArquivo);
}

// Exemplo de uso
const caminhoArquivoCSV = path.join(__dirname, "/excel", "brands.csv");
const rotaDaAplicacao = "http://localhost:3030";
const caminhoArquivoSaida = path.join(__dirname, "/excel", "saida.json");

processarLinhasDoCSV(caminhoArquivoCSV, rotaDaAplicacao)
  .then((linhasNaoProcessadas) => {
    if (linhasNaoProcessadas.length > 0) {
      salvarLinhasNaoProcessadas(linhasNaoProcessadas, caminhoArquivoSaida);
    } else {
      console.log("Todas as linhas foram processadas com sucesso.");
    }
  })
  .catch((error) => {
    console.error("Erro ao processar linhas do CSV:", error);
  });

app.listen(3030, () => {
  console.log("Running");
});
