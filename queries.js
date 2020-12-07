const path = require('path');

const { writeFile, exists, normalizePath } = require('./helpers');

const generateImports = ({ modelsPath, modelName, routerFolderPath }) => {
  // create relative path to the models folder from absolute path
  const relativePath = path.relative(routerFolderPath, modelsPath);
  // win32 platform uses backslash ('\') as separator in the paths
  // normalize path if needed
  const normalizedPath = normalizePath(relativePath)
  return (`const { ${modelName} } = require('${normalizedPath}');`);
};

const generateCreate = ({ modelName }) => {
  return (`create(data) {
    return ${modelName}.create(data);
  }`)
};

const generateFindById = ({ modelName }) => {
  return (`findById(id) {
    return ${modelName}.findOne({
      where: { id },
    });
  }`)
};

const generateFindAll = ({ modelName }) => {
  return (`findAll() {
    return ${modelName}.findAll({});
  }`)
};

const generateUpdate = ({ modelName }) => {
  return (`updateById(id, data) {
    return ${modelName}.update(data, {
      where: { id },
    });
  }`)
};

const generateDelete = ({ modelName }) => {
  return (`destroyById(id) {
    return ${modelName}.destroy({
      where: { id },
    });
  }`)
};

const generateTemplate = ({ routerFolderPath, modelName, modelsPath }) => {
  const imports = generateImports({ modelsPath, modelName, routerFolderPath });
  const create = generateCreate({ modelName });
  const findById = generateFindById({ modelName });
  const findAll = generateFindAll({ modelName });
  const updateById = generateUpdate({ modelName });
  const destroyById = generateDelete({ modelName });
  return (`${imports}

module.exports = {
  ${create},

  ${findById},

  ${findAll},
  
  ${updateById},
  
  ${destroyById},
};
`);
};

const createQueryFile = async ({ routerFolderPath, modelName, modelsPath }) => {
  // check is file exists
  const fileName = `${routerFolderPath}/${modelName.toLowerCase()}.query.js`;
  const isFileExists = await exists(fileName);
  if (isFileExists) throw new Error(`${fileName} already exists`);
  // generate template and create file
  const template = generateTemplate({ routerFolderPath, modelName, modelsPath });
  return writeFile(fileName, template);
};

module.exports = {
  createQueryFile,
}