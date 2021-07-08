import { hello } from "."

test('"hello" correctly creates proper greeting', () => {
  expect(hello('ts-starter')).toBe('Hello ts-starter!')
})