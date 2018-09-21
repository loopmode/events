module.exports = {
    title: 'package-name',
    index: './README.md',
    source: './src',
    destination: './docs',
    coverage: true,
    includes: ['\\.js$'],
    excludes: [],
    unexportIdentifier: false,
    undocumentIdentifier: true,
    manual: {},
    experimentalProposal: {
        classProperties: true,
        objectRestSpread: true,
        decorators: true,
        doExpressions: true,
        functionBind: true,
        asyncGenerators: true,
        exportExtensions: true,
        dynamicImport: true
    },
    lint: false
};
