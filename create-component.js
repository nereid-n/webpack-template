'use strict';

const fs = require('fs');
const path = require('path');
const createInterface = require('readline').createInterface;
const rl = createInterface(process.stdin, process.stdout);

// folder with all blocks
const BLOCKS_DIR = path.join(__dirname, 'src/components');

// //////////////////////////////////////////////////////////////////////////////////////////////////

// default content for files in new block
const fileSources = {
    pug: `mixin {blockName}()\n\tsection.{blockName}-wrap\n\t\t.container\n\t\t\t.{blockName}\n`,
    scss: ``,
};

function validateBlockName(blockName) {
    return new Promise((resolve, reject) => {
        const isValid = /^(\d|\w|\/|:|-)+$/.test(blockName);

        if (isValid) {
            resolve(isValid);
        } else {
            const errMsg = (
                `ERR>>> An incorrect block name '${blockName}'\n` +
                `ERR>>> A block name must include letters, numbers, slash, colon & the minus symbol.`
            );
            reject(errMsg);
        }
    });
}

function blockExist(blockPath, blockName) {
    return new Promise((resolve, reject) => {
        fs.stat(blockPath, notExist => {
            if (notExist) {
                resolve();
            } else {
                reject(`ERR>>> The block '${blockName}' already exists.`);
            }
        });
    });
}

function createBlock(blockPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(blockPath, err => {
            if (err) {
                reject(`ERR>>> Failed to create a folder '${blockPath}'`);
            } else {
                resolve();
            }
        });
    });
}

function createDir(blockName) {
    blockName = blockName.split('/');
    let blockPath = BLOCKS_DIR;
    const makeDir = (name) => {
        blockPath += `/${name}`;
        const blockExist = fs.existsSync(blockPath);
        if (!blockExist) {
            return createBlock(blockPath);
        }
    }
    const promises = blockName.map(name => makeDir(name));
    return Promise.all(promises);
}

function createFiles(blocksPath, blockName) {
    const promises = [];
    Object.keys(fileSources).forEach(ext => {
        const fileSource = fileSources[ext].replace(/\{blockName}/g, blockName);
        const filename = `${blockName}.${ext}`;
        const filePath = path.join(blocksPath, filename);
        promises.push(
            new Promise((resolve, reject) => {
                fs.writeFile(filePath, fileSource, 'utf8', err => {
                    if (err) {
                        reject(`ERR>>> Failed to create a file '${filePath}'`);
                    } else {
                        resolve();
                    }
                });
            })
        );
    });

    return Promise.all(promises);
}

function addStyle(blockName) {
    const content = `@import '../components/${blockName}/${blockName}';\n`;
    return fs.writeFileSync('./src/styles/imports.scss', content, { flag: 'a+' }, err => {
        if (err) {
            console.log(err);
        }
    });
}

function getFiles(blockPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(blockPath, (err, files) => {
            if (err) {
                reject(`ERR>>> Failed to get a file list from a folder '${blockPath}'`);
            } else {
                resolve(files);
            }
        });
    });
}

function writeToPage(path, blockName, fileName) {
    const fileData = fs.readFileSync(path, { encoding: "utf8" });
    const fileDataArray = fileData.split("\n");
    const newData = `include ../components/${blockName}/${blockName}`;

    fileDataArray.splice(1, 0, newData);
    fileDataArray.push(`\t+${fileName}()`);

    const newFileData = fileDataArray.join("\n");

    fs.writeFileSync(path, newFileData, { encoding: "utf8" });
}

function addComponent(pages, blockName, fileName) {
    if (pages) {
        for (let page of pages) {
            const path = `./src/views/${page}.pug`;
            writeToPage(path, blockName, fileName);
        }
    }
}

function printErrorMessage(errText) {
    console.log(errText);
    rl.close();
}

// //////////////////////////////////////////////////////////////////////////

function initMakeBlock(candidateBlockName) {
    const blockNames = candidateBlockName.trim().split(/\s+/);
    const makeBlock = blockName => {
        const args = blockName.split(':');
        blockName = args[0];
        const pages = args.slice(1);
        const blockPath = path.join(BLOCKS_DIR, blockName);
        const fileName = blockName.substring(blockName.lastIndexOf("/") + 1);
        return validateBlockName(blockName)
            .then(() => blockExist(blockPath, blockName))
            .then(() => createDir(blockName))
            .then(() => createFiles(blockPath, fileName))
            .then(() => addStyle(blockName))
            .then(() => addComponent(pages, blockName, fileName))
            .then(() => getFiles(blockPath))
            .then(files => {
                const line = '-'.repeat(48 + blockName.length);
                console.log(line);
                console.log(`The block has just been created in 'src/components/${blockName}'`);
                console.log(line);

                // Displays a list of files created
                files.forEach(file => console.log(file));

                rl.close();
            });
    };

    if (blockNames.length === 1) {
        return makeBlock(blockNames[0]);
    }

    const promises = blockNames.map(name => makeBlock(name));
    return Promise.all(promises);
}


// //////////////////////////////////////////////////////////////////////////
//
// Start here
//

// Command line arguments
const blockNameFromCli = process.argv
    .slice(2)
    // join all arguments to one string (to simplify the capture user input errors)
    .join(' ');

// If the user pass the name of the block in the command-line options
// that create a block. Otherwise - activates interactive mode
if (blockNameFromCli !== '') {
    initMakeBlock(blockNameFromCli).catch(printErrorMessage);
} else {
    rl.setPrompt('Block(s) name: ');
    rl.prompt();
    rl.on('line', (line) => {
        initMakeBlock(line).catch(printErrorMessage);
    });
}