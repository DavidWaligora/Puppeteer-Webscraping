import fs from 'fs'


//functie filewrite
function fileWrite(data, path) {

  //controleren of file exists
  if (!fs.existsSync(path))
    //write file
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

export { fileWrite };
