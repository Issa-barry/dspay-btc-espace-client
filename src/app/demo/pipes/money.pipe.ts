import { Pipe, PipeTransform } from '@angular/core';

type Space = 'narrow' | 'normal' | 'wide' | 'figure' | 'en' | 'em';
function isSpaceKeyword(x: any): x is Space {
  return x === 'narrow' || x === 'normal' || x === 'wide' || x === 'figure' || x === 'en' || x === 'em';
}

@Pipe({ name: 'money', standalone: true, pure: true })
export class MoneyPipe implements PipeTransform {
  private defaults: Record<string, number> = { EUR: 2, GNF: 0 };

  transform(
    value: number | string | null | undefined,
    currency: 'EUR' | 'GNF' | string = 'GNF',
    decOrSpace: number | 'auto' | Space = 'auto',   // 2e param: décimales OU type d’espace
    compact = false,
    display: 'symbol' | 'code' | 'narrow' | 'none' = 'narrow',
    locale = 'fr-FR',
    gap: 'narrow' | 'normal' | 'wide' = 'normal'
  ): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(num)) return '';

    const cur = (currency || 'GNF').toUpperCase();

    // --- narrowing sûr du 2e paramètre ---
    let group: Space | null = null;
    let decimals: number | 'auto';
    if (typeof decOrSpace === 'string' && isSpaceKeyword(decOrSpace)) {
      group = decOrSpace;
      decimals = 'auto';
    } else {
      decimals = decOrSpace as number | 'auto';
    }
    const d = decimals === 'auto' ? (this.defaults[cur] ?? 0) : (decimals as number);

    // espaces
    const gapSpace   = gap   === 'wide' ? '\u00A0\u00A0' : gap   === 'normal' ? '\u00A0' : '\u202F';
    const groupSpace =
      group === 'em'     ? '\u2003' :
      group === 'en'     ? '\u2002' :
      group === 'figure' ? '\u2007' :
      group === 'wide'   ? '\u00A0\u00A0' :
      group === 'normal' ? '\u00A0' : '\u202F'; // défaut: 'narrow'

    // éviter "FG" pour GNF
    let disp = display;
    if (cur === 'GNF' && disp === 'narrow') disp = 'none';

    // remplace les espaces entre chiffres par le séparateur choisi
    const reGroup = /(\d)[\u00A0\u202F\u2007\u2002\u2003\s](?=\d)/g;
    const applyGroup = (s: string) => s.replace(reGroup, `$1${groupSpace}`);

    if (disp === 'none') {
      const body = new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: d,
        maximumFractionDigits: d,
        notation: compact ? 'compact' : 'standard',
        compactDisplay: 'short',
        useGrouping: true
      }).format(num);
      const sym = cur === 'EUR' ? '€' : cur; // 'GNF'
      return `${applyGroup(body)}${gapSpace}${sym}`;
    }

    const currencyDisplay =
      disp === 'narrow' ? 'narrowSymbol' :
      disp === 'symbol' ? 'symbol' :
      disp === 'code'   ? 'code'   : 'symbol';

    const out = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur,
      currencyDisplay,
      minimumFractionDigits: d,
      maximumFractionDigits: d,
      notation: compact ? 'compact' : 'standard',
      compactDisplay: 'short',
      useGrouping: true
    }).format(num);

    return applyGroup(out);
  }
}
