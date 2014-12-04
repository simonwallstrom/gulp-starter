var gulp = require('gulp'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    svgmin = require('gulp-svgmin'),
    ftp = require('gulp-ftp'),
    ftpass = require('./ftpass.json');

gulp.task('styles', function() {
    return gulp.src('src/sass/app.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('build/css'))
        .pipe(connect.reload());
});

gulp.task('content', function() {
    gulp.src(['src/jade/**/*.jade', '!src/jade/layouts/**'])
        .pipe(jade({ pretty: true }))
        .pipe(gulp.dest('build'))
        .pipe(connect.reload());
});

gulp.task('images', function() {
    return gulp.src('src/images/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('build/images'))
        .pipe(connect.reload());
});

gulp.task('connect', function() {
    connect.server({
        root: 'build/',
        livereload: true
    });
});

gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.scss', ['styles']);
    gulp.watch('src/jade/**/*.jade', ['content']);
    gulp.watch('src/images/*.svg', ['images']);
});

gulp.task('ftp', function () {
    return gulp.src('build/**/*')
        .pipe(ftp(ftpass.credentials));
});

gulp.task('default', ['styles', 'content', 'images', 'connect', 'watch']);

gulp.task('deploy', ['ftp']);