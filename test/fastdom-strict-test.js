/*global suite, setup, suiteSetup, suiteTeardown, teardown, test, assert, fastdomPromised*/
/*jshint maxlen:false*/

suite('fastdom-strict', function() {
  var raf = window.requestAnimationFrame;
  var fastdom;
  var el;

  suiteSetup(function(done) {
    var script = document.createElement('script');
    script.src = '/base/fastdom-strict.js';
    document.head.appendChild(script);
    script.onload = function() {
      fastdom = window.fastdom.extend(fastdomPromised);
      done();
    };
  });

  suiteTeardown(function() {
    fastdom.strict(false);
  });

  setup(function() {
    return fastdom.mutate(function() {
      el = document.createElement('div');
      el.style.height = '100px';
      el.style.width = '100px';
      document.body.appendChild(el);
    });
  });

  teardown(function() {
    return fastdom.mutate(function() {
      el.remove();
    });
  });

  test('measuring throws outside of fastdom', function() {
    assert.throws(function() {
      return el.clientWidth;
    });
  });

  test('measuring does not throws inside `fastdom.measure()`', function() {
    return fastdom.measure(function() {
      return el.clientWidth;
    });
  });

  test('mutating throws outside of fastdom', function() {
    assert.throws(function() {
      el.innerHTML = 'foo';
    });
  });

  test('mutating does not throws inside `fastdom.mutate()`', function() {
    return fastdom.mutate(function() {
      el.innerHTML = 'foo';
    });
  });

  test('it can be disabled and enabled', function(done) {
    fastdom.strict(false);

    assert.doesNotThrow(function() {
      return el.clientWidth;
    });

    fastdom.strict(true);

    assert.throws(function() {
      return el.clientWidth;
    });

    fastdom.measure(function() {
      el.clientWidth;
    }).then(done);
  });

  test('callback is called with correct context when measuring and mutating', function(done) {
    var ctx1 = { foo: 'bar' };
    var ctx2 = { bar: 'baz' };

    var spy1 = sinon.spy();
    var spy2 = sinon.spy();

    fastdom.measure(spy1, ctx1);
    fastdom.mutate(spy2, ctx2);

    raf(function() {
      assert(spy1.calledOn(ctx1));
      assert(spy2.calledOn(ctx2));
      done();
    });
  });
});
