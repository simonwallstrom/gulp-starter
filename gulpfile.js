//
// GULPFILE
//


// -------------------------------------------------------------
// # Import plugins
// -------------------------------------------------------------

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    svgmin = require('gulp-svgmin');


// -------------------------------------------------------------
// # SCSS
// -------------------------------------------------------------

gulp.task('styles', function() {
    return gulp.src('src/sass/app.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('build/css'))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # Jade
// -------------------------------------------------------------

gulp.task('content', function() {
    gulp.src(['src/jade/**/*.jade', '!src/jade/layouts/**'])
        .pipe(jade({ pretty: true }))
        .pipe(gulp.dest('build'))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # Images
// -------------------------------------------------------------

gulp.task('images', function() {
    return gulp.src('src/images/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('build/images'))
        .pipe(connect.reload());
});


// -------------------------------------------------------------
// # Server
// -------------------------------------------------------------

gulp.task('connect', function() {
    connect.server({
        root: 'build/',
        livereload: true
    });
});


// -------------------------------------------------------------
// # Watch
// -------------------------------------------------------------

gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.scss', ['styles']);
    gulp.watch('src/jade/**/*.jade', ['content']);
    gulp.watch('src/images/*.svg', ['images']);
});


// -------------------------------------------------------------
// # Default task - run `gulp`
// -------------------------------------------------------------

gulp.task('default', ['styles', 'content', 'images', 'connect', 'watch']);


// -------------------------------------------------------------
// # Deploy task - run `gulp deploy`
// -------------------------------------------------------------

var options = {
    branch: "gh-pages"
};

gulp.task('deploy', function () {
    gulp.src("build/**/*.*")
        .pipe(deploy(options));
});