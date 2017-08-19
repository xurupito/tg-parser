const fs = require('fs');
const parse = require('csv-parse');

let fileColumns = JSON.parse(fs.readFileSync("schemas/candidatos.json", 'utf8'));

let legenda = {};
const _parse = (inputFileName, federativeUnity, year) => {
  if (year in fileColumns) {
    schema = fileColumns[year];
  }

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
        legenda[federativeUnity][d.descricao_cargo][d.sigla_partido] = d.composicao_legenda.split(' / ');
      }
    });
    console.log(legenda);
    console.log('------------------------------');
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
