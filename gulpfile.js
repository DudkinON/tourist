const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const bs = require('browser-sync').create();
const del = require("del");
const autoprefixer = require("gulp-autoprefixer");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const gulpSass = require("gulp-sass");
const gulpCopy = require('gulp-copy');
const concat = require("gulp-concat");
const minify = require('gulp-minify-css');
const merge = require('merge-stream');

// Global
const destination = 'dist';


function errorHandler(msg) {
  return plumber(function (err) {
    console.log(msg);
    console.log(err);
    this.emit("end");
  })
}

// Clean dist folder
gulp.task('clean', function () {
  return del([destination]);
});

// Styles SCSS
gulp.task("styles", function () {
  const APSettings = {
    browsers: [
      'last 3 version',
      '> 1%',
      'ie 8',
      'ie 9',
      'opera 12.1'
    ]
  };

  const scssStream = gulp.src("src/sass/main.scss")
    .pipe(errorHandler("SASS styles task error"))
    .pipe(autoprefixer(APSettings))
    .pipe(gulpSass({outputStyle: 'compressed'}))
    .pipe(concat('main.css'));

  const cssStream = gulp.src("src/css/*.css")
    .pipe(errorHandler("CSS styles task error"))
    .pipe(autoprefixer(APSettings))
    .pipe(concat('style.css'));

  return merge(scssStream, cssStream)
    .pipe(errorHandler("Styles task error"))
    .pipe(sourcemaps.init())
    .pipe(concat("main.min.css"))
    .pipe(minify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${destination}/css`));
});

// Files task
gulp.task("files", function () {
  const sourceFiles = [
    'src/img/*',
    'src/svg/*',
    'src/videos/*',
    'src/css/fonts/*',
    'src/favicon.ico'
  ];

  return gulp.src(sourceFiles)
    .pipe(errorHandler("Files copy error"))
    .pipe(gulpCopy(destination, {prefix: 1}))
    .pipe(gulp.dest(destination));
});

// HTML min
gulp.task("htmlmin", function () {
  return gulp.src('src/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(destination));
});

// Server task
gulp.task("serve", function () {
  bs.init({
    open: true,
    server: destination
  });
  bs.watch(destination, bs.reload);
});

// Watch task
gulp.task("watch", function () {
  gulp.watch("src/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("src/**/*.html", gulp.series("htmlmin"));
});

// Start task
gulp.task("start", gulp.series(
  "clean",
  "styles",
  "htmlmin",
  "files",
  gulp.parallel(
    'watch',
    'serve'
  )
));

// default
gulp.task("default", function (done) {
  console.log("default task");
  done();
});