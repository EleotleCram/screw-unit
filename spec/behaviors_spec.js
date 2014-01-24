Screw.Unit(function() {
  var global_before_invoked = false, global_after_invoked = false;
  before(function() { global_before_invoked = true });
  after(function() { global_after_invoked = true });
  
  describe('Behaviors', function() {
    describe('#run', function() {
      describe("a simple [describe]", function() {
        it("invokes the global [before] before an [it]", function() {
          expect(global_before_invoked).to(equal, true);
          global_before_invoked = false;
        });

        it("invokes the global [before] before each [it]", function() {
          expect(global_before_invoked).to(equal, true);
          global_after_invoked = false;
        });

        it("invokes the global [after] after an [it]", function() {
          expect(global_after_invoked).to(equal, true);
        });
      });
      
      describe("a [describe] with a [before] and [after] block", function() {
        var before_invoked = false, after_invoked = false;
        before(function() { before_invoked = true });
        after(function() { after_invoked = true });
      
        describe('[after] blocks', function() {
          it("does not invoke the [after] until after the first [it]", function() {
            expect(after_invoked).to(equal, false);
          });
          
          it("invokes the [after] after the first [it]", function() {
            expect(after_invoked).to(equal, true);
            after_invoked = false;
          });
          
          it("invokes the [after] after each [it]", function() {
            expect(after_invoked).to(equal, true);
          });
        });
      
        describe('[before] blocks', function() {
          it("invokes the [before] before an it", function() {
            expect(before_invoked).to(equal, true);
            before_invoked = false;
          });
      
          it("invokes the [before] before each it", function() {
            expect(before_invoked).to(equal, true);
          });
        });
      });

      describe("A [describe] with two [before] and two [after] blocks", function() {
        var before_invocations = [], after_invocations = [];
        before(function() { before_invocations.push('before 1') });
        before(function() { before_invocations.push('before 2') });
        
        after(function() { after_invocations.push('after 1') });
        after(function() { after_invocations.push('after 2') });
        
        it("invokes the [before]s in lexical order before each [it]", function() {
          expect(before_invocations).to(equal, ['before 1', 'before 2']);
        });

        it("invokes the [afters]s in lexical order after each [it]", function() {
          expect(after_invocations).to(equal, ['after 1', 'after 2']);
        });
      });

      describe("A describe with a nested describe", function() {
        var before_invocations = [], after_invocations = [];

        before(function() {
          before_invocations.push("outermost before");
        });

        after(function() {
          after_invocations.push("outermost after");
        });
      
        it("outside a nested [describe], does not invoke any of the nested's [before]s", function() {
          expect(before_invocations).to(equal, ["outermost before"]);
        });
        
        it("outside a nested [describe], does not invoke any of the nested's [after]s", function() {
          expect(after_invocations).to(equal, ["outermost after"]);
        });
      });

      describe("two nested [describe]s with [before] and [after] blocks", function() {
        var invocations = [];

        function addBeforesAndAftersAndIts(innerOrOuter) {
          before(function() { invocations.push(innerOrOuter + ' before 1'); });
          before(function() { invocations.push(innerOrOuter + ' before 2'); });
          after(function() { invocations.push(innerOrOuter + ' after 1'); });
          after(function() { invocations.push(innerOrOuter + ' after 2'); });
          it(innerOrOuter + " test it 1", function() { invocations.push(innerOrOuter + ' test it 1'); });
        }

        describe("outer test describe", function() {
          addBeforesAndAftersAndIts('outer');
          it("outer test it 2", function() { invocations.push('outer test it 2'); });

          describe("inner test describe", function() {
            addBeforesAndAftersAndIts('inner');
          });
        });

        // The describe here ensures that the test fixture above is run first, so that the 'it' below
        // can assert the proper invocation order.
        describe("", function() {
          it("runs all blocks in the correct order", function() {
            expect(invocations).to(equal,
              [
                "outer before 1",
                "outer before 2",
                  "outer test it 1",
                "outer after 1",
                "outer after 2",
                "outer before 1",
                "outer before 2",
                  "outer test it 2",
                "outer after 1",
                "outer after 2",
                "outer before 1",
                "outer before 2",
                  "inner before 1",
                  "inner before 2",
                    "inner test it 1",
                  "inner after 1",
                  "inner after 2",
                "outer after 1",
                "outer after 2",
              ]);
          });
        });
      });

      describe("A describe block with exceptions", function() {
        var after_invoked = false;
        after(function() {
          after_invoked = true;
        });
        
        describe("an exception in a test", function() {
          it("fails because it throws an exception", function() {
            throw('an exception');
          });
          
          it("invokes [after]s even if the previous [it] raised an exception", function() {
            expect(after_invoked).to(equal, true);
          });
        });
      });
    });

    describe("#selector", function() {
      describe('a [describe]', function() {
        it('manufactures a CSS selector that uniquely locates the [describe]', function() {
          $('.describe').each(function() {
            expect($($(this).fn('selector')).get(0)).to(equal, $(this).get(0))
          });
        });
      });

      describe('an [it]', function() {
        it('manufactures a CSS selector that uniquely locates the [it]', function() {
          $('.it').each(function() {
            expect($($(this).fn('selector')).get(0)).to(equal, $(this).get(0))
          });
        });
      });
    });
  });
});