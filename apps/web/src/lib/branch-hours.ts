type BranchOperatingHourLike = {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

type BranchAvailabilityLike = {
  isAcceptingOrders: boolean;
  isTemporarilyClosed: boolean;
  operatingHours?: BranchOperatingHourLike[];
};

const WEEKDAY_TO_DAY_OF_WEEK: Record<string, string> = {
  Sunday: "SUNDAY",
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const PREVIOUS_DAY_OF_WEEK: Record<string, string> = {
  MONDAY: "SUNDAY",
  TUESDAY: "MONDAY",
  WEDNESDAY: "TUESDAY",
  THURSDAY: "WEDNESDAY",
  FRIDAY: "THURSDAY",
  SATURDAY: "FRIDAY",
  SUNDAY: "SATURDAY",
};

function parseTimeToMinutes(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getZonedNow(timezone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Monday";
  const hourPart = parts.find((part) => part.type === "hour")?.value ?? "0";
  const minutePart = parts.find((part) => part.type === "minute")?.value ?? "0";
  const rawHour = Number(hourPart);
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = Number(minutePart);

  return {
    dayOfWeek: WEEKDAY_TO_DAY_OF_WEEK[weekday] ?? "MONDAY",
    minutes: hour * 60 + minute,
  };
}

export function isWithinOperatingHours(
  operatingHours: BranchOperatingHourLike[] | undefined,
  timezone: string,
  date = new Date(),
) {
  if (!operatingHours?.length) {
    return true;
  }

  const now = getZonedNow(timezone, date);
  const today = operatingHours.find((hour) => hour.dayOfWeek === now.dayOfWeek);
  const yesterday = operatingHours.find(
    (hour) => hour.dayOfWeek === PREVIOUS_DAY_OF_WEEK[now.dayOfWeek],
  );

  if (isWithinPreviousOvernightWindow(yesterday, now.minutes)) {
    return true;
  }

  if (!today || today.isClosed) {
    return false;
  }

  const openMinutes = parseTimeToMinutes(today.openTime);
  const closeMinutes = parseTimeToMinutes(today.closeTime);

  if (openMinutes === null || closeMinutes === null) {
    return false;
  }

  if (closeMinutes <= openMinutes) {
    return now.minutes >= openMinutes;
  }

  return now.minutes >= openMinutes && now.minutes < closeMinutes;
}

function isWithinPreviousOvernightWindow(
  operatingHour: BranchOperatingHourLike | undefined,
  minutes: number,
) {
  if (!operatingHour || operatingHour.isClosed) {
    return false;
  }

  const openMinutes = parseTimeToMinutes(operatingHour.openTime);
  const closeMinutes = parseTimeToMinutes(operatingHour.closeTime);

  if (openMinutes === null || closeMinutes === null || closeMinutes > openMinutes) {
    return false;
  }

  return minutes < closeMinutes;
}

export function getBranchOperationalStatus(
  branch: BranchAvailabilityLike,
  timezone: string,
  date = new Date(),
) {
  if (branch.isTemporarilyClosed) {
    return "closed" as const;
  }

  if (!branch.isAcceptingOrders) {
    return "paused" as const;
  }

  if (!isWithinOperatingHours(branch.operatingHours, timezone, date)) {
    return "closed" as const;
  }

  return "open" as const;
}

export function formatOperatingHoursSummary(
  operatingHours: BranchOperatingHourLike[] | undefined,
) {
  const openDays = (operatingHours ?? []).filter((hour) => !hour.isClosed);

  if (!openDays.length) {
    return {
      hours: "-",
      label: "Closed",
    };
  }

  const first = openDays[0];
  const sameEveryDay =
    openDays.length === 7 &&
    openDays.every(
      (hour) => hour.openTime === first.openTime && hour.closeTime === first.closeTime,
    );

  return {
    hours: `${first.openTime ?? "-"} - ${first.closeTime ?? "-"}`,
    label: sameEveryDay ? "Every day" : DAY_LABELS[first.dayOfWeek] ?? "Scheduled",
  };
}
