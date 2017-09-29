const fs = require("fs");
const parse = require("csv-parse");

let fileColumns = JSON.parse(fs.readFileSync("schemas/candidatos.json", 'utf8'));

const _findColigacao = (coligacoes, c) => {
   for (var i = 0;i<coligacoes.length;i++) {
     if (coligacoes[i].every(x => c.includes(x))) {
       return true
     }
   }
   return false;
 };

const trataCasosNormais = (data, year, federativeUnity) => {
  data.forEach(d => {
    // Faz algumas verificacoes para o criar os objetos onde as propriedades
    // ainda nao existem
    // if (!legendas.hasOwnProperty(d.sigla_uf)) legendas[d.sigla_uf] = {};
    let {num_turno, descricao_cargo, sigla_partido, composicao_legenda} = d

    // considerando somente o cargo de governador e primeiro turno de eleicao
    if (descricao_cargo != "DEPUTADO ESTADUAL" || num_turno != 1) return;

    sigla_partido = sigla_partido.trim().replace(/\s/g, "").toLowerCase();

    // if (!legendas[year][federativeUnity].hasOwnProperty(descricao_cargo)) {
    //   legendas[year][federativeUnity][descricao_cargo] = [];
    // }
    // if (!legendas[year][federativeUnity][descricao_cargo].hasOwnProperty(sigla_partido)) {
      // remove o proprio partido antes
      let coligacao;
      if (composicao_legenda == "#NULO#" || composicao_legenda == "#NE#") {
        coligacao = [sigla_partido];
      } else {
        coligacao = composicao_legenda.split('/').map(x => x.trim().replace(/\s/g, "").toLowerCase());
      }
      // coligacao.splice(coligacao.indexOf(sigla_partido), 1);
      if (!_findColigacao(legendas[year][federativeUnity], coligacao)){
        legendas[year][federativeUnity].push(coligacao);
      }
    // }
  });
};

const trataCasosAlternativos = (data, year, federativeUnity) => {
  // console.log('ano', year);
  let anoaux = {};
  anoaux[year] = {};

/*
  1998 - agrupar por sigla_legenda
  2006 e 2010 - agrupar por codigo_legenda
*/
  let agrupador;
  if (year == 1998) {
    agrupador = 'sigla_legenda';
  } else if (year == 2006 || year == 2010) {
    agrupador = 'codigo_legenda';
  }

  data.forEach(d => {
    // Faz algumas verificacoes para o criar os objetos onde as propriedades
    // ainda nao existem
    // if (!legendas.hasOwnProperty(d.sigla_uf)) legendas[d.sigla_uf] = {};
    let {num_turno, descricao_cargo, sigla_partido, codigo_legenda, sigla_legenda, composicao_legenda, nome_legenda} = d
    // considerando somente o cargo de governador e primeiro turno de eleicao
    if (descricao_cargo != "DEPUTADO ESTADUAL" || num_turno != 1) return;
    let chave = d[agrupador];
    // console.log('CHAVE', chave);
    // console.log({num_turno, descricao_cargo, sigla_partido, codigo_legenda, sigla_legenda, composicao_legenda, nome_legenda});

    sigla_partido = sigla_partido.trim().replace(/\s/g, "").toLowerCase();

    if (!anoaux[year].hasOwnProperty(chave)) {
      if (chave == '') {
        anoaux[year][sigla_partido] = [sigla_partido];
      } else {
        anoaux[year][chave] = [sigla_partido];
      }
    } else {
      if (!anoaux[year][chave].includes(sigla_partido)) {
        anoaux[year][chave].push(sigla_partido)
      }
    }
  });
  // console.log(anoaux);
  for (coligacao in anoaux[year]) {
    legendas[year][federativeUnity].push(anoaux[year][coligacao]);
  }
};

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
    legendas[year][federativeUnity] = [];
    if (year == 1998 || year == 2006 || year == 2010) {
      trataCasosAlternativos(data, year, federativeUnity);
    } else {
      trataCasosNormais(data, year, federativeUnity);
    }
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
