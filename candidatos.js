const fs = require("fs");
const parse = require("csv-parse");

let fileColumns = JSON.parse(fs.readFileSync("schemas/candidatos.json", 'utf8'));

let legendas = {};
const parseFile = (inputFileName, federativeUnity, year) => {
  if (year < 2012) schema = fileColumns.previous;
  else if (year < 2014) schema = fileColumns["2012"];
  else if (year >= 2014) schema = fileColumns["2014"];

  const parser = parse({
    delimiter: ';',
    columns: schema
  }, (err, data) => {
    if (err) {console.log(err); return;}
    legendas[federativeUnity] = {};
    data.forEach(d => {
      // Faz algumas verificacoes para o criar os objetos onde as propriedades
      // ainda nao existem
      // if (!legendas.hasOwnProperty(d.sigla_uf)) legendas[d.sigla_uf] = {};
      if (!legendas[federativeUnity].hasOwnProperty(d.descricao_cargo)) {
        legendas[federativeUnity][d.descricao_cargo] = {};
      }
      if (!legendas[federativeUnity][d.descricao_cargo].hasOwnProperty(d.sigla_partido)) {
        // remove o proprio partido antes
        let array = d.composicao_legenda.split(' / ');
        array.splice(array.indexOf(d.sigla_partido), 1);
        legendas[federativeUnity][d.descricao_cargo][d.sigla_partido] = array;
      }
    });
  });

  return fs.createReadStream(inputFileName).pipe(parser);
}

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
