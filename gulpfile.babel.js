/* eslint-disable no-alert, angular/log, angular/json-functions */

import gulp from 'gulp';

import stubby from 'gulp-stubby-server';


// const exec = child.exec;
// const argv = yargs.argv;
const root = 'src/';
const paths = {
  stubs: 'stubs/*.{json,js}'
};



gulp.task('stub', (cb) => {
  var options = {
    files: [
      paths.stubs
    ],
    callback: function (server, options) {
      server.get(1, function (err, endpoint) {
        if (!err) {
          console.log(endpoint);
        }
      });
    },
    mute: false,
    stubs: 8000,
    tls: 8443,
    admin: 8010

  };
  stubby(options, cb);
});
