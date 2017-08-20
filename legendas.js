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
const _parse = (inputFileName, federativeUnity, year) => {
  schema = fileColumns.previous;

  const parser = parse({
    delimiter: ";",
    columns: schema
  }, (err, data) => {
    if (err) {console.log(err); return;}
    legendas[year] = {};
    data.forEach(d => {
      // if (year == "1998") console.log(d.composicao_legenda);
      // console.log(d);
      // Faz algumas verificacoes para o criar os objetos onde as propriedades
      // ainda nao existem
      if (!legendas[year].hasOwnProperty(d.descricao_cargo)) {
        legendas[year][d.descricao_cargo] = {};
      }
      if (!legendas[year][d.descricao_cargo].hasOwnProperty(d.sigla_partido)) {
        // remove o proprio partido antes
        let array = d.composicao_coligacao.split(" / ");
        array.splice(array.indexOf(d.sigla_partido), 1);
        legendas[year][d.descricao_cargo][d.sigla_partido] = array;
      }
    });
    // console.log(legendas);
  });
  return fs.createReadStream(inputFileName, {encoding: "latin1"}).pipe(parser);
};

const _writeFile = () => {
  fs.writeFile("tmp/legendas/geral_PR.json", JSON.stringify(legendas, null, 2), "latin1", function (err) {
    if (err) {console.log(err); return;}
    console.log("The file was saved!");
  });
};

module.exports = {
  parse: _parse,
  writeFile: _writeFile
};
