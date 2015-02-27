//
// GULPFILE
//

// TODO
// Clean task
// Prod and dev env, use gulp if?
// Faster browserify


// -------------------------------------------------------------
// # Import plugins
// -------------------------------------------------------------

var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    js              = require('browserify'),
    uglify          = require('gulp-uglify'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    jade            = require('gulp-jade'),
    imagemin        = require('gulp-imagemin'),
    livereload      = require('gulp-livereload'),
    connect         = require('gulp-connect'),
    notify          = require("gulp-notify"),
    argv            = require('yargs').argv,
    gulpif          = require("gulp-if");


// -------------------------------------------------------------
// # Config
// -------------------------------------------------------------

// true if '--production' flag is used
var production = !!(argv.production);

var path = {
  src:          'src/assets/',
  dev:          'dev/assets/',
  prod:         'prod/assets/'
};

var srcAssets = {
  styles:       path.src + 'sass/',
  scripts:      path.src + 'js/',
  images:       path.src + 'images/'
};

var devAssets = {
  styles:       path.dev + 'sass/',
  scripts:      path.dev + 'js/',
  images:       path.dev + 'images/'
};

var prodAssets = {
  styles:       path.prod + 'sass/',
  scripts:      path.prod + 'js/',
  images:       path.prod + 'images/'
};

var deployBranch = {
    branch: "gh-pages"
};


// -------------------------------------------------------------
// # Handle errors
// -------------------------------------------------------------

var handleError = function(err) {
        console.log(err);
        return notify().write('You fucked up the styles');
    };


// -------------------------------------------------------------
// # SCSS
// -------------------------------------------------------------

gulp.task('styles', function() {
    return gulp.src(srcAssets.styles + 'app.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            errLogToConsole: false,
            onError: handleError
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('dev/css'))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # JS
// -------------------------------------------------------------

gulp.task('js', function() {
    return js('./src/assets/js/app.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulpif(production, uglify()))
        .pipe(gulp.dest('./dev/js'))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # Jade
// -------------------------------------------------------------

gulp.task('content', function() {
    return gulp.src(['src/jade/**/*.jade', '!src/jade/layouts/**'])
        .pipe(jade({ pretty: false }))
        .pipe(gulp.dest('dev'))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # Images
// -------------------------------------------------------------

gulp.task('images', function () {
    return gulp.src('src/assets/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest('dev/images'));
});


// -------------------------------------------------------------
// # Server
// -------------------------------------------------------------

gulp.task('connect', function() {
    connect.server({
        root: 'dev/',
        livereload: true
    });
});


// -------------------------------------------------------------
// # Watch
// -------------------------------------------------------------

gulp.task('watch', function() {
    gulp.watch('src/assets/sass/**/*.scss', ['styles']);
    gulp.watch('src/assets/js/**/*.js', ['js']);
    gulp.watch('src/jade/**/*.jade', ['content']);
    gulp.watch('src/assets/images/*.svg', ['images']);
});


// -------------------------------------------------------------
// # Default task - run `gulp`
// -------------------------------------------------------------

gulp.task('default', ['styles', 'js', 'content', 'images', 'connect', 'watch']);


// -------------------------------------------------------------
// # Deploy task - run `gulp deploy`
// -------------------------------------------------------------

gulp.task('deploy', function () {
    gulp.src("dev/**/*.*")
        .pipe(deploy(deployBranch));
});