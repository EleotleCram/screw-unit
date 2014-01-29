var Screw = (function($) {
  var screw = {
    Unit: function(fn) {
      var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
      var fn = new Function("matchers", "specifications",
        "with (specifications) { with (matchers) { " + contents + " } }"
      );

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
          .append('<ol class="once-befores">')
          .append('<ol class="befores">')
          .append('<ul class="its">')
          .append('<ul class="describes">')
          .append('<ol class="afters">')
          .append('<ol class="once-afters">');

        this.context.push(describe);
        fn.call();
        this.context.pop();

        this.context[this.context.length-1]
          .children('.describes')
            .append(describe);
      },

      it: function(name, fn) {
        var it = $('<li class="it">')
          .append($('<h2>').text(name))
          .data('screwunit.run', fn);

        this.context[this.context.length-1]
          .children('.its')
            .append(it);
      },

      onceBefore: function(fn) {
        var onceBefore = $('<li class="once-before">')
          .data('screwunit.run', fn);

        this.context[this.context.length-1]
          .children('.once-befores')
            .append(onceBefore);
      },

      onceAfter: function(fn) {
        var onceAfter = $('<li class="once-after">')
          .data('screwunit.run', fn);

        this.context[this.context.length-1]
          .children('.once-afters')
            .append(onceAfter);
      },

      before: function(fn) {
        var before = $('<li class="before">')
          .data('screwunit.run', fn);

        this.context[this.context.length-1]
          .children('.befores')
            .append(before);
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
      .append('<ol class="once-befores">')
      .append('<ol class="befores">')
      .append('<ul class="describes">')
      .append('<ol class="afters">')
      .append('<ol class="once-afters">')
      .appendTo('body');

    $(screw).dequeue();
    $(screw).trigger('loaded');
  });
  return screw;
})(jQuery);