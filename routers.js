const { writeFile, exists } = require('./helpers');

const generateImports = ({ modelName }) => {
  return `const express = require('express');

  const {
    create,
    findById,
    findAll,
    updateById,
    destroyById,
  } = require('./${modelName.toLowerCase()}.controllers.js');
`
};

const generateTemplate = ({ modelName }) => {
  const imports = generateImports({ modelName });

  return (`${imports}

const router = express.Router();

/* --------------- POST --------------- */

router.post('/', create);

/* --------------- GET --------------- */

router.get('/:id', findById);

router.get('/', findAll);

/* --------------- PATCH --------------- */

router.patch('/:id', updateById);

/* --------------- DELETE --------------- */

router.delete('/:id', destroyById);

module.exports = router;
`);
};

const createRoutersFile = async ({ routerFolderPath, modelName }) => {
  // check is file exists
  const fileName = `${routerFolderPath}/index.js`;
  const isFileExists = await exists(fileName);
  if (isFileExists) throw new Error(`${fileName} already exists`);
  // generate template and create file
  const template = generateTemplate({ modelName });
  return writeFile(fileName, template);
};

module.exports = {
  createRoutersFile,
}