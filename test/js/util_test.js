describe('Util function:', function() {
  describe('valueOrFn', function() {
    it('returns result from function call when a function', function() {
      var fn = function() { return 5; };
      expect(_.valueOrFn(fn)).toBe(5);
    });

    it('returns the value when a value', function() {
      expect(_.valueOrFn(6)).toBe(6);
    });
  });

  describe('decorator', function() {
    describe('.eventEmitter', function() {
      var obj;
      beforeEach(function() {
        obj = {};
        _.decorate(obj, _.decorator.eventEmitter);
      });

      it('adds method .on("event", callback)', function() {
        expect(obj.on).toBeDefined();
      });

      it('adds private method emit_("event", args)', function() {
        expect(obj.emit_).toBeDefined();
      });

      it('listeners get notified when an event is emitted', function() {
        var callback = jasmine.createSpy('callback');
        obj.on('event', callback);

        expect(callback).not.toHaveBeenCalled();
        var args = {color:'blue'};
        obj.emit_('event', args);
        expect(callback).toHaveBeenCalledWith(args);
      });

      describe('.eventFn', function() {
        beforeEach(function() {
          obj.ready = _.decorator.eventEmitter.eventFn('ready');
        });

        it('listeners get notified when the event fn is called', function() {
          var callback = jasmine.createSpy('callback');
          obj.ready(callback);

          expect(callback).not.toHaveBeenCalled();
          var args = {color:'blue'};
          obj.ready(args);
          expect(callback).toHaveBeenCalledWith(args);
        });

        it('listeners get notified when the event is emitted', function() {
          var callback = jasmine.createSpy('callback');
          obj.ready(callback);

          expect(callback).not.toHaveBeenCalled();
          var args = {color:'blue'};
          obj.ready(args);
          expect(callback).toHaveBeenCalledWith(args);
        });
      });
    });
  });
});
