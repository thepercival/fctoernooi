var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var notify = require("gulp-notify");
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var customizeBootstrap = require('gulp-customize-bootstrap');

var config = {
    paths: {
        src: {
            npm: './node_modules',
            sass: './sass'
        }
    }
};

gulp.task('clean', function(cb){
    del(['./dist'], cb);
});




gulp.task('default', function() {
    // place code for your default task here
});

//gulp.task("build:css-bootstrap", function () {
  //  return gulp.src('./sass/custom-bootstrap.scss')
    //    .pipe(sass().on('error', sass.logError))
      //  .pipe(autoprefixer())
//        .pipe(gulp.dest('./styles'));
//});

//gulp.task('sass:watch', function () {
  //  gulp.watch('./sass/**/*.scss', ['sass']);
//});
// gulp.task('browserSync', function() {
//    browserSync.init({
//        server: {
//            baseDir: 'app'
//        },
//    })
//})

gulp.task('css', function() {
    // return gulp.src( config.paths.src.sass + '/*.scss' )
    return gulp.src( [ config.paths.src.sass + '/main.scss' ] )
        .pipe(sourcemaps.init( {loadMaps: true}))
        .pipe(sass({ style: 'compressed',includePaths: [
            config.paths.src.npm + '/bootstrap/scss'
        ],
            onError: function (err) {
                notify().write(err);
            } }))
        .pipe(sourcemaps.write( "." ))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compileBootstrap', function() {
    return gulp.src('node_modules/bootstrap/scss/bootstrap.scss')
        .pipe(customizeBootstrap('sass/*.scss'))
        .pipe(sass())
        .pipe(gulp.dest('dist/'));
});

gulp.task('build:css', [
    'build:css-bootstrap',
    'build:main-css',
    'build:create-css'
    ]
);