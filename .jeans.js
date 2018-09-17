const buildServer =
  'TIER=production ./node_modules/.bin/webpack --config src/js/src/SERVICE_NAME/webpack-server-babel.config.js';
const buildApp =
  'NODE_ENV=production ./node_modules/.bin/webpack --config ./src/js/src/SERVICE_NAME/webpack.prod.config.js -p';
module.exports = {
  commands: {
    build: `${buildServer} && ${buildApp}`,
    buildApp: buildApp,
    buildServer: buildServer,
    clean: 'rm -rf src/js/src/SERVICE_NAME/node_modules || exit 0',
    lintCI:
      'node_modules/eslint/bin/eslint.js --ext "js, gql" ./src/js/src/SERVICE_NAME --output-file=$CIRCLE_TEST_REPORTS/junit/SERVICE_NAME_lint.xml --format=junit ',
    lint:
      'node_modules/eslint/bin/eslint.js --ext "js, gql" ./src/SERVICE_NAME',
    test:
      'NODE_PATH=$PWD/src/js/src/SERVICE_NAME/app:$PWD/src/js/src  ./node_modules/.bin/jest --color --maxWorkers=8 $(find ./src/js/src/SERVICE_NAME -name \'*test.js\' -not -path \'*/node_modules/*\') $(find ./src/js/src/SERVICE_NAME -name \'*test.bs.js\' -not -path \'*/node_modules/*\') --collectCoverageFrom=\'["**/SERVICE_NAME/app/reducers/*.js","**/SERVICE_NAME/app/selectors/*.js","**/SERVICE_NAME/app/utils/*.js"]\' --no-cache',
    refmt: "find ./src/js/src/SERVICE_NAME/ -name \"*.re\" | xargs -n 1 ./node_modules/bs-platform/lib/refmt.exe --in-place",
    refmtCheck: "bash ./src/js/src/jeans/bin/reason-format-check.sh ./src/js/src/SERVICE_NAME/",
    fmt:
      "./node_modules/prettier/bin-prettier.js --write --config .prettierrc './src/SERVICE_NAME/**/*.{js,css,gql}'",
    fmtCheck:
      "./node_modules/prettier/bin-prettier.js --list-different --config .prettierrc './src/js/src/SERVICE_NAME/**/*.{js,css,gql}'",
    generateJeans:
      './node_modules/.bin/babel-node src/js/src/jeans/bin/generateJeansFiles.js',
    flow: './node_modules/flow-bin/cli.js check',
  },
  services: ['booking', 'heart', 'claim', 'mywow'],
  srcFolder: 'src',
};
