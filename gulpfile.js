
const {src, dest, parallel,series, watch} = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoPrefixer = require('gulp-autoprefixer');
const GulpCleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');

const fonts = () => {
    src('src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./app/fonts/'))
    return    src('src/fonts/**.ttf')
            .pipe(ttf2woff2())
            .pipe(dest('./app/fonts/'))
}

const svgSprits = () => {
    return src('src/img/**.svg')
            .pipe(svgSprite({
                mode: {
                    stack: {
                        sprite: "../sprite.svg"
                    }
                }
            }))
            .pipe(dest('./app/img'));
}

const styles = () => {
    return src('src/scss/**/*.scss')
            .pipe(sourcemaps.init())
            .pipe(sass({outputStyle: 'expended'}).on('error', notify.onError()))
            .pipe(rename({suffix: '.min'}))
            .pipe(autoPrefixer({cascade: false,}))
            .pipe(GulpCleanCss({level: 2,}))
            .pipe(sourcemaps.write('.'))
            .pipe(dest('./app/css'))
            .pipe(browserSync.stream())
}

const htmlInclude = () =>{
    return src(['src/index.html'])
            .pipe(fileInclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(dest('./app'))
            .pipe(browserSync.stream())
}

const imgToApp = () => {
    return src(['src/img/**/*.jpg', 'src/img/**/*.png', 'src/img/**/*.jpeg'])
            .pipe(dest('./app/img'))
}

const imgMinimization = () => {
    return src(['src/img/**/*.jpg', 'src/img/**/*.png', 'src/img/**/*.jpeg'])
            .pipe(imagemin())
            .pipe(dest('./app/img'))
}

const resources = () => {
    return src('src/resources/**')
            .pipe(dest('app'))
}

const clean = () => {
    return del(['app/*'])
}

const scripts = () => {
    return src('src/js/main.js')
            .pipe(webpackStream({
                output: {
                    filename: 'main.js',
                },
                module: {
                    rules: [
                      {
                        test: /\.m?js$/,
                        exclude: /node_modules/,
                        use: {
                          loader: 'babel-loader',
                          options: {
                            presets: [
                              ['@babel/preset-env', { targets: "defaults" }]
                            ]
                          }
                        }
                      }
                    ]
                  }
            }))
            .pipe(sourcemaps.init())
            .pipe(uglify().on("error", notify.onError()))
            .pipe(sourcemaps.write('.'))
            .pipe(dest('app/js'))
            .pipe(browserSync.stream())
}

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: "./app"
        }
    });

    watch('src/scss/**/*.scss', styles);
    watch('src/index.html', htmlInclude);
    watch('src/img/**.jpg', imgToApp);
    watch('src/img/**.png', imgToApp);
    watch('src/img/**.jpeg', imgToApp);
    watch('src/img/**.svg', svgSprits);
    watch('src/resources/**', resources);
    watch('src/fonts/**.ttf', fonts);
    watch('src/js/**/*.js', scripts);
}

exports.styles = styles;
exports.watchFiles = watchFiles;
exports.fileInclude = htmlInclude;

exports.default = series(clean, parallel(htmlInclude, scripts, fonts, resources,  imgToApp, svgSprits), styles, watchFiles )