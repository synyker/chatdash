module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    less: {
      development: {
        files: {
          "styles.css": "less/main.less"
        }
      }
    },
    watch: {
      
      styles: {
        files: ['less/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      },

      src: {
        files: ['src/**/*.js'],
        tasks: ['minimize']
      }
    },

    concat: {

      dist: {

        src: ['src/controllers/*.js',
              'src/services/*.js',],
  
        dest: 'angular-app.js',
      }
    },


  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('minimize', ['concat:dist']);
  grunt.registerTask('build', ['concat:dist', 'less']);

};