const path = require('path');

const {
  readDir,
  readFile,
  exists,
  makeDir,
  insertIndexDepends,
  insertIndexRoutes,
  writeFile,
} = require('./helpers');
const { createQueryFile } = require('./queries');
const { createControllersFile } = require('./controllers');
const { createRoutersFile } = require('./routers');

const modelNameRegex = /return\s*(?<modelName>[a-z]+)/mi;

const readModelsDir = async (path) => {
  const dir = await readDir(path);
  return dir.filter((item) => item !== 'index.js');
};

const readModule = (path) => readFile(path, 'utf-8');

const generateRoute = async ({ fileName, fileData, routesPath, modelsPath }) => {
  try {
    const { groups: { modelName } } = modelNameRegex.exec(fileData);
    const routerFolderPath = `${routesPath}/${modelName.toLowerCase()}`;
    // check is router folder exists and create if needed
    const isFolderExists = await exists(routerFolderPath);
    if (!isFolderExists) {
      await makeDir(routerFolderPath);
    }
    // create model.query.js file
    await createQueryFile({ routerFolderPath, modelName, modelsPath });
    await createControllersFile({ routerFolderPath, modelName });
    await createRoutersFile({ routerFolderPath, modelName });
    return modelName.toLowerCase();
  } catch (err) {
    console.info(err);
    return null;
  }
};

const generateIndexFile = async ({ routesPath, generatedRoutes }) => {
  // read index.js file
  const indexData = await readFile(`${routesPath}/index.js`, 'utf-8');
  // generate depends and routes
  const depends = generatedRoutes
    .map((routeName) => `const ${routeName}Router = require('./${routeName}');`)
    .join('\n');
  const routes = generatedRoutes
    .map((routeName) => `router.use('/${routeName}', ${routeName}Router);`)
    .join('\n');
  // insert generated depends and routes to index.js file
  const withDepends = insertIndexDepends(indexData, depends);
  const withAllData = insertIndexRoutes(withDepends, routes);

  return writeFile(`${routesPath}/index.js`, withAllData);
}

const main = async () => {
  try {
    const modelsPath = path.resolve(process.cwd(), 'models');
    const routesPath = path.resolve(process.cwd(), 'routes');

    const isRoutesFolderExists = await exists(routesPath);
    if (!isRoutesFolderExists) {
      await makeDir(routesPath);
    }

    const fileNames = await readModelsDir(modelsPath);

    const filesData = await Promise.all(fileNames.map(async (fileName) => {
      const fileData = await readModule(`${modelsPath}/${fileName}`);
      return {
        fileName,
        fileData,
      }
    }));
    const generatedRoutes = await Promise.all(filesData.map((item) => generateRoute({ routesPath, modelsPath, ...item })));
    await generateIndexFile({ routesPath, generatedRoutes });
  } catch (err) {
    console.error(err);
  }
}

main();