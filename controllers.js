const { writeFile, exists } = require('./helpers');

const generateImports = ({ modelName }) => {
  return (`const {
  create,
  findById,
  findAll,
  updateById,
  destroyById,    
} = require('./${modelName.toLowerCase()}.query.js');`);
};

const generateCreate = () => {
  return `async create(req, res) {
    try {
      const data = await create(req.body);
      res.status(201).send(data);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }`
};

const generateFindById = () => {
  return `async findById(req, res) {
    try {
      const { id } = req.params;
      const data = await findById(id);
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }`
};

const generateFindAll = () => {
  return `async findAll(req, res) {
    try {
      const data = await findAll();
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }`
};

const generateUpdateById = () => {
  return `async updateById(req, res) {
    try {
      const { id } = req.params;
      await updateById(id, req.body);
      res.sendStatus(200);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }`
};

const generateDestroyById = () => {
  return `async destroyById(req, res) {
    try {
      const { id } = req.params;
      await destroyById(id);
      res.sendStatus(200);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }`
};

const generateTemplate = ({ modelName }) => {
  const imports = generateImports({ modelName });
  const create = generateCreate();
  const findById = generateFindById();
  const findAll = generateFindAll();
  const updateById = generateUpdateById();
  const destroyById = generateDestroyById();
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

const createControllersFile = async ({ routerFolderPath, modelName }) => {
  // check is file exists
  const fileName = `${routerFolderPath}/${modelName.toLowerCase()}.controllers.js`;
  const isFileExists = await exists(fileName);
  if (isFileExists) throw new Error(`${fileName} already exists`);
  // generate template and create file
  const template = generateTemplate({ modelName });
  return writeFile(fileName, template);
};

module.exports = {
  createControllersFile,
}