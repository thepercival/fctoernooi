var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
// var notify = require("gulp-notify");
var browserSync = require('browser-sync').create();
var del = require('del');
var customizeBootstrap = require('gulp-customize-bootstrap');
// var less2sass = require('gulp-less2sass');
var ts = require('gulp-typescript');
var merge = require('merge2');
// var sourcemaps = require('gulp-sourcemaps');
var webserver = require('gulp-webserver');

var config = {
    paths: {
        src: {
            npm: './node_modules',
            sass: './sass',
            ts: './app'
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

var tsProject = ts.createProject('tsconfig.json');

gulp.task('ts:compile', function() {
    var tsResult = gulp.src( [ config.paths.src.ts + '/**/*.ts', '!' + config.paths.src.ts + '/**/*.d.ts'] ) // or tsProject.src()
        .pipe(tsProject())
        //.pipe(sourcemaps.init()) // This means sourcemaps will be generated
        ;

    /*return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done.
        //tsResult.dts.pipe(gulp.dest('dist/definitions/')),
        //tsResult.js.pipe(sourcemaps.write()),
        tsResult.js.pipe(gulp.dest('dist/js/'))
    ]);*/
    return tsResult.pipe(gulp.dest('app'));
});

gulp.task('ts:watch', function () {
    gulp.watch( [ config.paths.src.ts + '/**/*.ts', '!' + config.paths.src.ts + '/**/*.d.ts'], ['ts:compile']);
});

gulp.task('webserver', function() {
    gulp.src('')
        .pipe(webserver({
            /*livereload: true,*/
            directoryListing: false,
            open: true,
            port: 3000,
            fallback: 'index.html'
        }));
});
