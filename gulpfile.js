//
// GULPFILE
//


// TASKS
// 1. `gulp` - Default task to build and run server
// 2. `gulp prod` - Minify everything to get ready for deploy
// 3. `gulp deploy` - Deploy to gh-pages

// -------------------------------------------------------------
// # Import plugins
// -------------------------------------------------------------

var gulp            = require('gulp'),
    jade            = require('gulp-jade'),
    marked          = require('marked'),
    sass            = require('gulp-sass'),
    scsslint        = require('gulp-scss-lint'),
    autoprefixer    = require('gulp-autoprefixer'),
    minifyCSS       = require('gulp-minify-css'),
    js              = require('browserify'),
    uglify          = require('gulp-uglify'),
    jshint          = require('gulp-jshint'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    imagemin        = require('gulp-imagemin'),
    changed         = require('gulp-changed'),
    browserSync     = require('browser-sync'),
    gutil           = require("gulp-util"),
    notify          = require("gulp-notify"),
    del             = require('del'),
    sizereport      = require('gulp-sizereport'),
    runSequence     = require('run-sequence'),
    deploy          = require('gulp-gh-pages');


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
            pretty: false
        }))
        .on('error', handleError)
        .pipe(gulp.dest(dest.jade))
        // .pipe(connect.reload());
        .pipe(browserSync.reload({stream:true}));
});


// -------------------------------------------------------------
// # SASS
// -------------------------------------------------------------

gulp.task('scss-lint', function() {
  gulp.src(src.sass + '**/*')
    .pipe(scsslint());
});

gulp.task('sass', function() {
    return gulp.src(src.sass + 'app.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            errLogToConsole: true,
            // onError: handleError // Broken in latest gulp-sass
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(dest.sass))
        .pipe(browserSync.reload({stream:true}));
        // .pipe(connect.reload());
});

gulp.task('sassProd', ['sass'], function() {
    return gulp.src(dest.sass + 'app.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest(dest.sass));
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
        .pipe(gulp.dest(dest.js))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('jsProd', ['jshint', 'js'], function() {
    return gulp.src(dest.js + 'app.js')
        .pipe(uglify())
        .pipe(gulp.dest(dest.js));
});


// -------------------------------------------------------------
// # img
// -------------------------------------------------------------

gulp.task('img', function () {
    return gulp.src(src.img)
        .pipe(changed(dest.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(dest.img));
});


// -------------------------------------------------------------
// # BrowserSync
// -------------------------------------------------------------

gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: basePath.dest,
        },
        notify: false,
        open: false
    });
});


// -------------------------------------------------------------
// # Watch
// -------------------------------------------------------------

gulp.task('watch', ['browserSync'], function(callback) {
    gulp.watch(src.sass + '**/*.scss', ['sass']);
    gulp.watch(src.js + '**/*.js', ['jshint' ,'js']);
    gulp.watch(src.jade, ['jade']);
});


// -------------------------------------------------------------
// # Clean
// -------------------------------------------------------------

gulp.task('clean', function (cb) {
    del(basePath.dest + '**', cb);
});


// -------------------------------------------------------------
// # Report
// -------------------------------------------------------------

gulp.task('report', ['jade', 'sassProd', 'jsProd', 'img'], function () {
    return gulp.src(basePath.dest + '**/*')
        .pipe(sizereport());
});

// -------------------------------------------------------------
// # Default task - run `gulp`
// -------------------------------------------------------------

gulp.task('default', ['clean'], function (cb) {
    runSequence([
        'jade',
        'scss-lint',
        'sass',
        'jshint',
        'js',
        'img',
        'browserSync',
        'watch'
    ], cb);
});


// -------------------------------------------------------------
// # Production task - run `gulp prod`
// -------------------------------------------------------------

gulp.task('prod', ['clean'], function (cb) {
    runSequence([
        'jade',
        'sassProd',
        'jsProd',
        'img',
        'browserSync',
        'report'
    ], function() {
        console.log(cb);
    });
});


// -------------------------------------------------------------
// # Deploy task - run `gulp deploy`
// -------------------------------------------------------------

gulp.task('deploy', function () {
    gulp.src(deploy.path)
        .pipe(deploy(deploy.branch));
});