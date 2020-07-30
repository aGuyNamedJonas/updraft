import { aWithoutB } from "./fileHelper"

describe('fileHelper', () => {
  test('aWithoutB filters everything out of array a that is present in array b', () => {
    const aNum = [1, 2, 3, 4, 5]
    const bNum = [0, 2, 4]
    const aWoBNum = [1, 3, 5]
    expect(aWithoutB(aNum, bNum)).toStrictEqual(aWoBNum)

    const aStr = ["cat", "dog", "fly", "mosquito"]
    const bStr = ["mosquito", "alligator", "fly"]
    const aWoBStr = ["cat", "dog"]
    expect(aWithoutB(aStr, bStr)).toStrictEqual(aWoBStr)
  })
})
