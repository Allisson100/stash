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

// ROTA para lidar com dados do corpo da requisição
app.post("/", async (req, res) => {
  try {
    console.log("Dados do corpo da requisição:", req.body);

    // Simula o tempo de processamento dos dados (2 segundos)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Aqui você pode adicionar o código para salvar os dados no banco de dados

    res.send(req.body);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

const caminhoArquivoCSV = path.join(__dirname, "/excel", "testeCopy.csv");
const rotaDaAplicacao = "http://localhost:3030";
const caminhoArquivoSaida = path.join(__dirname, "/excel", "saida.json");

processarCSV();

async function processarCSV() {
  try {
    const linhasNaoProcessadas = await processarLinhasDoCSV(
      caminhoArquivoCSV,
      rotaDaAplicacao
    );

    if (linhasNaoProcessadas.length > 0) {
      await salvarLinhasNaoProcessadas(
        linhasNaoProcessadas,
        caminhoArquivoSaida
      );
    } else {
      console.log("Todas as linhas foram processadas com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao processar linhas do CSV:", error);
  }
}

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
  try {
    const conteudo = JSON.stringify(linhasNaoProcessadas, null, 2);
    fs.writeFileSync(caminhoArquivo, conteudo);
    console.log("Linhas não processadas salvas em", caminhoArquivo);
  } catch (error) {
    console.error("Erro ao salvar linhas não processadas:", error);
  }
}

app.listen(3030, () => {
  console.log("Running");
});
