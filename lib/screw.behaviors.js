(function($) {

  var uriParams = {};
  (function () {
    var e,
    a = /\+/g,  // Regex for replacing addition symbol with a space
    r = /([^&=]+)=?([^&]*)/g,
    d = function (s) {
      return decodeURIComponent(s.replace(a, " "));
    },
    q = window.location.search.substring(1);

    while (e = r.exec(q))
      uriParams[d(e[1])] = d(e[2]);
    }
  )();

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
      
      run_befores: function(it) {
        $(this).fn('parent').fn('run_befores', it);
        $(this).children('.befores').children('.before').fn('run', it);
      },

      run_afters: function(last) {
        $(this).children('.afters').children('.after').fn('run');
        $(this).fn('parent').fn('run_afters');
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
        var self = $(this);

        function trigger(type, description) {
          self.trigger(type, description);
          self.fn('parent').fn('run_afters');
		  setTimeout(function() {$(Screw).dequeue()}, 0);
        }

        function runJob(job, remainingJobs) {
          try {
            job();
            if(remainingJobs.length > 0) {
              runAsyncJobs(remainingJobs);
            } else {
              trigger('passed');
            }
          } catch(e) {
            trigger('failed', [e]);
          }
        }

        function runWaitFor(waitForJob, timeWaited, remainingJobs) {
          var pollingTimeout = 25; // waitFor is polled every x ms.
          window.setTimeout(function() {
            if(waitForJob()) {
              runAsyncJobs(remainingJobs);
            } else if(timeWaited < waitForJob.timeout) {
              runWaitFor(waitForJob, timeWaited + pollingTimeout, remainingJobs);
            } else {
              trigger('failed', [waitForJob.description]);
            }
          }, pollingTimeout);
        }

        function runAsyncJobs(asyncJobs) {
          if(asyncJobs.length > 0) {
            var nextJob = asyncJobs[0];
            var remainingJobs = asyncJobs.slice(1);

            if(nextJob.type === "waitFor") {
              runWaitFor(nextJob, 0, remainingJobs);
            } else {
              runJob(nextJob, remainingJobs);
            }
          } else {
            trigger('passed');
          }
        }

        $(this).fn('parent').fn('run_befores', this);
        if($(this).data('screwunit.run')) {
          runJob($(this).data('screwunit.run'), []);
        } else {
          runAsyncJobs($(this).data('screwunit.asyncJobs'));
        }
      },

      enqueue: function() {
        var self = $(this).trigger('enqueued');
        $(Screw)
          .queue(function() {
            self.fn('run');
          });
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
      run: function(it) {
        var context = $(this).data('screwunit.context');
        if(!context || $(it).closest(context).length) {
          $(this).data('screwunit.run')()
        }
      }
    });

    $(Screw).trigger('before');
    var to_run = uriParams['screwunitSubset'] || 'body > .describe > .describes > .describe';
    $('div.describe>h3, .describe>h1, .it>h2').filter(function(){return $(this).text() == to_run}).parent()
      .focus()
      .eq(0).trigger('scroll').end()
      .fn('enqueue');
    $(to_run)
      .focus()
      .eq(0).trigger('scroll').end()
      .fn('enqueue');
    $(Screw).queue(function() { $(Screw).trigger('after') });
  })
})(jQuery);
