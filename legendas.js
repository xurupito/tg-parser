const fs = require("fs");
const parse = require("csv-parse");

let fileColumns = JSON.parse(fs.readFileSync("schemas/legendas.json", "utf8"));
let legendas = {};

// modelo de como vai ficar o objeto na saida
// {
//     PR: {
//         SENADOR: {
//             PT: ["psdb", "pc do b"],
//             PSDB: ["pt", "pc do b"]
//             PMDB: ["pdt", "dem"]
//         },
//         DEPUTADO: {
//             PT: ["psdb", "pc do b"],
//             psdb: ["pt", "pc do b"]
//             pmdb: ["pdt", "dem"]
//         }
//     }
// }
const parseFile = (inputFileName, federativeUnity, year) => {
  schema = fileColumns.previous;

  if (!legendas.hasOwnProperty(year)) {
    legendas[year] = {};
  }

  const parser = parse({
    delimiter: ";",
    columns: schema
  }, (err, data) => {
    if (err) {console.log(err); return;}
    legendas[year][federativeUnity] = {};
    data.forEach(d => {
      // Faz algumas verificacoes para o criar os objetos onde as propriedades
      // ainda nao existem
      let {composicao_coligacao, descricao_cargo, sigla_partido} = d;
      descricao_cargo = descricao_cargo.trim();
      sigla_partido = sigla_partido.trim().replace(/\s/g, "").toLowerCase();

      if (descricao_cargo != "GOVERNADOR") return;

      if (!legendas[year][federativeUnity].hasOwnProperty(descricao_cargo)) {
        legendas[year][federativeUnity][descricao_cargo] = {};
      }
      if (sigla_partido != "#nulo#" && !legendas[year][federativeUnity][descricao_cargo].hasOwnProperty(sigla_partido)) {
        // remove o proprio partido antes
        let array = composicao_coligacao.split("/").map(x => x.trim().replace(/\s/g, "").toLowerCase());
        array.splice(array.indexOf(sigla_partido), 1);
        legendas[year][federativeUnity][descricao_cargo][sigla_partido] = array;
      }
    });
    // console.log(legendas);
  });
  return fs.createReadStream(inputFileName, {encoding: "latin1"}).pipe(parser);
};

const writeFile = () => {
  fs.writeFile("tmp/legendas/geral_PR.json", JSON.stringify(legendas, null, 2), "latin1", function (err) {
    if (err) {console.log(err); return;}
    console.log("The file was saved!");
  });
};

const getLegendas = () => legendas;

module.exports = {
  parseFile,
  writeFile,
  getLegendas
};
