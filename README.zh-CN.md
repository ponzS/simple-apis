# super-simple-api

一个基于 axios 的极简柯里化封装，支持 `simple.post(url)(data)` 的调用体验。

## 安装
- 使用 pnpm：
  ```bash
  pnpm add super-simple-api
  ```

## 快速上手
- 发送 POST：
  ```ts
  import { simple } from 'super-simple-api'

  simple.post('https://example.com/api/users')({ name: 'Grok', age: 1 })
    .then(response => console.log(response.data))
    .catch(error => console.error(error))
  ```

- 使用对象变量传参：
  ```ts
  import { simple } from 'super-simple-api'

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
  simple.get('https://example.com/api/v1/fs/stats', {
    headers: { 'x-hc-user-id': 'your-user-id' }
  })()
  ```

## TypeScript 泛型
- 指定请求与响应类型：
  ```ts
  simple.post<{ name: string }, { id: string }>('https://example.com/api/users')({ name: 'Grok' })
    .then(res => res.data.id)
  ```

## 与 Knowledge API 搭配
- 基础地址：`https://knowledge.ponzsdev.heiyu.space/api`
- 常用接口：
  - 健康检查：`GET /health`
  - 配置：`GET /v1/config`
  - RAG 健康：`GET /v1/rag/health`
  - 文件系统统计：`GET /v1/fs/stats`（可选头 `x-hc-user-id`）

- 示例：
  ```ts
  const base = 'https://knowledge.ponzsdev.heiyu.space/api'

  await simple.get(`${base}/health`)()
  await simple.get(`${base}/v1/config`)()
  await simple.get(`${base}/v1/rag/health`)()
  await simple.get(`${base}/v1/fs/stats`, { headers: { 'x-hc-user-id': 'uid-123' } })()
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