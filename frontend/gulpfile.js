var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
// var notify = require("gulp-notify");
var browserSync = require('browser-sync').create();
// var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var customizeBootstrap = require('gulp-customize-bootstrap');
// var less2sass = require('gulp-less2sass');

var config = {
    paths: {
        src: {
            npm: '/node_modules',
            sass: '/sass'
        }
    }
};

gulp.task('clean', function(cb){
    del(['./dist'], cb);
});

gulp.task('default', function() {
    // place code for your default task here
});

gulp.task('sass:watch', function () {
    gulp.watch(config.paths.src.sass + '/*.scss', ['compileBootstrap']);
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ".",
            index: "index.html"
        },
        watchOptions: {
            ignoreInitial: true,
            ignored: '*.txt'
        },
        files: ['./app']
    })
});
/*
from npm package.json
"scripts": {
    "start": "tsc && concurrently \"tsc -w\" \"lite-server\" ",
        "lite": "lite-server",
        "tsc": "tsc",
        "tsc:w": "tsc -w"
},*/


// .pipe(sourcemaps.init( {loadMaps: true}))
  //      ..pipe(sourcemaps.write( "." ))


gulp.task('compileBootstrap', function() {
    return gulp.src( config.paths.src.npm + '/bootstrap/scss/bootstrap.scss')
        .pipe(customizeBootstrap( config.paths.src.sass + '/*.scss'))
        .pipe(sass())
        .pipe(gulp.dest('dist/'));
});

/*gulp.task('less2sass', function() {
    gulp.src( config.paths.src.sass + '/*.less' )
        .pipe(less2sass())
        .pipe(gulp.dest( config.paths.src.sass ));
});*/

