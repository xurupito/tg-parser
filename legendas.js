const fs = require('fs');
const parse = require('csv-parse');

const fileColumns = [
  'data_geracao', 'hora_geracao', 'ano_eleicao', 'num_turno',
  'descricao_eleicao', 'sigla_uf', 'sigla_ue', 'nome_ue', 'codigo_cargo',
  'descricao_cargo', 'tipo_legenda', 'num_partido', 'sigla_partido',
  'nome_partido', 'sigla_coligacao', 'nome_coligacao',
  'composicao_coligacao', 'sequencial_coligacao'
]

// let legenda = {};
let uf = '';
let ano_eleicao = '';

// modelo de como vai ficar o objeto
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
const parser = parse({
  delimiter: ';',
  columns: fileColumns
}, (err, data) => {
  let legenda = {};
  if (err) {console.log(err); return;}
  data.forEach(d => {
    uf = d.sigla_uf;
    ano_eleicao = d.ano_eleicao;
    // Faz algumas verificacoes para o criar os objetos onde as propriedades
    // ainda nao existem
    if (!legenda.hasOwnProperty(d.sigla_uf)) legenda[d.sigla_uf] = {};
    if (!legenda[d.sigla_uf].hasOwnProperty(d.descricao_cargo)) {
      legenda[d.sigla_uf][d.descricao_cargo] = {};
    }
    if (!legenda[d.sigla_uf][d.descricao_cargo].hasOwnProperty(d.sigla_partido)) {
      legenda[d.sigla_uf][d.descricao_cargo][d.sigla_partido] = d.composicao_coligacao.split(' / ');
    }
  });

  fs.writeFile("tmp/" + ano_eleicao + '-' + uf + ".json", JSON.stringify(legenda, null, 2), 'utf8', function (err) {
    if (err) { console.log(err); return;}
    console.log("The file was saved!");
  });
});

const _parse = (inputFileName) => fs.createReadStream(inputFileName).pipe(parser);

module.exports = {
  parse: _parse
}
