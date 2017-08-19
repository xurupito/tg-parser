const fs = require('fs');
// const legendas = require('./legendas');
const candidatos = require('./candidatos');

// legendas.parse('files/consulta_legendas_2014/consulta_legendas_2014_BR.txt');
const _dirname = 'files/consulta_cand_2014/';

/**
 * funcao recursiva para ler todos os arquivos
 * tem que ser feito assim pois, do contrario, há estouro de memoria
 */
const parseAllFiles = (filenames, index) => {
  let filename = filenames[index];
  if (!filename) {candidatos.writeFile(); return;}
  let ext = filename.substring(filename.indexOf('.') + 1);
  if (ext === 'txt') {
    console.log('iniciando o parse do arquivo: ' + _dirname + filename);
    let year, fu;
    [,,year,fu] = filename.split('_');
    candidatos.parse(_dirname + filename, fu.split('.')[0], year).on('end', () => parseAllFiles(filenames, index + 1));
  } else {
    parseAllFiles(filenames, index + 1);
  }
}

fs.readdir(_dirname, (err, filenames) => {
  if (err) { console.log(err); return;}
  parseAllFiles(filenames, 0);
});
