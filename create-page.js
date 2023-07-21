'use strict';

const fs = require('fs');
const path = require('path');
const createInterface = require('readline').createInterface;
const rl = createInterface(process.stdin, process.stdout);

// folder with all pages
const PAGES_DIR = path.join(__dirname, 'src/views');

// //////////////////////////////////////////////////////////////////////////////////////////////////

function validatePageName(blockName) {
    return new Promise((resolve, reject) => {
        const isValid = /^(\d|\w|\/|-)+$/.test(blockName);

        if (isValid) {
            resolve(isValid);
        } else {
            const errMsg = (
                `ERR>>> An incorrect page name '${blockName}'\n` +
                `ERR>>> A page name must include letters, numbers, slash & the minus symbol.`
            );
            reject(errMsg);
        }
    });
}

function pageExist(pagePath, pageName) {
    return new Promise((resolve, reject) => {
        fs.stat(pagePath, notExist => {
            if (notExist) {
                resolve();
            } else {
                reject(`ERR>>> The page '${pageName}' already exists.`);
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
    if (blockName.includes("/")) {
        blockName = blockName.split('/');
        let blockPath = PAGES_DIR;
        const makeDir = (name) => {
            const blockExist = fs.existsSync(blockPath);
            if (!blockExist) {
                return createBlock(blockPath);
            }
            blockPath += `/${name}`;
        }
        const promises = blockName.map(name => makeDir(name));
        return Promise.all(promises);
    }
}

function createFiles(pagePath, pageName) {
    const name = pageName[0].toUpperCase() + pageName.slice(1);
    const content = `extends ../components/layout/layout\n\nblock head\n\t- var pageTitle = '${name}';\n\nblock content\n`;
    return fs.writeFileSync(`${pagePath}.pug`, content, err => {
        if (err) {
            console.log(err);
        }
    });
}

function addPage(blockName, pageName) {
    const fileData = fs.readFileSync("webpack.config.js", { encoding: "utf8" });
    const fileDataArray = fileData.split("\n");
    const newData = `\t\t${pageName}: './src/views/${blockName}.pug,'`;
    const index = fileDataArray.findIndex(el => el.includes('entry')) + 1;

    fileDataArray.splice(index, 0, newData);

    const newFileData = fileDataArray.join("\n");

    fs.writeFileSync("webpack.config.js", newFileData, { encoding: "utf8" });
}

function printErrorMessage(errText) {
    console.log(errText);
    rl.close();
}

// //////////////////////////////////////////////////////////////////////////

function initMakePage(candidatePageName) {
    const pageNames = candidatePageName.trim().split(/\s+/);
    const makePage = blockName => {
        const pagePath = path.join(PAGES_DIR, blockName);
        const pageName = blockName.substring(blockName.lastIndexOf("/") + 1);
        return validatePageName(pageName)
            .then(() => pageExist(pagePath, blockName))
            .then(() => createDir(blockName))
            .then(() => createFiles(pagePath, pageName))
            .then(() => addPage(blockName, pageName))
            .then(() => {
                const line = '-'.repeat(48 + blockName.length);
                console.log(line);
                console.log(`The page has just been created`);
                console.log(line);

                rl.close();
            });
    };

    if (pageNames.length === 1) {
        return makePage(pageNames[0]);
    }

    const promises = pageNames.map(name => makePage(name));
    return Promise.all(promises);
}


// //////////////////////////////////////////////////////////////////////////
//
// Start here
//

// Command line arguments
const pageNameFromCli = process.argv
    .slice(2)
    // join all arguments to one string (to simplify the capture user input errors)
    .join(' ');

// If the user pass the name of the page in the command-line options
// that create a page. Otherwise - activates interactive mode
if (pageNameFromCli !== '') {
    initMakePage(pageNameFromCli).catch(printErrorMessage);
} else {
    rl.setPrompt('Page(s) name: ');
    rl.prompt();
    rl.on('line', (line) => {
        initMakePage(line).catch(printErrorMessage);
    });
}