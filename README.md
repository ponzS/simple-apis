# simple-apis
[![npm version](https://img.shields.io/npm/v/simple-apis.svg)](https://www.npmjs.com/package/simple-apis) [![npm downloads](https://img.shields.io/npm/dm/simple-apis.svg)](https://www.npmjs.com/package/simple-apis) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[中文文档](./README.zh-CN.md)

A minimal, curried wrapper around axios&unsea with `simple.post(url)(data)` ergonomics.

## Install
- Using pnpm:
  ```bash
  pnpm add simple-apis
  ```

## Quick Start
- POST request:
  ```ts
  import { simple } from 'simple-apis'

  simple.post('https://example.com/api/users')({ name: 'Grok', age: 1 })
    .then(response => console.log(response.data))
    .catch(error => console.error(error))
  ```

- Pass a typed object variable:
  ```ts
  import { simple } from 'simple-apis'

  type CreateUserPayload = { name: string; age: number }
  const payload: CreateUserPayload = { name: 'Grok', age: 1 }

  simple.post<CreateUserPayload>('https://example.com/api/users')(payload)
    .then(response => console.log(response.data))
    .catch(error => console.error(error))
  ```

- GET request:
  ```ts
  simple.get('https://example.com/api/users')()
    .then(res => console.log(res.data))
    .catch(err => console.error(err))
  ```

## Headers and Config
- Same as axios. Provide `AxiosRequestConfig` as the second argument:
  ```ts
  simple.get('https://example.com/api/stats', {
    headers: { 'x-hc-user-id': 'your-user-id' }
  })()
  ```

## TypeScript Generics
- Specify request and response types:
  ```ts
  simple.post<{ name: string }, { id: string }>('https://example.com/api/users')({ name: 'Grok' })
    .then(res => res.data.id)
  ```

## Browser (Pure HTML) Demo
- See `examples/index.html` in this repo.
- Run locally:
  1. Start a static server in repo root (pick one)
     - `python3 -m http.server 8000`
     - Or any static server tool
  2. Visit `http://localhost:8000/examples/index.html`
## Design
- Curried axios methods:
  - `post(url)(payload)`, `put(url)(payload)`, `patch(url)(payload)`
  - `get(url)()`, `delete(url)()`
- Benefits:
  - Concise, natural chained style
  - Easy to reuse functions bound with `url` and `config`

## Environment
- Node.js `>= 18`
- ESM modules

## Exports
- Entry: `simple`
  - `simple.get(url, config?)() => Promise<AxiosResponse<T>>`
  - `simple.post(url, config?)(payload) => Promise<AxiosResponse<T>>`
  - `simple.put(url, config?)(payload) => Promise<AxiosResponse<T>>`
  - `simple.patch(url, config?)(payload) => Promise<AxiosResponse<T>>`
  - `simple.delete(url, config?)() => Promise<AxiosResponse<T>>`

## New: Fetch wrappers and Unsea encryption

- Curried `fetch` wrappers (return raw `Response`):
  - `simple.fetch.get(url, init?)() => Promise<Response>`
  - `simple.fetch.post(url, init?)(payload) => Promise<Response>`
  - `simple.fetch.put(url, init?)(payload) => Promise<Response>`
  - `simple.fetch.patch(url, init?)(payload) => Promise<Response>`
  - `simple.fetch.delete(url, init?)() => Promise<Response>`
- Curried `fetchJSON` wrappers (auto `res.json()`):
  - `simple.fetchJSON.get<T>(url, init?)() => Promise<T>`
  - `simple.fetchJSON.post<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>`
  - `simple.fetchJSON.put<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>`
  - `simple.fetchJSON.patch<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>`
  - `simple.fetchJSON.delete<T>(url, init?)() => Promise<T>`
- Unsea encryption sugar for axios:
  - `simple.postEncrypted(url, keys, config?)(payload)`
  - `simple.putEncrypted(url, keys, config?)(payload)`
  - `simple.patchEncrypted(url, keys, config?)(payload)`
- Chainable secure builder:
  - `simple.secure({ sender, receiverPublicKey }).post(url)(payload)` (axios)
  - `simple.secure(...).fetch.post(url, init?)(payload)` (fetch + auto JSON)
- Object-level helpers:
  - `crypto.encrypt(payload, { sender, receiverPublicKey })`
  - `crypto.decrypt(cipher, { receiver, senderPublicKey })`

> Code locations:
- `axios encryption sugar` in `src/index.ts:140–159`
- `secure builder` in `src/index.ts:161–205`
- `fetch wrappers` in `src/index.ts:83–136`
- `object helpers` in `src/index.ts:207–218`

## Usage Examples

### 1) Axios (existing)
```ts
import { simple } from 'simple-apis'

await simple.post('https://api.example.com/users')({ name: 'Alice' })
await simple.get('https://api.example.com/users')()
```

### 2) Fetch (raw Response)
```ts
const res = await simple.fetch.post('https://api.example.com/users')({ name: 'Alice' })
const data = await res.json()
```

### 3) Fetch (auto JSON)
```ts
type Resp = { id: string }
const created = await simple.fetchJSON.post<{ name: string }, Resp>('https://api.example.com/users')({ name: 'Alice' })
```

### 4) Send encrypted body (axios sugar)
```ts
import { simple, generateRandomPair, importFromPEM } from 'simple-apis'

const clientKeys = await generateRandomPair()
const serverPubPEM = '-----BEGIN PUBLIC KEY-----...'
const serverPub = await importFromPEM(serverPubPEM)

await simple.postEncrypted('https://api.example.com/secure', {
  sender: clientKeys,
  receiverPublicKey: serverPub,
})({ secret: 'top' })
```

### 5) Chainable secure builder (axios)
```ts
await simple.secure({ sender: clientKeys, receiverPublicKey: serverPub })
  .post('https://api.example.com/secure')({ secret: 'top' })
```

### 6) Chainable secure builder (fetch + auto JSON)
```ts
type Resp = { ok: boolean }

const resp = await simple.secure({ sender: clientKeys, receiverPublicKey: serverPub })
  .fetch.post<{ secret: string }, Resp>('https://api.example.com/secure')({ secret: 'top' })
```

### 7) Object encrypt/decrypt (simplest syntax)
```ts
import { crypto } from 'simple-apis'

const encrypted = await crypto.encrypt({ hello: 'world' }, {
  sender: clientKeys,
  receiverPublicKey: serverPub,
})

// server-side example
const plain = await crypto.decrypt(encrypted, {
  receiver: serverKeys,
  senderPublicKey: clientPub,
})
```

## Server-side decrypt reference
```ts
import { decryptBySenderForReceiver } from 'simple-apis'

// serverKeys: server keypair (with private key)
// clientPub: client public key
const data = await decryptBySenderForReceiver(serverKeys, clientPub, cipherBody)
```

## Key semantics
- `sender`: sender keypair (client)
- `receiverPublicKey`: receiver public key (server)
- `receiver`: decrypting keypair (server)
- `senderPublicKey`: sender public key (client)

## Notes
- `simple.secure(...).fetch` currently provides `post/put/patch` methods.
- With `fetch`, the second `init` argument lets you override `headers/credentials` etc.
- Unsea encrypted objects include sender pubkey and timestamp metadata for verification.

## Simple P2P Encryption Example

```ts
import {
  generateRandomPair,
  encryptMessageWithMeta,
  decryptMessageWithMeta,
} from 'simple-apis'

// Alice and Bob generate their keypairs (each has { pub, priv, epub, epriv })
const alice = await generateRandomPair()
const bob = await generateRandomPair()

// Alice → Bob (Alice encrypts for Bob using Bob's encryption public key)
const cipherForBob = await encryptMessageWithMeta(
  JSON.stringify({ from: 'alice', text: 'hello bob' }),
  { epub: bob.epub }
)

// Bob decrypts using his encryption private key
const plainForBob = await decryptMessageWithMeta(cipherForBob, bob.epriv)
console.log(JSON.parse(plainForBob)) // { from: 'alice', text: 'hello bob' }

// Bob → Alice (Bob encrypts for Alice using Alice's encryption public key)
const cipherForAlice = await encryptMessageWithMeta(
  JSON.stringify({ from: 'bob', text: 'hey alice' }),
  { epub: alice.epub }
)
const plainForAlice = await decryptMessageWithMeta(cipherForAlice, alice.epriv)
console.log(JSON.parse(plainForAlice)) // { from: 'bob', text: 'hey alice' }
```

## API Reference

### Core (axios)
| API | Signature | Purpose |
| --- | --- | --- |
| `simple.get` | `get(url, config?)() => Promise<AxiosResponse<T>>` | Curried GET via axios. |
| `simple.post` | `post(url, config?)(payload) => Promise<AxiosResponse<T>>` | Curried POST via axios. |
| `simple.put` | `put(url, config?)(payload) => Promise<AxiosResponse<T>>` | Curried PUT via axios. |
| `simple.patch` | `patch(url, config?)(payload) => Promise<AxiosResponse<T>>` | Curried PATCH via axios. |
| `simple.delete` | `delete(url, config?)() => Promise<AxiosResponse<T>>` | Curried DELETE via axios. |

### Fetch wrappers (raw Response)
| API | Signature | Purpose |
| --- | --- | --- |
| `simple.fetch.get` | `get(url, init?)() => Promise<Response>` | GET returning raw `Response`. |
| `simple.fetch.post` | `post(url, init?)(payload) => Promise<Response>` | POST returning raw `Response`. |
| `simple.fetch.put` | `put(url, init?)(payload) => Promise<Response>` | PUT returning raw `Response`. |
| `simple.fetch.patch` | `patch(url, init?)(payload) => Promise<Response>` | PATCH returning raw `Response`. |
| `simple.fetch.delete` | `delete(url, init?)() => Promise<Response>` | DELETE returning raw `Response`. |

### FetchJSON wrappers (auto JSON)
| API | Signature | Purpose |
| --- | --- | --- |
| `simple.fetchJSON.get` | `get<T>(url, init?)() => Promise<T>` | GET that auto parses JSON. |
| `simple.fetchJSON.post` | `post<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>` | POST with auto JSON. |
| `simple.fetchJSON.put` | `put<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>` | PUT with auto JSON. |
| `simple.fetchJSON.patch` | `patch<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>` | PATCH with auto JSON. |
| `simple.fetchJSON.delete` | `delete<T>(url, init?)() => Promise<T>` | DELETE with auto JSON. |

### Encryption sugar (axios)
| API | Signature | Purpose |
| --- | --- | --- |
| `simple.postEncrypted` | `postEncrypted(url, { receiverPublicKey }, config?)(payload)` | Encrypt body with Unsea, POST via axios. |
| `simple.putEncrypted` | `putEncrypted(url, { receiverPublicKey }, config?)(payload)` | Encrypt body, PUT via axios. |
| `simple.patchEncrypted` | `patchEncrypted(url, { receiverPublicKey }, config?)(payload)` | Encrypt body, PATCH via axios. |

### Secure builder (chain)
| API | Signature | Purpose |
| --- | --- | --- |
| `simple.secure` | `secure({ receiverPublicKey })` | Create chain for encrypted requests. |
| `.post` | `.post(url, config?)(payload)` | Axios POST with encrypted body. |
| `.put` | `.put(url, config?)(payload)` | Axios PUT with encrypted body. |
| `.patch` | `.patch(url, config?)(payload)` | Axios PATCH with encrypted body. |
| `.fetch.post` | `.fetch.post(url, init?)(payload)` | Fetch POST with encrypted body; returns JSON. |
| `.fetch.put` | `.fetch.put(url, init?)(payload)` | Fetch PUT with encrypted body; returns JSON. |
| `.fetch.patch` | `.fetch.patch(url, init?)(payload)` | Fetch PATCH with encrypted body; returns JSON. |
| `.expectDecrypted` | `.expectDecrypted(epriv).post(url, config?)(payload)` | Axios POST: encrypt request and auto-decrypt encrypted response using `epriv`. |
| `.fetch.expectDecrypted` | `.fetch.expectDecrypted(epriv).post(url, init?)(payload)` | Fetch POST with encrypt+auto-decrypt. |

### Secure response (auto-decrypt only)
| API | Signature | Purpose |
| --- | --- | --- |
| `secureResponse.expectDecrypted` | `expectDecrypted(epriv).fetchJSON.get(url, init?)()` | Fetch GET: auto-decrypt an encrypted JSON response with `epriv`. |
|  | `expectDecrypted(epriv).fetchJSON.post(url, init?)(payload?)` | Fetch POST: auto-decrypt response. |

### Crypto helpers
| API | Signature | Purpose |
| --- | --- | --- |
| `crypto.encrypt` | `encrypt(payload, { receiverPublicKey }) => Promise<Cipher>` | Encrypt string/object for receiver’s public key. |
| `crypto.decrypt` | `decrypt(cipher, { receiver }) => Promise<string|object>` | Decrypt using receiver’s keypair (`epriv`). |

### Other exports
| API | Signature | Purpose |
| --- | --- | --- |
| `axios` | `import { axios } from 'simple-apis'` | Re-export of axios default for advanced usage. |

### Unsea re-exports
| API | Purpose |
| --- | --- |
| `generateRandomPair` | Generate signing/encryption keypair (P-256). |
| `signMessage` / `verifyMessage` | ECDSA sign/verify helpers. |
| `encryptMessageWithMeta` / `decryptMessageWithMeta` | ECDH + AES-GCM with sender metadata. |
| `exportToPEM` / `importFromPEM` | Convert private/public keys to/from PEM. |
| `exportToJWK` / `importFromJWK` | Convert private key to/from JWK. |
| `saveKeys` / `loadKeys` / `clearKeys` | IndexedDB persistence helpers. |
| `generateWork` / `verifyWork` | SHA-256 proof-of-work helpers. |
| `generateSignedWork` / `verifySignedWork` | Signed proof-of-work helpers. |
| `getSecurityInfo` | Inspect security configuration info. |
