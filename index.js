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
  // let legendas = candidatos.getLegendas();
  let graph = {}, parana = {};
  // let myGexf = gexf.create({
  //   version: "1.0.1",
  //   meta: {
  //     creator: "Xurupito",
  //     lastmodifieddate: "2017-08-27+01:40",
  //     title: "A random graph"
  //   },
  //   mode: "static"
  //
    // model: {
    //   node: [
    //     {
    //       id: "authority",
    //       type: "float",
    //       title: "Authority"
    //     },
    //     {
    //       id: "name",
    //       type: "string",
    //       title: "Author's name"
    //     }
    //   ]
    // }
  // });
  // let teste = 0;
  for (let ano in legendas) {
    graph[ano] = {nodes: [], edges: []};
    for (let estado in legendas[ano]) {
      for (let partido in legendas[ano][estado].GOVERNADOR) {
        if (!findNode(graph[ano].nodes, partido)) graph[ano].nodes.push(partido);

        // if (ano === 2014 && estado === 'PR') {
        //   myGexf.addNode({
        //     id: partido,
        //     label: partido
        //     // attributes: {
        //     //   name: 'John',
        //     //   surname: 'Silver'
        //     // }
        //     // viz: {
        //     //   color: 'rgb(255, 234, 45)'
        //     // }
        //   });
        // }
        legendas[ano][estado].GOVERNADOR[partido].forEach(coligado => {
          if (!findNode(graph[ano].nodes, coligado)) graph[ano].nodes.push(coligado);

          // if (ano == 2014) {
          //   myGexf.addNode({
          //     id: coligado,
          //     label: coligado
          //   });
          //
          //
          //   myGexf.addEdge({
          //     id: 'e' + (teste++),
          //     source: partido,
          //     target: coligado
          //   });
          // }

          let a = findEdge(graph[ano].edges, partido, coligado);
          if (a) {
            a.peso++;
          } else {
            graph[ano].edges.push({origem: partido, destino: coligado, peso: 1});
          }
        });
      }
    }
  }

  fs.writeFile(outputFilename, JSON.stringify(graph, null, 2), 'utf8', function (err) {
    if (err) {console.log(err); return;}
    console.log("The file " + outputFilename + " was saved!");


    // fs.writeFile(outputFilename + ".gexf", myGexf.serialize(), 'utf8', function (err) {
    //   if (err) {console.log(err); return;}
    //   console.log("The file " + outputFilename + ".gexf was saved!");
    // });


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
const parseLegendas = (filenames, index) => {
  let filename = filenames[index];
  if (!filename) {
    legendas.writeFile();
    _generateGraphs(legendas.getLegendas(), "tmp/legendas/graph.json");
    return;
  }
  console.log("iniciando o parse do arquivo: " + _dirname_legendas + filename);
  let [,,year,fu] = filename.split("_");
  legendas.parseFile(_dirname_legendas + filename, fu.split(".")[0], year).on("end", () => parseLegendas(filenames, index + 1));
};

fs.readdir(_dirname_candidatos, (err, filenames) => {
  if (err) { console.log(err); return;}
  parseAllCandidatesFiles(filenames, 0);

  fs.readdir(_dirname_legendas, (err, filenames) => {
    if (err) { console.log(err); return;}
    parseLegendas(filenames, 0);
  });
});
