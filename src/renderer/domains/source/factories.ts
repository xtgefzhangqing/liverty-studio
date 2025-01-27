import uuid from 'uuid/v4'
import { Source } from './models'

const getFilename = (filepath: string) => {
  const result = filepath.match(/[^/]+$/)
  if (!result) return filepath
  return result[0]
}

export const createSourceImage = ({
  filepath,
  name,
  x = 0,
  y = 0,
  width,
  height
}: {
  filepath: string
  name?: string
  x?: number
  y?: number
  width: number
  height: number
}) => {
  const image: Source = {
    id: uuid(),
    type: 'image',
    name: name || getFilename(filepath),
    filepath,
    width,
    height,
    x,
    y
  }
  return image
}
