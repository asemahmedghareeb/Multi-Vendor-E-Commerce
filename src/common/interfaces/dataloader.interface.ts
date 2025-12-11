import * as Dataloader from 'dataloader';

export interface AppDataloader<K, V> {
  loader: Dataloader<K, V>;

  getDataloader(): Dataloader<K, V>;
}
