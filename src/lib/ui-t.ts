import { requestLocale } from "./request-locale"
import { makeT, type TFn } from "./ui-translate"

/** Server-component translator for the request locale (see ui-translate.ts). */
export async function getT(): Promise<TFn> {
  return makeT(await requestLocale())
}
