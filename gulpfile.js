//
// GULPFILE
//

// 1. `gulp` - Default task to build and run server
// 2. `gulp --prod` - Minify everything to get ready for deploy
// 3. `gulp deploy` - Deploy to gh-pages

// -------------------------------------------------------------
// # Import plugins
// -------------------------------------------------------------

var gulp            = require('gulp'),
    jade            = require('gulp-jade'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    js              = require('browserify'),
    uglify          = require('gulp-uglify'),
    jshint          = require('gulp-jshint'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    imagemin        = require('gulp-imagemin'),
    livereload      = require('gulp-livereload'),
    connect         = require('gulp-connect'),
    gutil           = require("gulp-util"),
    notify          = require("gulp-notify"),
    del             = require('del'),
    runSequence     = require('run-sequence');


// -------------------------------------------------------------
// # Config
// -------------------------------------------------------------

var basePath = {
    src:    './src/',
    dest:   './build/'
};

var src = {
    jade:   [basePath.src + 'jade/**/*.jade', '!' + basePath.src + 'jade/layouts/**'],
    sass:   basePath.src + 'assets/sass/',
    js:     basePath.src + 'assets/js/',
    img:    basePath.src + 'assets/img/*'
};

var dest = {
    jade:   basePath.dest,
    sass:   basePath.dest + 'css/',
    js:     basePath.dest + 'js/',
    img:    basePath.dest + 'img/'
};

// Production setup
var isProd = false;
var jadePretty = true;
var sassStyle = 'expanded';

if(gutil.env.prod === true) {
    isProd = true;
    jadePretty = false;
    sassStyle = 'compressed';
}

// Deploy
var deploy = {
    path: basePath.dest + '**/*.*',
    branch: "gh-pages"
};

// Error handling
var handleError = function(err) {
    gutil.log(gutil.colors.red.bold(
        '\n\n\n' + err + '\n\n'
    ));
    return notify().write('BUILD FAILED!\nCheck terminal for error message.');
};


// -------------------------------------------------------------
// # Jade
// -------------------------------------------------------------

gulp.task('jade', function() {
    return gulp.src(src.jade)
        .pipe(jade({
            pretty: jadePretty
        }))
        .on('error', handleError)
        .pipe(gulp.dest(dest.jade))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # SASS
// -------------------------------------------------------------

gulp.task('sass', function() {
    return gulp.src(src.sass + 'app.scss')
        .pipe(sass({
            outputStyle: sassStyle,
            errLogToConsole: true,
            // onError: handleError // Broken in latest gulp-sass
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(dest.sass))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # JS
// -------------------------------------------------------------

gulp.task('jshint', function () {
    gulp.src([src.js + 'app.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .on('error', handleError);

});

gulp.task('js', function() {
    return js(src.js + 'app.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(isProd ? uglify() : gutil.noop())
        .pipe(gulp.dest(dest.js))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # img
// -------------------------------------------------------------

gulp.task('img', function () {
    console.log(src.sass + '**/*.scss');
    return gulp.src(src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(dest.img));
});


// -------------------------------------------------------------
// # Server
// -------------------------------------------------------------

gulp.task('connect', function() {
    connect.server({
        root: basePath.dest,
        livereload: true
    });
});


// -------------------------------------------------------------
// # Watch
// -------------------------------------------------------------

gulp.task('watch', function() {
    gulp.watch(src.sass + '**/*.scss', ['sass']);
    gulp.watch(src.js + '**/*.js', ['jshint' ,'js']);
    gulp.watch(src.jade, ['jade']);
    gulp.watch(src.img + '*', ['img']);
});


// -------------------------------------------------------------
// # Clean
// -------------------------------------------------------------

gulp.task('clean', function (cb) {
    del(basePath.dest + '**', cb);
});


// -------------------------------------------------------------
// # Default task - run `gulp`
// -------------------------------------------------------------

gulp.task('default', ['clean'], function (cb) {
    runSequence(['jade', 'sass', 'jshint', 'js', 'img', 'connect', 'watch'], cb);
});


// -------------------------------------------------------------
// # Deploy task - run `gulp deploy`
// -------------------------------------------------------------

gulp.task('deploy', function () {
    gulp.src(deploy.path)
        .pipe(deploy(deploy.branch));
});