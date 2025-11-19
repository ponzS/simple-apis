# simple-apis
[![npm version](https://img.shields.io/npm/v/simple-apis.svg)](https://www.npmjs.com/package/simple-apis) [![npm downloads](https://img.shields.io/npm/dm/simple-apis.svg)](https://www.npmjs.com/package/simple-apis) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[中文文档](./README.zh-CN.md)

A minimal, curried wrapper around axios with `simple.post(url)(data)` ergonomics.

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
  simple.get('https://example.com/api/v1/fs/stats', {
    headers: { 'x-hc-user-id': 'your-user-id' }
  })()
  ```

## TypeScript Generics
- Specify request and response types:
  ```ts
  simple.post<{ name: string }, { id: string }>('https://example.com/api/users')({ name: 'Grok' })
    .then(res => res.data.id)
  ```

## Knowledge API Examples
- Base URL: `https://knowledge.ponzsdev.heiyu.space/api`
- Common endpoints:
  - Health: `GET /health`
  - Config: `GET /v1/config`
  - RAG Health: `GET /v1/rag/health`
  - FS Stats: `GET /v1/fs/stats` (optional header `x-hc-user-id`)

- Example:
  ```ts
  const base = 'https://knowledge.ponzsdev.heiyu.space/api'

  await simple.get(`${base}/health`)()
  await simple.get(`${base}/v1/config`)()
  await simple.get(`${base}/v1/rag/health`)()
  await simple.get(`${base}/v1/fs/stats`, { headers: { 'x-hc-user-id': 'uid-123' } })()
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