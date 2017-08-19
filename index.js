const fs = require('fs');
const legendas = require('./legendas');
const candidatos = require('./candidatos');

// legendas.parse('files/consulta_legendas_2014/consulta_legendas_2014_BR.txt');
legendas.parse('files/consulta_legendas_2014/consulta_legendas_2014_PR.txt');
// legendas.parse('files/consulta_legendas_2010/consulta_legendas_2010_AC.txt');
// legendas.parse('files/consulta_legendas_2006/consulta_legendas_2006_AC.txt');

// candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_AC.txt', 'AC', 2014);
// candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_BR.txt', 'BR', 2014);
// candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_PR.txt', 'PR', 2014);
// candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_SP.txt', 'SP', 2014);

candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_AC.txt', 'AC', 2014)
  .on('end', () =>
    candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_BR.txt', 'BR', 2014)
      .on('end', () =>
        candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_PR.txt', 'PR', 2014)
            .on('end', () =>
              candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_SP.txt', 'SP', 2014)
              .on('end', () =>
                candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_RJ.txt', 'RJ', 2014)
                  .on('end', () => candidatos.writeFile())
))));
// candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_PR.txt', 'PR', 2014);
// candidatos.parse('files/consulta_cand_2014/consulta_cand_2014_SP.txt', 'SP', 2014);

// setTimeout(()=>candidatos.writeFile(), 1000);
// const _dirname = 'files/consulta_legendas_2014/';
// fs.readdir(_dirname, (err, filenames) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     // filenames.forEach((filename) => {
//     for (var i = 0; filename = filenames[i]; i++) {
//         var ext = filename.substring(filename.indexOf('.') + 1);
//         if (ext === 'txt') {
//             console.log(_dirname + filename);
//             legendas.parse(_dirname + filename);
//         }
//     }
//     // });
// });
