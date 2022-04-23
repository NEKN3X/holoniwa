const right =
  <T>(_a: T) =>
  <U>(b: U) =>
    b

export const log = <T>(a: T) => right(console.log(a))(a)
