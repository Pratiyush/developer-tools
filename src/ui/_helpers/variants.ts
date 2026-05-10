/**
 * Tiny CVA-style variant helper. Given a base class plus a map of
 * variant groups (e.g. `tone`, `size`) where each group maps option
 * names to class strings, returns a builder that takes an options
 * object and produces the final class list.
 *
 * Example:
 *   const segment = variants({
 *     base: 'dt-segment',
 *     variants: {
 *       tone: { primary: 'dt-segment--primary', secondary: '' },
 *     },
 *     defaultVariants: { tone: 'primary' },
 *   });
 *   segment({ tone: 'secondary' }); // 'dt-segment'
 *   segment();                       // 'dt-segment dt-segment--primary'
 *
 * Type-safe: the returned builder only accepts variant keys/values
 * declared in the config, and reports unknown values as compile errors.
 */

type VariantMap = Record<string, Record<string, string>>;

type SelectedVariants<V extends VariantMap> = {
  readonly [K in keyof V]?: keyof V[K];
};

interface VariantsConfig<V extends VariantMap> {
  readonly base?: string;
  readonly variants: V;
  readonly defaultVariants?: SelectedVariants<V>;
}

export function variants<V extends VariantMap>(
  config: VariantsConfig<V>,
): (selected?: SelectedVariants<V>) => string {
  const base = config.base ?? '';
  const groups = config.variants;
  const defaults: SelectedVariants<V> = config.defaultVariants ?? {};

  return (selected: SelectedVariants<V> = {}): string => {
    const parts: string[] = [];
    if (base.length > 0) parts.push(base);
    for (const groupName of Object.keys(groups) as (keyof V & string)[]) {
      const picked = selected[groupName] ?? defaults[groupName];
      if (picked === undefined) continue;
      const group = groups[groupName];
      if (group === undefined) continue;
      const className = group[picked as string];
      if (typeof className === 'string' && className.length > 0) {
        parts.push(className);
      }
    }
    return parts.join(' ');
  };
}
