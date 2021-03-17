#!/usr/bin/env node
const inquirer = require('inquirer');
var colors = require('colors');
const fs = require('fs');
const { exec, spawn } = require('child_process');

const CHOICES = fs.readdirSync(`${__dirname}/templates`);

const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: CHOICES
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: function (input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else return 'Project name may only include letters, numbers, underscores and hashes.';
    }
  }
];

const CURR_DIR = process.cwd();

inquirer
  .prompt(QUESTIONS)
  .then(answers => {
    const projectChoice = answers['project-choice'];
    const projectName = answers['project-name'];
    const selectedTemplatePath = `${__dirname}/templates/${projectChoice}`;
    const newProjectPath = `${CURR_DIR}/${projectName}`;
    fs.mkdirSync(newProjectPath);

    createDirectoryContents(selectedTemplatePath, projectName);
    runInstall(newProjectPath);
  });

function createDirectoryContents (templatePath, newProjectPath) {
  const filesToCreate = fs.readdirSync(templatePath);
  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, 'utf8');

      // Rename
      if (file === '.npmignore') file = '.gitignore';

      const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

      // recursive call
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
}

async function runInstall(newProjectPath) {
  try {
    const cmdString = 'yarn';
    console.log(`Using ${colors.yellow(cmdString)} to install dependencies.\n`);
    // Make sure this is a node project before executing yarn/npm install.
    if (fs.existsSync(`${newProjectPath}/package.json`)) {
      const child = spawn(cmdString, ['install'], { cwd: newProjectPath });
      console.log(colors.white('Copied template files and now installing dependencies...\n'));
      child.stdout.on('data', (chunk) => {
        console.log( '\t', colors.yellow(chunk.toString()) );
        // data from the standard output is here as buffers
      });
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`${colors.green('Success!')} Project is created here: ${colors.cyan(newProjectPath)}`);
        }
      });

    }
  } catch(err) {
    console.error(err)
  }
}
