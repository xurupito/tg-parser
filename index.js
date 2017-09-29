const fs = require("fs");
const xmlbuilder = require('xmlbuilder');
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
    // _generateGraphsWithWeightByYear(candidatos.getLegendas(), "tmp/candidatos/graph.json");
    _generateGraphsByState(candidatos.getLegendas(), "tmp/candidatos/graph.json");
    return;
  }
  let ext = filename.substring(filename.indexOf(".") + 1);
  let [,,year,fu] = filename.split("_");
  if (ext === "txt" && fu.split(".")[0] == 'PR') {
  // if (ext === "txt") {
    console.log("iniciando o parse do arquivo: " + _dirname_candidatos + filename);
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

const _generateGraphsWithWeight = (legendas, outputFilename) => {
  let graph = {};
  let now = new Date();

  for (let ano in legendas) {
    graph[ano] = {nodes: [], edges: []};
    for (let estado in legendas[ano]) {
      let grafo_estado = {nodes: [], edges: []};
      for (let idx = 0; idx < legendas[ano][estado].length; idx++) {
        coligacao = legendas[ano][estado][idx];

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




  let gexf_graph = {nodes: [], edges: []};
  for (let ano in graph) {
    for (let i = 0; i < graph[ano].nodes.length; i++) {
      let node = graph[ano].nodes[i];
      /* se o nodo ja existe, somente altera a data final dele */
      let n = gexf_graph.nodes.find(n => n["@label"] === node);
      if (n) {
        n["@end"] = ano;
      } else {
        gexf_graph.nodes.push({
          "@id": node,
          "@label": node,
          "@start": ano,
          "@end": ano
        });
      }
    }

    for (let i = 0; i < graph[ano].edges.length; i++) {
      let edge = graph[ano].edges[i];
      let a = edge.origem;
      let b = edge.destino;
      let e = gexf_graph.edges.find(e => e["@source"] === a && e["@target"] === b || e["@target"] === b && e["@source"] === a);
      if (e) {
        e.attvalues.attvalue.push({
          "@for": "weight",
          "@value": edge.peso,
          "@start": ano,
          "@end": ano
        });
      } else {
        gexf_graph.edges.push({
          "@id": "e-" + a + "-" + b,
          "@source": a,
          "@target": b,
          "attvalues": {
            "attvalue": [
              {
                "@for": "weight",
                "@value": edge.peso,
                "@start": ano,
                "@end": ano,
              }
            ]
          }
        });
      }
    }
  }

  let xmlObj = {
    "gexf": {
      "@xmlns": "http://www.gexf.net/1.3",
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "@xmlns:viz": "http://www.gexf.net/1.3/viz",
      "@xsi:schemaLocation": "http://www.gexf.net/1.3 http://www.gexf.net/1.3/gexf.xsd",
      "@version": "1.3",
      "meta": {
        "@lastmodifieddate": now.toISOString().slice(0,10),
        "creator": "TG Redes Sociais",
        "title": "A dança dos partidos"
      },
      "graph": {
        "@defaultedgetype": "undirected",
        "@mode": "dynamic",
        "@timeformat": "date",
        "attributes": {
          "@class": "edge",
          "@mode": "dynamic",
          "attribute": {
            "@id": "weight",
            "@type": "double",
            "@title": "Weight"
          }
        }
      },
      "nodes": {
        "node": gexf_graph.nodes
      },
      "edges": {
        "edge": gexf_graph.edges
      }
    }
  }


  let final_graph = xmlbuilder.create(xmlObj, { encoding: 'utf-8' })

  fs.writeFile(outputFilename, JSON.stringify(graph, null, 2), "utf8", function (err) {
    if (err) {console.log(err); return;}
    console.log("The file " + outputFilename + " was saved!");


    fs.writeFile(outputFilename + ".gexf", final_graph.end({ pretty: true }), 'utf8', function (err) {
      if (err) {console.log(err); return;}
      console.log("The file " + outputFilename + ".gexf was saved!");
    });
  });
};

const _generateGraphsWithWeightByYear = (legendas, outputFilename) => {
  let graph = {};
  let now = new Date();

  for (let ano in legendas) {
    graph[ano] = {nodes: [], edges: []};
    for (let estado in legendas[ano]) {
      let grafo_estado = {nodes: [], edges: []};
      for (let idx = 0; idx < legendas[ano][estado].length; idx++) {
        coligacao = legendas[ano][estado][idx];

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




  for (let ano in graph) {
    let gexf_graph = {nodes: [], edges: []};
    for (let i = 0; i < graph[ano].nodes.length; i++) {
      let node = graph[ano].nodes[i];
      gexf_graph.nodes.push({
        "@id": node,
        "@label": node
      });
    }

    for (let i = 0; i < graph[ano].edges.length; i++) {
      let edge = graph[ano].edges[i];
      gexf_graph.edges.push({
        "@id": "e-" + edge.origem + "-" + edge.destino + '-' + ano,
        "@source": edge.origem,
        "@target": edge.destino,
        "@weight": edge.peso
      });
    }


    // <graph mode="slice"  timerepresentation="timestamp" timestamp="1">

    let xmlObj = {
      "gexf": {
        "@xmlns": "http://www.gexf.net/1.3",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xmlns:viz": "http://www.gexf.net/1.3/viz",
        "@xsi:schemaLocation": "http://www.gexf.net/1.3 http://www.gexf.net/1.3/gexf.xsd",
        "@version": "1.3",
        "meta": {
          "@lastmodifieddate": now.toISOString().slice(0,10),
          "creator": "TG Redes Sociais",
          "title": "A dança dos partidos"
        },
        "graph": {
          "@defaultedgetype": "undirected",
          "@mode": "slice",
          "@timerepresentation": "timestamp",
          "@timestamp": ano,
        },
        "nodes": {
          "node": gexf_graph.nodes
        },
        "edges": {
          "edge": gexf_graph.edges
        }
      }
    }
    let final_graph = xmlbuilder.create(xmlObj, { encoding: 'utf-8' })

    fs.writeFileSync(outputFilename + ano + ".gexf", final_graph.end({ pretty: true }));

  }



  fs.writeFile(outputFilename, JSON.stringify(graph, null, 2), "utf8", function (err) {
    if (err) {console.log(err); return;}
    console.log("The file " + outputFilename + " was saved!");


    // fs.writeFile(outputFilename + ".gexf", final_graph.end({ pretty: true }), 'utf8', function (err) {
    //   if (err) {console.log(err); return;}
    //   console.log("The file " + outputFilename + ".gexf was saved!");
    // });
  });
};


const _generateGraphsByState = (legendas, outputFilename) => {
  let graph = {};
  let now = new Date();

  for (let ano in legendas) {
    graph[ano] = {nodes: [], edges: []};
      let grafo_estado = {nodes: [], edges: []};
      // console.log(ano, legendas[ano]['PR']);
      if (legendas[ano]['PR'] != undefined) {
      for (let idx = 0; idx < legendas[ano]['PR'].length; idx++) {
        coligacao = legendas[ano]['PR'][idx];

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




  for (let ano in graph) {
    let gexf_graph = {nodes: [], edges: []};
    for (let i = 0; i < graph[ano].nodes.length; i++) {
      let node = graph[ano].nodes[i];
      gexf_graph.nodes.push({
        "@id": node,
        "@label": node
      });
    }

    for (let i = 0; i < graph[ano].edges.length; i++) {
      let edge = graph[ano].edges[i];
      gexf_graph.edges.push({
        "@id": "e-" + edge.origem + "-" + edge.destino + '-' + ano,
        "@source": edge.origem,
        "@target": edge.destino,
        "@weight": edge.peso
      });
    }


    // <graph mode="slice"  timerepresentation="timestamp" timestamp="1">

    let xmlObj = {
      "gexf": {
        "@xmlns": "http://www.gexf.net/1.3",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xmlns:viz": "http://www.gexf.net/1.3/viz",
        "@xsi:schemaLocation": "http://www.gexf.net/1.3 http://www.gexf.net/1.3/gexf.xsd",
        "@version": "1.3",
        "meta": {
          "@lastmodifieddate": now.toISOString().slice(0,10),
          "creator": "TG Redes Sociais",
          "title": "A dança dos partidos"
        },
        "graph": {
          "@defaultedgetype": "undirected",
          "@mode": "slice",
          "@timerepresentation": "timestamp",
          "@timestamp": ano,
        },
        "nodes": {
          "node": gexf_graph.nodes
        },
        "edges": {
          "edge": gexf_graph.edges
        }
      }
    }
    let final_graph = xmlbuilder.create(xmlObj, { encoding: 'utf-8' })

    fs.writeFileSync(outputFilename + ano + ".gexf", final_graph.end({ pretty: true }));

  }



  fs.writeFile(outputFilename, JSON.stringify(graph, null, 2), "utf8", function (err) {
    if (err) {console.log(err); return;}
    console.log("The file " + outputFilename + " was saved!");


    // fs.writeFile(outputFilename + ".gexf", final_graph.end({ pretty: true }), 'utf8', function (err) {
    //   if (err) {console.log(err); return;}
    //   console.log("The file " + outputFilename + ".gexf was saved!");
    // });
  });
};



const parseLegendas = (filenames, index) => {
  let filename = filenames[index];
  if (!filename) {
    legendas.writeFile();
    // _generateGraphsWithWeight(legendas.getLegendas(), "tmp/legendas/graph.json");
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
