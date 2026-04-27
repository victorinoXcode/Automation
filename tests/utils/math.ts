export function getRandomNumber(number: number) {
  return Math.floor(Math.random() * number) + 1;
}

export function getRandomNumberFloat(number: number) {
  const randomValue = parseFloat((Math.random() * number).toFixed(2));
  return randomValue === 0 ? 0.01 : randomValue;
}

// TODO Refactor this func to use only one. (passing the number to sum + {numberTwo}) or when is needed.
export function getRandomNumberWithZero(number: number) {
  return Math.floor(Math.random() * number);
}

export function getRandomWord(string: string[]) {
  return string[Math.floor(Math.random() * string.length)];
}

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getDateString() {
  const d = new Date();
  return d.toLocaleDateString();
}

export function getRandomLetter() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

export function getAvailableSelectedDay() {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray: number[] = [];

  for (let i = currentDay; i <= lastDayOfMonth; i++) {
    daysArray.push(i);
  }

  const selectedDay = daysArray[getRandomNumberWithZero(daysArray.length)];
  return selectedDay;
}

export function getRandomDayRemainingInMonth() {
  const now = new Date();
  const today = now.getDate();
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const remainingDays: number[] = [];
  for (let i = today; i <= lastDayOfMonth; i++) {
    remainingDays.push(i);
  }

  const randomIndex = Math.floor(Math.random() * remainingDays.length);
  return remainingDays[randomIndex];
}

export function getRandomDateInRemainingMonth() {
  const now = new Date();
  const today = now.getDate();
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const remainingDays: number[] = [];
  for (let i = today; i <= lastDayOfMonth; i++) {
    remainingDays.push(i);
  }

  const randomIndex = Math.floor(Math.random() * remainingDays.length);
  const randomDay = remainingDays[randomIndex];
  const randomDate = new Date(now.getFullYear(), now.getMonth(), randomDay);
  const [formattedDate] = randomDate.toISOString().split("T");
  if (!formattedDate) {
    throw new Error("Failed to format random date");
  }
  return formattedDate;
}

export function getRandomWeekendDateInRemainingMonth(): string | null {
  const now = new Date();
  const today = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  const weekendDays: number[] = [];
  for (let day = today; day <= lastDayOfMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays.push(day);
    }
  }

  if (weekendDays.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * weekendDays.length);
  const randomDay = weekendDays[randomIndex];
  if (randomDay === undefined) {
    return null;
  }
  const randomDate = new Date(year, month, randomDay);
  const [formattedDate] = randomDate.toISOString().split("T");
  if (!formattedDate) {
    return null;
  }
  return formattedDate;
}

export function getFormattedDateMMDDYYYY(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}${day}${year}`;
}

/** Check if trading is open (9:30am to 3pm ET). */
export function isTradingOpen(): boolean {
  const now = new Date();
  const etTime = new Date(
    now.toLocaleString("en-US", {timeZone: "America/New_York"}),
  );
  const currentHour = etTime.getHours();
  const currentMinute = etTime.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  const openTime = 9 * 60 + 30; // 9:30am ET
  const closeTime = 15 * 60; // 3:00pm ET
  return currentTime >= openTime && currentTime < closeTime;
}
