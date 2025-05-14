import { StoredStandup } from "./types";

export function saveStandup(standup: StoredStandup): void {
  try {
    const standups = getStandups();
    standups.push(standup);
    localStorage.setItem("standups", JSON.stringify(standups));
  } catch (error) {
    console.error("Error saving standup:", error);
  }
}

export function getStandups(): StoredStandup[] {
  try {
    const standups = localStorage.getItem("standups");
    return standups ? JSON.parse(standups) : [];
  } catch (error) {
    console.error("Error getting standups:", error);
    return [];
  }
}

export function getStandupByDate(date: string): StoredStandup | undefined {
  return getStandups().find(standup => 
    new Date(standup.date).toDateString() === new Date(date).toDateString()
  );
}

export function clearStandups(): void {
  localStorage.removeItem("standups");
}