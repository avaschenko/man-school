"use strict";const gulp = require('gulp');const l = require('gulp-load-plugins')();const sprite = require('gulp.spritesmith');const svg_sprite = require('gulp-svg-sprites');const path = require('path');const rigger = require('gulp-rigger');const svgSymbols = require('gulp-svg-symbols');const cheerio = require('gulp-cheerio');gulp.task('svg:symbols', function () {  return gulp.src('src/icons-svg/*.svg')      .pipe(svgSymbols({        id:         'icon-%f',        className:  '.icon-%f',        title:      false,        fontSize:   16,        templates: [          'default-svg',          'default-demo',          path.join(__dirname, 'src/sass/helpers/_svg-sprite-template.scss'),          path.join(__dirname, 'src/icons-svg/svg-template.twig'),        ]      }))      .pipe(gulp.dest('src/icons-svg/template'));});gulp.task('svg:fix', function() {  return gulp.src('src/icons-svg/template/svg-template.twig')      .pipe(cheerio({        run: function ($) {          $('[style]').removeAttr('style');        },        parserOptions: { xmlMode: true }      }))      .pipe(gulp.dest('src/icons-svg/template/'));})function lazyIntegration(task, path, options){  "use strict";  options.task = task;  gulp.task(task, function(callback){    var taskType = require(path).call(this, options);    return taskType(callback);  });}gulp.task('js', function(cb){  gulp.src('src/js/main.js')    .pipe(rigger())    .pipe(gulp.dest('build/js/'));  cb();});lazyIntegration('styles', './gulpTasks/styles.js', {  src: 'src/sass/*.sass'});lazyIntegration('copy:img', './gulpTasks/copy.js', {  src: ['src/img/**/*.*'],  dest: 'build/img/',});lazyIntegration('copy:svg', './gulpTasks/copy.js', {  src: ['src/icons-svg/*.svg'],  dest: 'build/img/icons-svg/',});lazyIntegration('copy:sounds', './gulpTasks/copy.js', {  src: ['src/sounds/**/*.*'],  dest: 'build/sounds/',});lazyIntegration('copy:fonts', './gulpTasks/copy.js', {  src: ['src/fonts/*.*'],  dest: 'build/fonts',});lazyIntegration('server', './gulpTasks/server.js', {});lazyIntegration('rev', './gulpTasks/rev.js', {});lazyIntegration('svg:min', './gulpTasks/svgmin.js', {});lazyIntegration('svg:attr', './gulpTasks/svg-remove-attributes.js', {});lazyIntegration('svg:replace', './gulpTasks/svg-bug-fixes.js', {});lazyIntegration('html:svg', './gulpTasks/html-build.js', {});lazyIntegration('js:build', './gulpTasks/js-build.js', {});gulp.task('compile', function () {  'use strict';  var twig = require('gulp-twig');  return gulp.src('src/pages/*.twig')    .pipe(twig())    .pipe(gulp.dest('build/'));});gulp.task('sprite:png', function (callback) {  var spriteData = gulp.src(['src/blocks/**/*.png'])    .pipe(sprite({      // retinaSrcFilter: ['src/img/icons-png2x/*@2x.png'],      // retinaImgName: 'png-sprite2x.png',      // imgName: 'png-sprite.png',      // cssName: '_png-sprite.scss',      // cssFormat: 'scss',      imgPath: '../img/sprite.png',      algorithm: 'top-down',      retinaSrcFilter: ['src/blocks/**/*@2x.png'],      imgName: 'sprite.png',      retinaImgName: '../img/sprite@2x.png',      cssName: 'png-sprite.sass'    }));  spriteData.img.pipe(gulp.dest('build/img/'));  l.debug({title: 'sprite-images:create'});  spriteData.css.pipe(gulp.dest('src/sass/helpers/'));  l.debug({title: 'sprite-sass:create'});  callback();});//gulp.task('sprite:svg', function () {//  return gulp.src('src/icons-svg/*.svg')//    .pipe(svg_sprite({//      preview: false,//      mode: 'symbols',//      selector: "icon-%f",//      svg: {//        svgId: 'sprite-svg',//        symbols: 'svg_sprite.twig'//      }//    }))//    .pipe(l.if('*.twig', gulp.dest('src/icons-svg/')))//    .pipe(l.if('*.svg', gulp.dest('build/icons-svg/')))//    .pipe(l.debug({title: 'svg-sprite-img:created'}));//});gulp.task('svg:scss', function () {  return gulp.src('src/icons-svg/template/*.svg')    .pipe(svg_sprite({        preview: false,        selector: "icon-%f",        cssFile: '_svg-sprite.scss',        templates: {          css: require("fs").readFileSync('src/sass/helpers/_svg-sprite-template.scss', "utf-8")        }      }    ))    .pipe(l.if('*.scss', gulp.dest('src/sass/helpers/')));});//gulp.task('svg:sprites', gulp.series(['svg:scss']));gulp.task('svg:sprite', gulp.series('svg:symbols'));gulp.task('build', gulp.series('sprite:png', 'styles', 'compile', 'copy:fonts', 'copy:img', 'copy:svg', 'copy:sounds'));gulp.task('watch', function(){  gulp.watch('src/**/*.sass', gulp.series('styles'));  gulp.watch('src/**/*.twig', gulp.series('compile'));  gulp.watch('src/js/*.js', gulp.series('js:build'));  gulp.watch(['src/fonts/*.*'], gulp.series('copy:fonts'));  gulp.watch(['src/img/**/*.*'], gulp.series('copy:img'));  gulp.watch(['src/icons-svg/*.svg'], gulp.series('copy:svg'));  gulp.watch('src/blocks/**/*.png', gulp.series('sprite:png'));  //gulp.watch('src/icons-svg/*.svg', gulp.series('svg:sprite'));});gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));