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

const findEdge = (edges, a, b) => {
  return edges.find(e => e.origem === a && e.destino === b || e.origem === b&& e.destino === a);
};

const findNode = (nodes, a) => {
  return nodes.find(n => n === a);
};

const _generateGraphs = () => {
  let legendas = candidatos.getLegendas();
  let edges = [], nodes = [];

  for (let estado in legendas) {
    for (let partido in legendas[estado].GOVERNADOR) {
      if (!findNode(nodes, partido)) nodes.push(partido);

      legendas[estado].GOVERNADOR[partido].forEach(coligado => {
        if (!findNode(nodes, coligado)) nodes.push(coligado);

        let a = findEdge(edges, partido, coligado);
        if (a) {
          a.peso++;
        } else {
          edges.push({origem: partido, destino: coligado, peso: 1});
        }
      });
    }
  }

  fs.writeFile('tmp/candidatos/graph.json', JSON.stringify({nodes, edges}, null, 2), 'utf8', function (err) {
    if (err) {console.log(err); return;}
    console.log("The file was saved!");
  });
};

let filenames = [
  "files/consulta_legendas_1990/CONSULTA_LEGENDA_1990_PR.txt",
  // "files/consulta_legendas_1994/consulta_legendas_1994_PR.txt",
  "files/consulta_legendas_1998/consulta_legendas_1998_PR.txt",
  "files/consulta_legendas_2002/consulta_legendas_2002_PR.txt",
  "files/consulta_legendas_2006/consulta_legendas_2006_PR.txt",
  "files/consulta_legendas_2010/consulta_legendas_2010_PR.txt",
  "files/consulta_legendas_2014/consulta_legendas_2014_PR.txt"
];
const parseLegendas = (index) => {
  let filename = filenames[index];
  if (!filename) {legendas.writeFile();return;}
  console.log("iniciando o parse do arquivo: " + _dirname + filename);
  let [,,,,year,fu] = filename.split("_");
  legendas.parse(filename, fu.split(".")[0], year).on("end", () => parseLegendas(index + 1));
};

fs.readdir(_dirname, (err, filenames) => {
  if (err) { console.log(err); return;}
//   parseLegendas(0);
  parseAllCandidatesFiles(filenames, 0);
});
