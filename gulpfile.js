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
    nunjucks        = require('gulp-nunjucks-html'),
    minifyHTML      = require('gulp-minify-html'),
    sass            = require('gulp-sass'),
    scssLint        = require('gulp-scss-lint'),
    autoprefixer    = require('gulp-autoprefixer'),
    minifyCSS       = require('gulp-minify-css'),
    uglify          = require('gulp-uglify'),
    concat          = require('gulp-concat');
    jshint          = require('gulp-jshint'),
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
    dest:   './build/',
    prod:   './prod/'
};

var src = {
    html:   [basePath.src + 'html/**/*.html', '!' + basePath.src + 'html/layout.html'],
    sass:   basePath.src + 'assets/sass/',
    js:     basePath.src + 'assets/js/',
    img:    basePath.src + 'assets/img/*',
    bower:  './bower_components/'
};

var dest = {
    html:   basePath.dest,
    sass:   basePath.dest + 'css/',
    js:     basePath.dest + 'js/',
    img:    basePath.dest + 'img/'
};

var prod = {
    html:   basePath.prod,
    sass:   basePath.prod + 'css/',
    js:     basePath.prod + 'js/',
    img:    basePath.prod + 'img/'
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
// # HTML
// -------------------------------------------------------------

gulp.task('html', function() {
    return gulp.src(src.html)
        .pipe(nunjucks({
            searchPaths: ['./src/html']
        }))
        .pipe(gulp.dest(dest.html))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('htmlProd', ['html'], function() {
    var opts = {
      conditionals: true,
      spare:true
    };
    return gulp.src(dest.html + '*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(prod.html));
});


// -------------------------------------------------------------
// # SASS
// -------------------------------------------------------------

gulp.task('scss-lint', function() {
    return gulp.src([src.sass + '**/*', '!' + src.sass + '/base/_normalize.scss'])
        // .pipe(cache('scsslint'))
        .pipe(scssLint({'config': '.scss-lint.yml'}))
        .pipe(scssLint.failReporter('E'))
        .on('error', handleError);
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
});

gulp.task('sassProd', ['sass'], function() {
    return gulp.src(dest.sass + 'app.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest(prod.sass));
});


// -------------------------------------------------------------
// # JS
// -------------------------------------------------------------

gulp.task('jshint', function () {
    gulp.src([src.js + '*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .on('error', handleError);

});

gulp.task('js', function() {
    return gulp.src([
        src.bower + 'jquery/dist/jquery.min.js',
        src.js + 'app.js',
        src.js + 'lib.js'
    ])
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dest.js))
    .pipe(browserSync.reload({stream:true}));
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
    gulp.watch(src.js + '*.js', ['jshint' ,'js']);
    gulp.watch(src.html, ['html']);
});


// -------------------------------------------------------------
// # Clean
// -------------------------------------------------------------

gulp.task('clean', function () {
    return del(basePath.dest + '**');
});

gulp.task('cleanProd', function () {
    return del(basePath.prod + '**');
});


// -------------------------------------------------------------
// # Report
// -------------------------------------------------------------

gulp.task('report', ['html', 'sassProd', 'jsProd', 'img'], function () {
    return gulp.src(basePath.dest + '**/*')
        .pipe(sizereport());
});

// -------------------------------------------------------------
// # Default task - run `gulp`
// -------------------------------------------------------------

gulp.task('default', ['clean'], function (cb) {
    runSequence([
        'html',
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

gulp.task('prod', ['cleanProd'], function (cb) {
    runSequence([
        'htmlProd',
        'sassProd'
        // 'img',
        // 'browserSync',
        // 'report'
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
