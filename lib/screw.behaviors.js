(function($) {
  $(Screw).bind('loaded', function() {
    $('.status').fn({
      display: function() {
        $(this).text(
          $('.passed').length + $('.failed').length + ' test(s), ' + $('.failed').length + ' failure(s)'
        );
      }
    });

    $('.describe').fn({
      parent: function() {
        return $(this).parent('.describes').parent('.describe');
      },

      enqueue_befores: function() {
        $(this).fn('parent').fn('enqueue_befores');
        $(this).children('.befores').children('.before').fn('enqueue');
      },

      enqueue_afters: function(last) {
        $(this).children('.afters').children('.after').fn('enqueue');
        $(this).fn('parent').fn('enqueue_afters');
      },

      enqueue_once_befores: function() {
        $(this).children('.once-befores').children('.once-before').fn('enqueue');
      },

      enqueue_once_afters: function() {
        $(this).children('.once-afters').children('.once-after').fn('enqueue');
      },

      enqueue: function() {
        var that = this;
        $(this).fn('enqueue_once_befores');

        $(this).children('.its').children('.it').fn('enqueue');
        $(this).children('.describes').children('.describe').fn('enqueue');

        $(this).fn('enqueue_once_afters');
      },

      selector: function() {
        return $(this).fn('parent').fn('selector')
          + ' > .describes > .describe:eq(' + $(this).parent('.describes').children('.describe').index(this) + ')';
      }
    });
  
    $('body > .describe').fn({
      selector: function() { return 'body > .describe' }
    });
    
    function enqueueRunWithContinuation() {
        var self = $(this).trigger('enqueued');
        $(Screw)
          .queue(function() {
            self.fn('run');
            setTimeout(function() { $(Screw).dequeue() }, 0);
          });
    }

    $('.it').fn({
      parent: function() {
        return $(this).parent('.its').parent('.describe');
      },
      
      run: function() {
        try {
          $(this).data('screwunit.run')();
          $(this).trigger('passed');
        } catch(e) {
          $(this).trigger('failed', [e]);
        }
      },
      
      enqueue: function() {
        $(this).fn('parent').fn('enqueue_befores');
        enqueueRunWithContinuation.apply(this);
        $(this).fn('parent').fn('enqueue_afters');
      },
      
      selector: function() {
        return $(this).fn('parent').fn('selector')
          + ' > .its > .it:eq(' + $(this).parent('.its').children('.it').index(this) + ')';
      }
    });
    
    $('.before, .after, .once-before, .once-after').fn({
      enqueue: function() {
          var self = $(this).trigger('enqueued');
          enqueueRunWithContinuation.apply(this);
      },
      run: function() { $(this).data('screwunit.run')() }
    });

    $(Screw).trigger('before');
    var to_run = unescape(location.search.slice(1)) || 'body > .describe > .describes > .describe';
    $(to_run)
      .focus()
      .eq(0).trigger('scroll').end()
      .fn('enqueue');
    $(Screw).queue(function() { $(Screw).trigger('after') });
  })
})(jQuery);
