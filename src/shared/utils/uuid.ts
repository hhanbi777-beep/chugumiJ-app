import { randomUUID } from 'expo-crypto';

/** 기기에서 생성하는 엔티티 id. */
export function newId(): string {
  return randomUUID();
}
