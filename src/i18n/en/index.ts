/**
 * The English catalog — the source of every key. Each area of the app owns one namespace file;
 * every other language provides the same keys (enforced by the Messages type and a unit test).
 */
import { common } from './common';
import { domain } from './domain';
import { home } from './home';
import { about } from './about';
import { tier1 } from './tier1';
import { tier2 } from './tier2';
import { evidence } from './evidence';
import { arl } from './arl';
import { guide } from './guide';
import { excel } from './excel';

export const en = {
  ...common,
  ...domain,
  ...home,
  ...about,
  ...tier1,
  ...tier2,
  ...evidence,
  ...arl,
  ...guide,
  ...excel,
} as const;

export type MessageKey = keyof typeof en;
