'use strict';
import * as assert from 'assert';
import {makeHTTPDriver} from '../src/index';
import {Response} from '../src/interfaces';
import * as Rx from 'rxjs';
import Cycle from '@cycle/rxjs-run';
var uri = '//' + window.location.host;
import common from './common';
common(uri);

declare var global: any;
global.mocha.globals(['Cyclejs']);

describe('HTTP Driver in the browser', function () {
  it('should be able to emit progress events on the response stream', function(done) {
    function main() {
      return {
        HTTP: Rx.Observable.of({
          url: uri + '/querystring',
          method: 'GET',
          progress: true,
          query: {foo: 102030, bar: 'Pub'}
        })
      }
    }
    var output = Cycle(main, { HTTP: makeHTTPDriver() });
    var response$$ = output.sources.HTTP.select();

    response$$.subscribe(function(response$: any) {
      assert.strictEqual(response$.request.url, uri + '/querystring');
      assert.strictEqual(response$.request.method, 'GET');
      assert.strictEqual(response$.request.query.foo, 102030);
      assert.strictEqual(response$.request.query.bar, 'Pub');
      var progressEventHappened = false;
      response$.subscribe(function(response: Response) {
        if (response.type === 'progress') {
          assert.strictEqual(typeof response['total'], 'number');
          progressEventHappened = true;
        } else {
          assert.strictEqual(progressEventHappened, true);
          assert.strictEqual(response.status, 200);
          assert.strictEqual(response.body['foo'], '102030');
          assert.strictEqual(response.body['bar'], 'Pub');
          done();
        }
      });
    });

    output.run();
  });
});
