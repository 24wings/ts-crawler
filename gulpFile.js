var gulp = require("gulp");
var tsc = require("gulp-typescript-compiler");
var ts = require('gulp-typescript');
var nodemon = require("gulp-nodemon");
var sass = require('gulp-sass');

var tsProject = ts.createProject('tsconfig.json');

gulp.task("default", ["compile", "watch", "watch-scss", "nodemon", 'css', 'fonts']);


gulp.task("watch", function () {

    return gulp.watch(["src/**/*.*", 'views/**/*.jade'], ["compile"]);

});
gulp.task("watch-scss", () => {
    return gulp.watch(['./sass/**/*.scss', './sass/bootstrap-sass/assets/**/*.scss'], ['css', 'fonts']);
})

gulp.task("compile", function () {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('build'));

});

gulp.task("nodemon", function () {
    nodemon({
        script: "build/www",
        exec: ' set DEBUG=*,-not_this &node --debug ',
        env: {
            'NODE_ENV': 'production'
        }

    });
});




var config = {
    bootstrapDir: './sass/bootstrap-sass',
    publicDir: './public',
};

gulp.task('css', function () {
    return gulp.src('./sass/app.scss')
        .pipe(sass({
            includePaths: [config.bootstrapDir + '/assets/stylesheets'],
        }))
        .pipe(gulp.dest(config.publicDir + '/css'));
});

gulp.task('fonts', function () {
    return gulp.src(config.bootstrapDir + '/assets/fonts/**/*')
        .pipe(gulp.dest(config.publicDir + '/fonts'));
});