import { one } from './db';
export type Settings = {
  default_commission_rate: string;
  default_discount_percent: string;
  max_discount_percent: string;
  code_min_length: number;
  code_max_length: number;
  hold_days: number;
};
export async function getSettings(): Promise<Settings> {
  return (await one<Settings>('select * from settings where id = 1'))!;
}
