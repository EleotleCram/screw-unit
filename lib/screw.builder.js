var Screw = (function($) {
  var screw = {
    Unit: function(fn) {
//      var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
//      var fn = new Function("matchers", "specifications",
//        "with (specifications) { with (matchers) { " + contents + " } }"
//      );

      $(Screw).queue(function() {
        Screw.Specifications.context.push($('body > .describe'));
        fn.call(this, Screw.Matchers, Screw.Specifications);
        Screw.Specifications.context.pop();
        $(this).dequeue();
      });
    },

    Specifications: {
      context: [],

      describe: function(name, fn) {
        var describe = $('<li class="describe">')
          .append($('<h1>').text(name))
          .append('<ol class="befores">')
          .append('<ul class="its">')
          .append('<ul class="describes">')
          .append('<ol class="afters">');

        this.context.push(describe);
        fn.call();
        this.context.pop();

        this.context[this.context.length-1]
          .children('.describes')
            .append(describe);
      },

      it: function(name, fn) {
        var it = $('<li class="it">')
          .append($('<h2>').text(name));

        if(/(waitFor|run)\(\s*function/.test(fn.toString())) {
          it.data('screwunit.asyncJobs', []);

          this.context.push(it);
          fn.call();
          this.context.pop();
        } else {
          it.data('screwunit.run', fn);
        }

        this.context[this.context.length-1]
          .children('.its')
            .append(it);
      },

      waitFor: function(fn) {
        var timeout = 5000; // default timeout is 5 seconds
        var description = "waitFor job didn't complete in time ("+timeout+"ms timeout exceeded)"; // default description
        var options;

        if($.isPlainObject(fn)) {
          options = fn;
          fn = options.run;
        }

        var ctx = this.context[this.context.length-1];
        $.extend(fn, {
          type: "waitFor",
          description: description,
          timeout: timeout
        }, options);
        ctx.data('screwunit.asyncJobs').push(fn);
      },

      run: function(fn) {
        var ctx = this.context[this.context.length-1];
        ctx.data('screwunit.asyncJobs').push(fn);
      },

      before: function(name, fn) {
        if(!fn) {fn = name; name=undefined}

        var before = $('<li class="before">')
          .data('screwunit.run', fn);

        if(fn.name) {before.attr("id", fn.name)}

        if(name) {
          var otherBefore = this.context.reduceRight(function(prev, cur) {
            return prev.any() ? prev : cur.find('#'+name);
          }, $());

          if(otherBefore.any()) {
            otherBefore.before(before);
          } else {
            throw "Before with id `" + name + "' not found!";
          }
        } else {
          this.context[this.context.length-1]
            .children('.befores')
              .append(before);
        }
      },

      after: function(fn) {
        var after = $('<li class="after">')
          .data('screwunit.run', fn);

        this.context[this.context.length-1]
          .children('.afters')
            .append(after);
      }
    }
  };

  $(screw).queue(function() { $(screw).trigger('loading') });
  $(function() {
    $('<div class="describe">')
      .append('<h3 class="status">')
      .append('<ol class="befores">')
      .append('<ul class="describes">')
      .append('<ol class="afters">')
      .appendTo('body');

    $(screw).dequeue();
    $(screw).trigger('loaded');
  });
  return screw;
})(jQuery);