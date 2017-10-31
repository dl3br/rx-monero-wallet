import * as rxjsfetch from 'rxjs-fetch';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/of';

const rpcBody = (method) => (params) =>
  ({
    jsonrpc: '2.0',
    id: '0',
    method: method,
    params: params,
  })


// curried so that if i want to create class of curried functions for a given
// wallet possible althought not using it as of now
const configRequest = (args1) => (arg2) =>
  ({
    method: 'Post',
    headers: { 'Content-Type': 'application/json' },
    ...args1,
    body: JSON.stringify(arg2),
  })


const jsonRpcRequest = (url) => (method, params = {}) =>
  configRequest({ url })(
    rpcBody(method)(params))


export const request = (url) => (method, params?) =>
  rxjsfetch(url, jsonRpcRequest(url)(method, params))
    .flatMap((res) => res.json())
    .map((response: Response) => response.result)


export const makeUrl = (protocol, ip, port, interFace): string =>
  `${protocol}://${ip}:${port}/${interFace}`;


interface Response {
  id: string;
  jsonrpc: string;
  result: any;
}
