const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

// задача(task) для работы с файлами html
function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  });
}

// задача(task) для работы с файлами css
function styles() {
  return src('app/scss/style.scss') //берем из этой папки
    .pipe(scss({ outputStyle: 'compressed' })) //сжимаем
    .pipe(concat('style.min.css')) // объединяем и именуем сжатый файл
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
        grid: true,
      })
    )
    .pipe(dest('app/css')) //выкидываем в эту папку
    .pipe(browserSync.stream()); //обновление в браузере без перезагрузки страницы
}

// задача(task) для работы с файлами js
function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    // 'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'node_modules/rateyo/src/jquery.rateyo.js',
    'app/js/main.js',
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

// задача(task) для работы с файлами html
function images() {
  return src('app/images/**/*.*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest('dist/images'));
}

// задача(task) перенос готового из app в dist
function build() {
  return src(['app/**/*.html', 'app/css/style.min.css', 'app/js/main.min.js'], {
    base: 'app',
  }).pipe(dest('dist'));
}

// задача(task) очистка папки dist
function cleanDist() {
  return del('dist');
}

// задача(task) отслеживания изменений и запуска styles
function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload); //изменим и перезагрузим страницу
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

exports.default = parallel(styles, scripts, browsersync, watching);
