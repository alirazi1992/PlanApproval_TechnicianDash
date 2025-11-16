const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (options: Intl.DateTimeFormatOptions) => {
  const key = JSON.stringify(options);
  if (!FORMATTER_CACHE.has(key)) {
    FORMATTER_CACHE.set(
      key,
      new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        numberingSystem: "latn",
        ...options,
      })
    );
  }
  return FORMATTER_CACHE.get(key)!;
};

const ensureDate = (value: string | number | Date) =>
  value instanceof Date ? value : new Date(value);

export const formatJalaliDate = (value: string | number | Date) =>
  getFormatter({ year: "numeric", month: "2-digit", day: "2-digit" }).format(
    ensureDate(value)
  );

export const formatJalaliTime = (value: string | number | Date) =>
  getFormatter({ hour: "2-digit", minute: "2-digit" }).format(
    ensureDate(value)
  );

export const formatJalaliDateTime = (value: string | number | Date) =>
  `${formatJalaliDate(value)} ${formatJalaliTime(value)}`;

export const formatJalaliDateTimeLong = (value: string | number | Date) =>
  getFormatter({
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ensureDate(value));

export const formatJalaliMonthTitle = (value: string | number | Date) =>
  getFormatter({ month: "long", year: "numeric" }).format(ensureDate(value));

export const formatJalaliDay = (value: string | number | Date) =>
  getFormatter({ day: "numeric" }).format(ensureDate(value));

export const getJalaliMonthKey = (value: string | number | Date) =>
  getFormatter({ year: "numeric", month: "2-digit" }).format(ensureDate(value));
