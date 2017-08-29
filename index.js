const fs = require("fs");
const gexf = require("gexf");
const legendas = require("./legendas");
const candidatos = require("./candidatos");

const _dirname_candidatos = "files/candidatos/";
const _dirname_legendas = "files/legendas/";
// const _dirname_candidatos = "files/consulta_legendas_2014/";

/**
* funcao recursiva para ler todos os arquivos
* tem que ser feito assim pois, do contrario, há estouro de memoria
*/
const parseAllCandidatesFiles = (filenames, index) => {
  let filename = filenames[index];
  if (!filename) {
    candidatos.writeFile("tmp/candidatos/geral.json");
    _generateGraphs(candidatos.getLegendas(), "tmp/candidatos/graph.json");
    return;
  }
  let ext = filename.substring(filename.indexOf(".") + 1);
  if (ext === "txt") {
    console.log("iniciando o parse do arquivo: " + _dirname_candidatos + filename);
    let [,,year,fu] = filename.split("_");
    candidatos.parseFile(_dirname_candidatos + filename, fu.split(".")[0], year).on("end", () => parseAllCandidatesFiles(filenames, index + 1));
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

const _generateGraphs = (legendas, outputFilename) => {
  let graph = {};
  let myGexf = gexf.create({
    version: "1.0.1",
    meta: {
      creator: "TG Redes Sociais",
      lastmodifieddate: "2017-08-29+01:53",
      title: "A random graph"
    },
    mode: "static"
  });

  for (let ano in legendas) {
    graph[ano] = {nodes: [], edges: []};
    for (let estado in legendas[ano]) {
      let grafo_estado = {nodes: [], edges: []};
      for (let idx in legendas[ano][estado].GOVERNADOR) {
        coligacao = legendas[ano][estado].GOVERNADOR[idx];

        if (!findNode(graph[ano].nodes, coligacao[0])) graph[ano].nodes.push(coligacao[0]);
        for (let i = 0; i < coligacao.length - 1; i++) {
          for (let j = i + 1; j < coligacao.length; j++) {
            if (!findNode(graph[ano].nodes, coligacao[j])) graph[ano].nodes.push(coligacao[j]);
            let a = findEdge(graph[ano].edges, coligacao[i], coligacao[j]);
            if (a) {
              a.peso++;
            } else {
              graph[ano].edges.push({origem: coligacao[i], destino: coligacao[j], peso: 1});
            }
          }
        }
      }
    }
  }


  for ([partido] in graph["1994"].nodes) {
    myGexf.addNode({
      id: partido,
      label: partido,
      viz: {
        color: 'rgb(255, 234, 45)'
      }
    });
  }
  let edges = graph["1994"].edges;
  let len = edges.length;
  for (let i = 0; i < len; i++) {
    myGexf.addEdge({
      id: 'e' + edges[i].origem + edges[i].destino,
      source: edges[i].origem,
      target: edges[i].destino,
      weight: edges[i].peso
    });
  }

  fs.writeFile(outputFilename, JSON.stringify(graph, null, 2), 'utf8', function (err) {
    if (err) {console.log(err); return;}
    console.log("The file " + outputFilename + " was saved!");


    fs.writeFile(outputFilename + ".gexf", myGexf.serialize(), 'utf8', function (err) {
      if (err) {console.log(err); return;}
      console.log("The file " + outputFilename + ".gexf was saved!");
    });


  });
};

const parseLegendas = (filenames, index) => {
  let filename = filenames[index];
  if (!filename) {
    legendas.writeFile();
    // _generateGraphs(legendas.getLegendas(), "tmp/legendas/graph.json");
    return;
  }
  console.log("iniciando o parse do arquivo: " + _dirname_legendas + filename);
  let [,,year,fu] = filename.split("_");
  legendas.parseFile(_dirname_legendas + filename, fu.split(".")[0], year).on("end", () => parseLegendas(filenames, index + 1));
};

fs.readdir(_dirname_candidatos, (err, filenames) => {
  if (err) { console.log(err); return;}
  parseAllCandidatesFiles(filenames, 0);

  // fs.readdir(_dirname_legendas, (err, filenames) => {
  //   if (err) { console.log(err); return;}
  //   parseLegendas(filenames, 0);
  // });
});
