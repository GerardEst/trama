export const combineTransforms = (transformString: string) => {
  // Split the string into two parts
  const transforms = transformString.split(') ').map((s) => s + ')')

  // Function to parse translate3d string and return an array of numbers
  const parseTranslate3d = (string: string) => {
    const match = string.match(/translate3d\((-?\d+)px, (-?\d+)px, (-?\d+)px\)/)
    return match ? match.slice(1).map(Number) : [0, 0, 0]
  }

  // Parse each transform
  const [translate1, translate2] = transforms.map(parseTranslate3d)

  // Combine the transforms by adding the corresponding values
  const combined = translate2
    ? translate1.map((val, index) => val + translate2[index])
    : translate1

  return { x: combined[0], y: combined[1], z: combined[2] }
}
