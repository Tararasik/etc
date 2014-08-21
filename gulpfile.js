var gulp = require('gulp'),
    less = require('gulp-less');

gulp.task('default', ['less', 'watch']);

gulp.task('less', function() {
  gulp.src('./park.less')
    .pipe(less({'strictMath': true}))
    .pipe(gulp.dest('./'));
})

gulp.task('watch', function() {
  gulp.watch('./park.less', ['less'])
})