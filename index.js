const inquirer = require('inquirer');

module.exports = sortofu;

function sortofu(list) {
  return new Promise(resolve => {
    exec(list).then(sorted => {
      resolve(sorted);
    });
  });

  function exec(list) {
    return new Promise(resolve => {
      select(list).then(answers => {
        const items = answers.items;
        const proc = answers.proc;
        const cont = answers.cont;
        const _list = createProcess(list)[proc](items);

        if (cont === 'yes') {
          exec(_list).then(newList => {
            resolve(newList);
          });
        } else {
          resolve(_list);
        }
      });
    });
  }

  function createProcess(list) {
    return {
      slide(items) {
        const first = items[0];
        const firstIdx = list.indexOf(first);
        const second = items[1];
        const secondIdx = list.indexOf(second);

        list.splice(firstIdx, 1);
        list.splice(secondIdx, 0, first);
        return list;
      },

      swap(items) {
        const first = items[0];
        const firstIdx = list.indexOf(first);
        const second = items[1];
        const secondIdx = list.indexOf(second);

        list.splice(firstIdx, 1);
        list.splice(firstIdx, 0, second);
        list.splice(secondIdx, 1);
        list.splice(secondIdx, 0, first);
        return list;
      },
    }
  }
}

function select(list) {
  'use strict';

  const items = list.map(item => {
    return {name: item};
  });

  const itemQuestion = {
    type: 'checkbox',
    choices: items,
    validate(answer) {
      if (answer.length === 1) {
        return true;
      }
      return false;
    }
  }

  const processQuestion = {
    type: 'rawlist',
    message: 'Select a process',
    name: 'process',
    choices: [
      'slide',
      'swap'
    ]
  };

  const continueQuestion = {
    type: 'expand',
    message: 'Continue ?',
    name: 'continue',
    choices: [
      {
        key: 'y',
        name: 'yes',
        value: 'yes'
      },
      {
        key: 'n',
        name: 'no',
        value: 'no'
      }
    ]
  }

  return new Promise(resolve => {
    inquirer.prompt([
      Object.assign({}, itemQuestion, {
        name: 'firstItem',
        message: 'Select primitive item'
      })
    ])
      .then(answers => {
        const firstItem = answers.firstItem[0];
        let idx = 0;
        for (const item of items) {
          if (item.name === firstItem) {
            items.splice(idx, 1);
            break;
          }
          idx++;
        }

        inquirer.prompt([
          Object.assign({}, itemQuestion, {
            name: 'secondItem',
            message: 'Select target item',
          }),
          processQuestion,
          continueQuestion
        ])
          .then(answers => {
            resolve({
              items: [firstItem, answers.secondItem[0]],
              proc: answers.process,
              cont: answers.continue
            });
          });
      })
  });
}
