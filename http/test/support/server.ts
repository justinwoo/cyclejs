import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import globalSandbox from './global';

var app = express();

app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.set('Cache-Control', 'no-cache, no-store');
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/hello', function(req: express.Request, res: express.Response){
  setTimeout(function () {
    var contentTypeHeader = req.get('Content-Type');
    if (!contentTypeHeader) {
      res.send('Hello World');
    } else {
      res.status(500).send(
        'Expected Content-Type request header to be undefined, but got ' + contentTypeHeader
      );
    }
  }, 150);
});

app.post('/pet', function(req: express.Request, res: express.Response){
  setTimeout(function () {
    var result = 'added ' + req.body.name + ' the ' + req.body.species;
    globalSandbox.petPOSTResponse = result;
    res.send(result);
  }, 150);
});

app.get('/json', function(req: express.Request, res: express.Response){
  setTimeout(function () {
    res.status(200).json({ name: 'manny' });
  }, 150);
});

app.get('/querystring', function(req: express.Request, res: express.Response){
  setTimeout(function () {
    res.send(req.query);
  }, 150);
});

app.get('/error', function(req: express.Request, res: express.Response){
  setTimeout(function () {
    res.status(500).send('boom');
  }, 150);
});

app.delete('/delete', function(req: express.Request, res: express.Response){
  setTimeout(function () {
    res.status(200).json({deleted: true})
  }, 150);
})

declare var process: any;
app.listen(process.env.PORT);
