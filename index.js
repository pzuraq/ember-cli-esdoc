/* eslint-env node */
'use strict';

const ESDocCompiler = require('broccoli-esdoc');
const mergeTrees    = require('broccoli-merge-trees');
const Funnel        = require('broccoli-funnel');
const merge         = require('merge');

const defaults = {
  config: {
    plugins: [{
      name: 'esdoc-ecmascript-proposal-plugin',
      option: {
        classProperties: true,
        decorators: true
      }
    }, {
      name: 'esdoc-standard-plugin'
    }]
  }
};

module.exports = {
  name: 'ember-cli-esdoc',

  included(app) {
    this.options = merge(defaults, app.options.esdoc);

    var cmdOpts = process.argv.slice(3);
    this.liveDocsEnabled = cmdOpts.indexOf('--docs') !== -1;
  },

  postprocessTree(type, workingTree) {
    if (type === 'all') {
      const env = this.app.env;

      if ((this.liveDocsEnabled && env === 'development') ||
          (this.options.enabledEnvironments && this.options.enabledEnvironments.includes(env))) {
        return this.addDocsToTree(workingTree);
      }
    }
    return workingTree;
  },

  addDocsToTree(inputTree){
    const { config } = this.options;

    config.source = this.app.project.isEmberCLIAddon() ? './addon' : './app';
    config.dest = `./docs`;

    const files = new Funnel(this.app.project.root, {
      include: ['addon/**/*', 'app/**/*', 'package.json', 'README.md']
    });

    const addonDocTree = new ESDocCompiler(files, config);

    return mergeTrees([inputTree, addonDocTree], { overwrite: true });
  }
};
