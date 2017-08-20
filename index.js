const fs = require("fs");
// const legendas = require("./legendas");
const candidatos = require("./candidatos");

const _dirname = "files/consulta_cand_2014/";
// const _dirname = "files/consulta_legendas_2014/";

/**
* funcao recursiva para ler todos os arquivos
* tem que ser feito assim pois, do contrario, há estouro de memoria
*/
const parseAllCandidatesFiles = (filenames, index) => {
  let filename = filenames[index];
  if (!filename) {
    candidatos.writeFile("tmp/candidatos/geral.json");
    _generateGraphs();
    return;
  }
  let ext = filename.substring(filename.indexOf(".") + 1);
  if (ext === "txt") {
    console.log("iniciando o parse do arquivo: " + _dirname + filename);
    let [,,year,fu] = filename.split("_");
    candidatos.parseFile(_dirname + filename, fu.split(".")[0], year).on("end", () => parseAllCandidatesFiles(filenames, index + 1));
  } else {
    parseAllCandidatesFiles(filenames, index + 1);
  }
};

const _generateGraphs = () => {
  let legendas = candidatos.getLegendas();
};

fs.readdir(_dirname, (err, filenames) => {
  if (err) { console.log(err); return;}
//   parseLegendas(0);
  parseAllCandidatesFiles(filenames, 0);
});
