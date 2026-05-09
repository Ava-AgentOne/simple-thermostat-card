type Input = number | null | undefined | boolean | string;
type LocaleOptions = {
    language?: string;
    number_format?: string;
};
type Options = {
    decimals?: number;
    fallback?: string;
    locale?: LocaleOptions;
};
declare function formatNumber(number: Input, { decimals, fallback, locale }?: Options): string;
export default formatNumber;
