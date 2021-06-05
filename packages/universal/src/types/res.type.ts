export interface ResItem<T> {
  ok: boolean
  item: T
}

export interface ResList<T> {
  ok: boolean
  items: T[]
}

export interface ResPost<T> {
  ok: boolean
  createdItem: T
}

export interface ResPut<T> {
  ok: boolean
  updatedItem: T
}

export interface ResOK {
  ok: boolean
}
