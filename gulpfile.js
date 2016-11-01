'use strict';

const gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	babel = require('gulp-babel'),
	templateCache = require('gulp-angular-templatecache'),
	concat = require('gulp-concat'),
	clean = require('gulp-clean'),
	inject = require('gulp-inject'),
	wiredep = require('wiredep').stream,
	mainBowerFiles = require('main-bower-files'),
	angularFilesort = require('gulp-angular-filesort'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-clean-css'),
	htmlmin = require('gulp-htmlmin'),
	browserSync = require('browser-sync').create(),
	jshint = require('gulp-jshint'),
	jscs = require('gulp-jscs'),
	stylishJsHint = require('jshint-stylish'),
	stylishJscs = require('gulp-jscs-stylish');

const src = {
	index: 'app/index.html',
	html: 'app/**/*.html',
	js: 'app/**/*.js',
	jsSpec: 'app/**/*.spec.js',
	json: 'app/**/*.json',
	scssIndex: 'app/index.scss',
	scss: 'app/**/*.scss',
	css: 'app/**/*.css',
	img: 'app/img/**/*',
	bower: 'bower_components/**/*.*'
};

const dest = {
	cssTmp: 'tmp/css/',
	jsTmp: 'app/js',
	tmp: 'tmp/',
	prod: 'prod/'
};

gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: 'tmp',
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});
});

gulp.task('cleanTmp', () => {
	return gulp.src(dest.tmp, {read:false})
		.pipe(clean());
});

gulp.task('mbf', () => {
	return gulp.src(mainBowerFiles())
		.pipe(gulp.dest(dest.tmp + 'bower_components'));
});

gulp.task('inject', ['partialsHtml'], () => {
	return gulp.src(src.index)
		.pipe(inject(
		    gulp.src([src.js, '!' + src.jsSpec]).pipe(angularFilesort()), {relative: true}
		))
	    .pipe(wiredep({
			directory: 'bower_components'
		}))
		.pipe(gulp.dest(dest.tmp));

});

gulp.task('sass', () => {
	return gulp.src(src.scssIndex)
	    .pipe(sass().on('error', sass.logError))
	    .pipe(autoprefixer({browsers: ['> 1%', 'IE 8']}))
	    .pipe(gulp.dest(dest.cssTmp))
	    .pipe(browserSync.stream());
});

gulp.task('partialsHtml', () => {
	let task = gulp.src([src.html, '!' + src.index])
		.pipe(templateCache('templates.js', {
			module: 'chessApp'
		}))
		.pipe(gulp.dest(dest.jsTmp));
});

gulp.task('htmlWatch', ['partialsHtml'], () => {
	return gulp.src([src.html, '!' + src.index])
		.pipe(templateCache('templates.js', {
			module: 'chessApp'
		}))
		.pipe(gulp.dest(dest.tmp + 'js/'))
		.pipe(browserSync.stream());

	    // browserSync.reload();
});

gulp.task('jsTmp', () => {
	return gulp.src([src.js, src.jsSpec])
  //       .pipe(babel({
  //           presets: ['es2015']
		// }))
        .on('error', console.error.bind(console))
		.pipe(gulp.dest(dest.tmp));
});

gulp.task('jsonTmp', () => {
	return gulp.src(src.json)
		.pipe(gulp.dest(dest.tmp));
})

gulp.task('jsWatch', ['jsTmp'], () => {
    browserSync.reload();
});

gulp.task('imgTmp', () => {
	return gulp.src(src.img)
		.pipe(gulp.dest(dest.tmp + 'img/'));

});

gulp.task('lint', () => {
  return gulp.src(['app/**/*.js', '!app/**/*.spec.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylishJsHint));
});

gulp.task('jscs', () => {
    return gulp.src('app/**/*.js')
        // .pipe(jscs({fix: true}))
        // .pipe(gulp.dest('app/'))
		.pipe(jscs())
		.pipe(stylishJscs());
});

gulp.task('buildTmp', ['inject', 'jsTmp', 'sass', 'imgTmp', 'jsonTmp']);

gulp.task('buildProdHtml', ['buildTmp'], () => {
	return gulp.src('tmp/index.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest(dest.prod));
});

gulp.task('fontsProd', () => {
	return gulp.src('bower_components/bootstrap/fonts/*')
		.pipe(gulp.dest(dest.prod + 'fonts/'));
});

gulp.task('buildProdCss', ['sass'], () => {
	return gulp.src(dest.cssTmp + '*.css')
		.pipe(minifyCss())
		.pipe(gulp.dest(dest.prod + 'css'));
});

gulp.task('buildProdData', () => {
	return gulp.src(src.json)
		.pipe(gulp.dest(dest.prod));
});

gulp.task('buildProd', ['buildProdHtml', 'fontsProd', 'buildProdCss', 'buildProdData'], () => {
	return gulp.src('prod/index.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(dest.prod));
});

gulp.task('default', () => {});

gulp.task('watch', ['buildTmp', 'browser-sync'], () => {
	gulp.watch(src.index, ['inject']);
	gulp.watch(src.scss, ['sass']);
	gulp.watch(src.html, ['htmlWatch']);
	gulp.watch([src.js], ['jsWatch']);
	gulp.watch(src.bower, ['inject']);
});
