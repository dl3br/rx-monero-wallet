Client Monero wallet RPC TypeScript 
===================================

**Client for the monero-wallet-rpc using rxjs**

Examples
========

initialize the wallet object
----------------------------

``` javascript
import { makeUrl, Wallet, Atomic, generatePaymentId } from './lib/wallet'
const url = makeUrl('http', '127.0.0.1', '18082', 'json_rpc');
const wallet = Wallet(url)
```

then query the address of the current wallet
--------------------------------------------

``` javascript
wallet.getaddress()
  .map((res) => res.address)
  .subscribe(console.log)
```

    9wq792k9sxVZiLn66S3Qzv8QfmtcwkdXgM5cWGsXAPxoQeMQ79md51PLPCijvzk1iHbuHi91pws5B7iajTX9KTtJ4bh2tCh

if you prefer working with Promise, query the address with
----------------------------------------------------------

``` javascript
wallet.getaddress()
  .map((res) => res.address) //optional line, but demonstrates the advantage of Observable over Promise
  .toPromise()
  .then(console.log)
```

    9wq792k9sxVZiLn66S3Qzv8QfmtcwkdXgM5cWGsXAPxoQeMQ79md51PLPCijvzk1iHbuHi91pws5B7iajTX9KTtJ4bh2tCh

which is equivalent to:

``` javascript
wallet.getaddress()
  .toPromise()
  .then((res) => console.log(res.address))
```

    9wq792k9sxVZiLn66S3Qzv8QfmtcwkdXgM5cWGsXAPxoQeMQ79md51PLPCijvzk1iHbuHi91pws5B7iajTX9KTtJ4bh2tCh

get the wallets balance
-----------------------

``` javascript
wallet.getbalance()
  .map((res) => new Atomic(res.balance).toXmr().toString())
  .subscribe(console.log)
```

    '707.446307580127'

make an integrated address
--------------------------

``` javascript
wallet.make_integrated_address({ payment_id: generatePaymentId(16) })
  .subscribe(console.log)
```

    { integrated_address: 'A7Xn9qZeVE1ZiLn66S3Qzv8QfmtcwkdXgM5cWGsXAPxoQeMQ79md51PLPCijvzk1iHbuHi91pws5B7iajTX9KTtJ6HrNTTbikgW5Zm1CGn',
      payment_id: 'a14ba0c1f740c728' }

get payments using a list of payment~id~
----------------------------------------

-   only one payment~id~ used on this example

``` javascript
wallet.get_bulk_payments({ payment_ids: ['1234567890123456'],
                           min_block_height: 0 })
  .map((res) => res.payments)
  .subscribe(console.log)
```

    [ { amount: 1000000000000,
        block_height: 12132,
        payment_id: '1234567890123456',
        tx_hash: 'ccd72c2394ad840fc6f0d475ac612e6cbe983ab9db953d7f3c7831c4caa40699',
        unlock_time: 0 } ]

listen to transfers send to the current wallet in mempool
---------------------------------------------------------

-   uses recursive subscription to an Observable
-   the 3 arguments for .subscribe are the following callbacks: onNext,
    onError and onComplete
-   delay is the interval to wait between subscriptions in ms

``` javascript
const streamtransfers = () => wallet.get_transfers({ pool: true })
  .delay(1000)
  .map((res) => res.pool)
  .filter((pool) => pool != undefined)
  .subscribe(console.log,
             console.error,
             streamtransfers)

streamtransfers()
```

    [ { amount: 1000000000000,
        fee: 0,
        height: 0,
        note: '',
        payment_id: '0000000000000000',
        timestamp: 1498741571,
        txid: '21018c28384df394eca65a0bece75ae52611551b458757c844381663bfbad029',
        type: 'pool' } ]

create a block height change detector
-------------------------------------

``` javascript
let lastHeight
const heightChangeDetector = () => wallet.getheight()
  .delay(1000)
  .map((res) => res.height)
  .filter((height) => height !== lastHeight)
  .map((height) => lastHeight = height)
  .subscribe(
    console.log,
    console.error,
    heightChangeDetector)

heightChangeDetector()
```

    20838
    20839
    20840
    20842
    20843

``` javascript
const streamheight = () => wallet.getheight()
  .map((res) => res.height)
  .delay(1000)
  .subscribe(console.log,
             console.error,
             streamheight)

streamheight()
```

    18172
    18172
    18172
    18172
    18172
    18172
    18172
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18173
    18175
    18175
    18175
    18175
    18175

same stream but now using a more useful callback for error recovery.

``` javascript
const streamheight = () => wallet.getheight()
  .map((res) => res.height)
  .delay(1000)
  .subscribe(console.log,
             (err) => { console.error(err) ;
                        streamheight() },
             streamheight)

streamheight()
```

Donation
--------

if the library is useful for you, consider throwing XMR to:

    42Eky2DHrD5NYyrgfB48dBJ8YPBN1MBxTTWb5V9KgPT2SSBkmukzW4pJnkWuGomc1u7Mw28FNTW6a7TUaZHdAcVD2CHvmc5

if it annoys you, try to steal from that wallet.

References
----------

Reference for using monero’s wallet rpc from which this library derives:
<https://getmonero.org/knowledge-base/developer-guides/wallet-rpc>

It might fit together with <https://github.com/cryptoshrimpi/monerod-js>
that communicates with the monero daemon with typescript

I based myself on <https://github.com/PsychicCat/monero-nodejs> for the
utils

Types and Typescript and Observables
------------------------------------

I added most of the types, thus please use a text editor with decent
support for typescript for getting all the autocompletion and
typechecking magic, and enjoy the coding experience without having to
console.log everything

I wrote this library using functional reactive programming (to learn
about it), in special the Observable monad. There’s a real benefit to
have a type system when using Observables, as one can map over objects
(with autocompletion) that were not yet observed.
