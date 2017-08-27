const fs = require("fs");
const parse = require("csv-parse");

let fileColumns = JSON.parse(fs.readFileSync("schemas/candidatos.json", 'utf8'));

let legendas = {},
    schema = [];
const parseFile = (inputFileName, federativeUnity, year) => {
// console.log("year: ", year);
  if (year < 2012) schema = fileColumns.previous;// console.log("<2012");
  else if (year < 2014) schema = fileColumns["2012"];// console.log("<2014");
  else if (year >= 2014) schema = fileColumns["2014"];// console.log(">=2014");

  if (!legendas.hasOwnProperty(year)) {
    legendas[year] = {};
  }

  const parser = parse({
    delimiter: ';',
    columns: schema,
    relax: true,
  }, (err, data) => {
    if (err) {console.log(err); return;}
    legendas[year][federativeUnity] = {};
    data.forEach(d => {
      // Faz algumas verificacoes para o criar os objetos onde as propriedades
      // ainda nao existem
      // if (!legendas.hasOwnProperty(d.sigla_uf)) legendas[d.sigla_uf] = {};
      let {descricao_cargo, sigla_partido, composicao_legenda} = d
      descricao_cargo = descricao_cargo.trim();
      sigla_partido = sigla_partido.trim().replace(/\s/g, "").toLowerCase();

      if (descricao_cargo != "GOVERNADOR") return;

      if (!legendas[year][federativeUnity].hasOwnProperty(descricao_cargo)) {
        legendas[year][federativeUnity][descricao_cargo] = {};
      }
      if (!legendas[year][federativeUnity][descricao_cargo].hasOwnProperty(sigla_partido)) {
        // remove o proprio partido antes
        let array = composicao_legenda.split('/').map(x => x.trim().replace(/\s/g, "").toLowerCase());
        array.splice(array.indexOf(sigla_partido), 1);
        legendas[year][federativeUnity][descricao_cargo][sigla_partido] = array;
      }
    });
  });

  return fs.createReadStream(inputFileName).pipe(parser);
};

const writeFile = (outputFilename = 'tmp/output.json') => {
  fs.writeFile(outputFilename, JSON.stringify(legendas, null, 2), 'utf8', function (err) {
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
