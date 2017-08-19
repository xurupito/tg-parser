const fs = require('fs');
const parse = require('csv-parse');

let fileColumns = JSON.parse(fs.readFileSync("schemas/candidatos.json", 'utf8'));

let legenda = {};
const _parse = (inputFileName, federativeUnity, year) => {
  if (year < 2012) schema = fileColumns.previous;
  else if (year < 2014) schema = fileColumns["2012"];
  else if (year >= 2014) schema = fileColumns["2014"];

  const parser = parse({
    delimiter: ';',
    columns: schema
  }, (err, data) => {
    if (err) {console.log(err); return;}
    legenda[federativeUnity] = {};
    data.forEach(d => {
      ano_eleicao = d.ano_eleicao;
      // Faz algumas verificacoes para o criar os objetos onde as propriedades
      // ainda nao existem
      // if (!legenda.hasOwnProperty(d.sigla_uf)) legenda[d.sigla_uf] = {};
      if (!legenda[federativeUnity].hasOwnProperty(d.descricao_cargo)) {
        legenda[federativeUnity][d.descricao_cargo] = {};
      }
      if (!legenda[federativeUnity][d.descricao_cargo].hasOwnProperty(d.sigla_partido)) {
        // remove o proprio partido antes
        let array = d.composicao_legenda.split(' / ');
        array.splice(array.indexOf(d.sigla_partido), 1);
        legenda[federativeUnity][d.descricao_cargo][d.sigla_partido] = array;
      }
    });
  });

  return fs.createReadStream(inputFileName).pipe(parser);
}

const _writeFile = () => {
  fs.writeFile("tmp/candidatos/geral.json", JSON.stringify(legenda, null, 2), 'utf8', function (err) {
    if (err) {console.log(err); return;}
    console.log("The file was saved!");
  });
}


module.exports = {
  parse: _parse,
  writeFile: _writeFile
};
