# simple-apis
[![npm 版本](https://img.shields.io/npm/v/simple-apis.svg)](https://www.npmjs.com/package/simple-apis) [![npm 下载量](https://img.shields.io/npm/dm/simple-apis.svg)](https://www.npmjs.com/package/simple-apis) [![许可证: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一个基于 axios&unsea 的极简柯里化封装，支持 `simple.post(url)(data)` 的调用体验。

## 安装
- 使用 pnpm：
  ```bash
  pnpm add simple-apis
  ```

## 快速上手
- 发送 POST：
  ```ts
  import { simple } from 'simple-apis'

  simple.post('https://example.com/api/users')({ name: 'Grok', age: 1 })
    .then(response => console.log(response.data))
    .catch(error => console.error(error))
  ```

- 使用对象变量传参：
  ```ts
  import { simple } from 'simple-apis'

  type CreateUserPayload = { name: string; age: number }
  const payload: CreateUserPayload = { name: 'Grok', age: 1 }

  simple.post<CreateUserPayload>('https://example.com/api/users')(payload)
    .then(response => console.log(response.data))
    .catch(error => console.error(error))
  ```

- 发送 GET：
  ```ts
  simple.get('https://example.com/api/users')()
    .then(res => console.log(res.data))
    .catch(err => console.error(err))
  ```

## 传递请求头与配置
- 与 axios 一致，通过第二个参数传入 `AxiosRequestConfig`：
  ```ts
  simple.get('https://example.com/api/stats', {
    headers: { 'x-hc-user-id': 'your-user-id' }
  })()
  ```

## TypeScript 泛型
- 指定请求与响应类型：
  ```ts
  simple.post<{ name: string }, { id: string }>('https://example.com/api/users')({ name: 'Grok' })
    .then(res => res.data.id)
  ```

## 浏览器（纯 HTML）示例
- 本仓库已提供示例页面：`examples/index.html`
- 打开方式（本地）：
  1. 在仓库根目录启动静态服务（任选其一）
     - `python3 -m http.server 8000`
     - 或使用任意静态服务器工具
  2. 访问 `http://localhost:8000/examples/index.html`
## 设计理念
- 将 axios 的方法以柯里化形式暴露：
  - `post(url)(payload)`、`put(url)(payload)`、`patch(url)(payload)`
  - `get(url)()`、`delete(url)()`
- 优点：
  - 调用更简洁，链式风格自然
  - 更易复用已绑定 `url` 与 `config` 的请求函数

## 运行环境
- Node.js `>= 18`
- ESM 模块

## 导出
- 包入口：`simple`
  - `simple.get(url, config?)() => Promise<AxiosResponse<T>>`
  - `simple.post(url, config?)(payload) => Promise<AxiosResponse<T>>`
  - `simple.put(url, config?)(payload) => Promise<AxiosResponse<T>>`
  - `simple.patch(url, config?)(payload) => Promise<AxiosResponse<T>>`
  - `simple.delete(url, config?)() => Promise<AxiosResponse<T>>`

## 新增：Fetch 封装与 Unsea 加密

- 新增 `fetch` 柯里化封装（返回原始 `Response`）：
  - `simple.fetch.get(url, init?)() => Promise<Response>`
  - `simple.fetch.post(url, init?)(payload) => Promise<Response>`
  - `simple.fetch.put(url, init?)(payload) => Promise<Response>`
  - `simple.fetch.patch(url, init?)(payload) => Promise<Response>`
  - `simple.fetch.delete(url, init?)() => Promise<Response>`
- 新增 `fetchJSON` 柯里化封装（自动 `res.json()`）：
  - `simple.fetchJSON.get<T>(url, init?)() => Promise<T>`
  - `simple.fetchJSON.post<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>`
  - `simple.fetchJSON.put<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>`
  - `simple.fetchJSON.patch<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>`
  - `simple.fetchJSON.delete<T>(url, init?)() => Promise<T>`
- 新增 Unsea 加密语法糖（axios）：
  - `simple.postEncrypted(url, keys, config?)(payload)`
  - `simple.putEncrypted(url, keys, config?)(payload)`
  - `simple.patchEncrypted(url, keys, config?)(payload)`
- 新增链式安全构建器：
  - `simple.secure({ sender, receiverPublicKey }).post(url)(payload)`（axios）
  - `simple.secure(...).fetch.post(url, init?)(payload)`（fetch + 自动 JSON）
- 新增对象级加/解密辅助：
  - `crypto.encrypt(payload, { sender, receiverPublicKey })`
  - `crypto.decrypt(cipher, { receiver, senderPublicKey })`

> 代码位置参考：
- `axios 加密语法糖` 在 `src/index.ts:140–159`
- `secure 链式构建器` 在 `src/index.ts:161–205`
- `fetch 封装` 在 `src/index.ts:83–136`
- `对象级加/解密` 在 `src/index.ts:207–218`

## 使用示例

### 1) Axios（原有用法）
```ts
import { simple } from 'simple-apis'

await simple.post('https://api.example.com/users')({ name: 'Alice' })
await simple.get('https://api.example.com/users')()
```

### 2) Fetch（原始 Response）
```ts
const res = await simple.fetch.post('https://api.example.com/users')({ name: 'Alice' })
const data = await res.json()
```

### 3) Fetch（自动 JSON）
```ts
type Resp = { id: string }
const created = await simple.fetchJSON.post<{ name: string }, Resp>('https://api.example.com/users')({ name: 'Alice' })
```

### 4) 发送加密请求体（axios 语法糖）
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

### 5) 链式安全构建器（axios）
```ts
await simple.secure({ sender: clientKeys, receiverPublicKey: serverPub })
  .post('https://api.example.com/secure')({ secret: 'top' })
```

### 6) 链式安全构建器（fetch + 自动 JSON）
```ts
type Resp = { ok: boolean }

const resp = await simple.secure({ sender: clientKeys, receiverPublicKey: serverPub })
  .fetch.post<{ secret: string }, Resp>('https://api.example.com/secure')({ secret: 'top' })
```

### 7) 纯对象加密/解密（语法最简）
```ts
import { crypto } from 'simple-apis'

const encrypted = await crypto.encrypt({ hello: 'world' }, {
  sender: clientKeys,
  receiverPublicKey: serverPub,
})

// 后端收到后解密（示意）
// serverKeys: 服务端密钥对（含私钥）
// clientPub: 客户端公开密钥
const plain = await crypto.decrypt(encrypted, {
  receiver: serverKeys,
  senderPublicKey: clientPub,
})
```

## 服务端解密参考
```ts
import { decryptBySenderForReceiver } from 'simple-apis'

// serverKeys: 服务端密钥对（含私钥）
// clientPub: 客户端公开密钥（可来自请求体元信息或服务端存储）
const data = await decryptBySenderForReceiver(serverKeys, clientPub, cipherBody)
```

## 密钥说明
- `sender`: 发送方密钥对（前端/客户端）
- `receiverPublicKey`: 接收方公开密钥（服务端）
- `receiver`: 解密方密钥对（服务端）
- `senderPublicKey`: 发送方公开密钥（客户端）

## 注意事项
- `simple.secure(...).fetch` 当前提供 `post/put/patch` 三种方法。
- 使用 `fetch` 时，第二个参数 `init` 可覆盖 `headers/credentials` 等配置。
- Unsea 加密对象内含发送者公钥与时间戳等元信息，便于来源校验与时效判断。

## 简单 P2P 加密示例

```ts
import {
  generateRandomPair,
  encryptMessageWithMeta,
  decryptMessageWithMeta,
} from 'simple-apis'

// Alice 与 Bob 各自生成密钥对（均包含 { pub, priv, epub, epriv }）
const alice = await generateRandomPair()
const bob = await generateRandomPair()

// Alice → Bob（Alice 使用 Bob 的加密公钥加密）
const cipherForBob = await encryptMessageWithMeta(
  JSON.stringify({ from: 'alice', text: 'hello bob' }),
  { epub: bob.epub }
)

// Bob 使用自己的加密私钥解密
const plainForBob = await decryptMessageWithMeta(cipherForBob, bob.epriv)
console.log(JSON.parse(plainForBob)) // { from: 'alice', text: 'hello bob' }

// Bob → Alice（Bob 使用 Alice 的加密公钥加密）
const cipherForAlice = await encryptMessageWithMeta(
  JSON.stringify({ from: 'bob', text: 'hey alice' }),
  { epub: alice.epub }
)
const plainForAlice = await decryptMessageWithMeta(cipherForAlice, alice.epriv)
console.log(JSON.parse(plainForAlice)) // { from: 'bob', text: 'hey alice' }
```

## API 参考

### 核心（axios）
| API | 签名 | 用途 |
| --- | --- | --- |
| `simple.get` | `get(url, config?)() => Promise<AxiosResponse<T>>` | 通过 axios 的柯里化 GET。 |
| `simple.post` | `post(url, config?)(payload) => Promise<AxiosResponse<T>>` | 柯里化 POST。 |
| `simple.put` | `put(url, config?)(payload) => Promise<AxiosResponse<T>>` | 柯里化 PUT。 |
| `simple.patch` | `patch(url, config?)(payload) => Promise<AxiosResponse<T>>` | 柯里化 PATCH。 |
| `simple.delete` | `delete(url, config?)() => Promise<AxiosResponse<T>>` | 柯里化 DELETE。 |

### Fetch 封装（返回原始 Response）
| API | 签名 | 用途 |
| --- | --- | --- |
| `simple.fetch.get` | `get(url, init?)() => Promise<Response>` | GET，返回 `Response`。 |
| `simple.fetch.post` | `post(url, init?)(payload) => Promise<Response>` | POST，返回 `Response`。 |
| `simple.fetch.put` | `put(url, init?)(payload) => Promise<Response>` | PUT，返回 `Response`。 |
| `simple.fetch.patch` | `patch(url, init?)(payload) => Promise<Response>` | PATCH，返回 `Response`。 |
| `simple.fetch.delete` | `delete(url, init?)() => Promise<Response>` | DELETE，返回 `Response`。 |

### FetchJSON 封装（自动 JSON）
| API | 签名 | 用途 |
| --- | --- | --- |
| `simple.fetchJSON.get` | `get<T>(url, init?)() => Promise<T>` | GET，自动解析 JSON。 |
| `simple.fetchJSON.post` | `post<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>` | POST，自动 JSON。 |
| `simple.fetchJSON.put` | `put<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>` | PUT，自动 JSON。 |
| `simple.fetchJSON.patch` | `patch<TReq, TResp>(url, init?)(payload?: TReq) => Promise<TResp>` | PATCH，自动 JSON。 |
| `simple.fetchJSON.delete` | `delete<T>(url, init?)() => Promise<T>` | DELETE，自动 JSON。 |

### 加密语法糖（axios）
| API | 签名 | 用途 |
| --- | --- | --- |
| `simple.postEncrypted` | `postEncrypted(url, { receiverPublicKey }, config?)(payload)` | 使用 Unsea 加密请求体后 POST。 |
| `simple.putEncrypted` | `putEncrypted(url, { receiverPublicKey }, config?)(payload)` | 加密请求体后 PUT。 |
| `simple.patchEncrypted` | `patchEncrypted(url, { receiverPublicKey }, config?)(payload)` | 加密请求体后 PATCH。 |

### 链式安全构建器
| API | 签名 | 用途 |
| --- | --- | --- |
| `simple.secure` | `secure({ receiverPublicKey })` | 创建链式安全请求构建器。 |
| `.post` | `.post(url, config?)(payload)` | axios POST，自动加密请求体。 |
| `.put` | `.put(url, config?)(payload)` | axios PUT，自动加密请求体。 |
| `.patch` | `.patch(url, config?)(payload)` | axios PATCH，自动加密请求体。 |
| `.fetch.post` | `.fetch.post(url, init?)(payload)` | fetch POST，自动加密请求体，返回 JSON。 |
| `.fetch.put` | `.fetch.put(url, init?)(payload)` | fetch PUT，自动加密请求体，返回 JSON。 |
| `.fetch.patch` | `.fetch.patch(url, init?)(payload)` | fetch PATCH，自动加密请求体，返回 JSON。 |
| `.expectDecrypted` | `.expectDecrypted(epriv).post(url, config?)(payload)` | axios POST：加密请求 + 自动解密加密响应（用 `epriv`）。 |
| `.fetch.expectDecrypted` | `.fetch.expectDecrypted(epriv).post(url, init?)(payload)` | fetch POST：加密请求 + 自动解密响应。 |

### 安全响应（仅自动解密）
| API | 签名 | 用途 |
| --- | --- | --- |
| `secureResponse.expectDecrypted` | `expectDecrypted(epriv).fetchJSON.get(url, init?)()` | fetch GET：自动解密服务端加密响应。 |
|  | `expectDecrypted(epriv).fetchJSON.post(url, init?)(payload?)` | fetch POST：自动解密响应。 |

### Crypto 辅助
| API | 签名 | 用途 |
| --- | --- | --- |
| `crypto.encrypt` | `encrypt(payload, { receiverPublicKey }) => Promise<Cipher>` | 为接收方公开密钥加密字符串/对象。 |
| `crypto.decrypt` | `decrypt(cipher, { receiver }) => Promise<string|object>` | 使用接收方密钥对解密（使用 `epriv`）。 |

### 其他导出
| API | 签名 | 用途 |
| --- | --- | --- |
| `axios` | `import { axios } from 'simple-apis'` | 透传 axios 默认导出，便于高级用法。 |

### Unsea 透出方法
| API | 用途 |
| --- | --- |
| `generateRandomPair` | 生成签名/加密密钥对（P-256）。 |
| `signMessage` / `verifyMessage` | ECDSA 签名/验签。 |
| `encryptMessageWithMeta` / `decryptMessageWithMeta` | ECDH + AES-GCM，带发送者元信息。 |
| `exportToPEM` / `importFromPEM` | 私钥/公钥的 PEM 转换。 |
| `exportToJWK` / `importFromJWK` | 私钥的 JWK 转换。 |
| `saveKeys` / `loadKeys` / `clearKeys` | IndexedDB 密钥持久化辅助。 |
| `generateWork` / `verifyWork` | SHA-256 工作量证明辅助。 |
| `generateSignedWork` / `verifySignedWork` | 带签名的工作量证明辅助。 |
| `getSecurityInfo` | 查看安全配置相关信息。 |
