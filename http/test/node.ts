'use strict';
declare var process: any;
var uri = 'http://localhost:5000';
process.env.PORT = 5000;
import './support/server';
import common from './common';
common(uri);

// Node.js specific ============================================================
import * as assert from 'assert';
import * as Rx from 'rxjs';
import Cycle from '@cycle/rxjs-run';
import {makeHTTPDriver} from '../src/index';
import globalSandbox from './support/global';

describe('HTTP Driver in Node.js', function () {
  it('should auto-execute HTTP request when without listening to response stream',
    function(done) {
      function main() {
        return {
          HTTP: Rx.Observable.of({
            url: uri + '/pet',
            method: 'POST',
            send: {name: 'Woof', species: 'Dog'}
          })
        }
      }

      var output = Cycle(main, { HTTP: makeHTTPDriver() });
      globalSandbox.petPOSTResponse = null;
      output.run();

      setTimeout(function () {
        assert.notStrictEqual(globalSandbox.petPOSTResponse, null);
        assert.strictEqual(globalSandbox.petPOSTResponse, 'added Woof the Dog');
        globalSandbox.petPOSTResponse = null;
        done();
      }, 250);
    }
  );

  it('should not auto-execute lazy request without listening to response stream',
    function(done) {
      function main() {
        return {
          HTTP: Rx.Observable.of({
            url: uri + '/pet',
            method: 'POST',
            send: {name: 'Woof', species: 'Dog'},
            lazy: true
          })
        }
      }

      var output = Cycle(main, { HTTP: makeHTTPDriver() });
      globalSandbox.petPOSTResponse = null;
      output.run();

      setTimeout(function () {
        assert.strictEqual(globalSandbox.petPOSTResponse, null);
        done();
      }, 250);
    }
  );

  it('should execute lazy HTTP request when listening to response stream',
    function(done) {
      function main() {
        return {
          HTTP: Rx.Observable.of({
            url: uri + '/pet',
            method: 'POST',
            send: {name: 'Woof', species: 'Dog'},
            lazy: true
          })
        }
      }

      var output = Cycle(main, { HTTP: makeHTTPDriver() });
      globalSandbox.petPOSTResponse = null;

      output.sources.HTTP.select()
        .mergeAll()
        .subscribe();

      output.run();

      setTimeout(function () {
        assert.notStrictEqual(globalSandbox.petPOSTResponse, null);
        assert.strictEqual(globalSandbox.petPOSTResponse, 'added Woof the Dog');
        globalSandbox.petPOSTResponse = null;
        done();
      }, 250);
    }
  );

  it('should add request options object to each response',
    function(done) {
      function main() {
        return {
          HTTP: Rx.Observable.of({
            url: uri + '/pet',
            method: 'POST',
            send: {name: 'Woof', species: 'Dog'},
            _id: 'petRequest'
          })
        }
      }

      var output = Cycle(main, { HTTP: makeHTTPDriver() });

      output.sources.HTTP.select()
        .mergeAll()
        .subscribe(function (r: any) {
          assert.ok(r.request);
          assert.strictEqual(r.request._id, 'petRequest');
          done();
        });

      output.run();
    }
  );
});
