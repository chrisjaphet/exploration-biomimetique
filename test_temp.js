const fs = require('fs');

const mockElement = (name = 'element') => ({
  name,
  classList: {
    add(cls) { console.log(`Mock: classList.add on ${name} - ${cls}`); },
    remove(cls) { console.log(`Mock: classList.remove on ${name} - ${cls}`); },
    contains(cls) { return false; },
    toggle(cls) { console.log(`Mock: classList.toggle on ${name} - ${cls}`); }
  },
  style: {},
  dataset: {},
  appendChild(child) {
    // console.log(`Mock: appendChild to ${name}`);
  },
  addEventListener(event, cb) {
    // console.log(`Mock: addEventListener on ${name} for ${event}`);
  }
});

global.Image = function() {
  return mockElement('img');
};

global.localStorage = {
  getItem(key) { return null; },
  setItem(key, value) {}
};

// Mock browser globals
global.window = global;
global.addEventListener = function(event, cb) {
  // console.log(`Mock: window.addEventListener for ${event}`);
};
global.document = {
  listeners: {},
  addEventListener(event, callback) {
    this.listeners[event] = callback;
  },
  getElementById(id) {
    // console.log('Mock: getElementById', id);
    return mockElement('#' + id);
  },
  querySelectorAll(selector) {
    // console.log('Mock: querySelectorAll', selector);
    return [mockElement(selector)];
  },
  createElement(tag) {
    // console.log('Mock: createElement', tag);
    return mockElement(tag);
  }
};

// Load and execute data.js and script.js together
const dataCode = fs.readFileSync('data.js', 'utf8');
const scriptCode = fs.readFileSync('script.js', 'utf8');

const fullCode = dataCode + '\n' + scriptCode + '\nglobal.state = state;\n';
eval(fullCode);

// Trigger DOMContentLoaded
console.log('Triggering DOMContentLoaded...');
try {
  global.document.listeners['DOMContentLoaded']();
  console.log('DOMContentLoaded executed successfully!');
  console.log('state.allPairIds:', global.state.allPairIds);
  console.log('state.totalRounds:', global.state.totalRounds);
} catch (e) {
  console.error('Error during DOMContentLoaded:', e.stack || e);
}
