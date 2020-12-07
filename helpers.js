const fs = require('fs');
const { promisify } = require('util');

module.exports = {
  readDir: promisify(fs.readdir),
  readFile: promisify(fs.readFile),
  exists: promisify(fs.exists),
  makeDir: promisify(fs.mkdir),
  writeFile: promisify(fs.writeFile),
  normalizePath: (str) => str.replace(/\\/g, '/'),
  insertIndexDepends: (indexData, depends) => indexData.replace(/require\(.*\);?(\n|$)(?![.\n\r\s\S]*require)/img, `$&
  
/* --------------- INSERTED BY CRUD GENERATOR --------------- */

${depends}

/* ---------------------------------------------------------- */

`),
  insertIndexRoutes: (indexData, routes) => indexData.replace(/\b(?=module.exports)/gm, `

/* --------------- INSERTED BY CRUD GENERATOR --------------- */

${routes}

/* ---------------------------------------------------------- */

`),
}