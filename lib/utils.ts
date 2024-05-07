import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"



import { env } from "@/env.mjs"
import { customAlphabet } from "nanoid"
import { Subscriber } from "@prisma/client";


export const LOCALHOST_GEO_DATA = {
  city: "San Francisco",
  region: "CA",
  country: "US",
  latitude: "37.7695",
  longitude: "-122.385",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`
}


export const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const isHomeHostname = (domain: string) => {
  return HOME_HOSTNAMES.has(domain) || domain.endsWith(".vercel.app");
};

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const HOME_HOSTNAMES = new Set([
  // comment for better diffs
  "recur.email",
  "localhost",
  "localhost:3000",
]);

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const getDomain = (headers: Headers) => {
  let domain = headers.get("host") as string;
  if (isHomeHostname(domain)) domain = "dub.sh";
  return domain;
};

export const getUrlFromString = (str: string) => {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (e) {
    return null;
  }
};

export const getDomainWithoutWWW = (url: string) => {
  if (isValidUrl(url)) {
    return new URL(url).hostname.replace(/^www\./, "");
  }
  try {
    if (url.includes(".") && !url.includes(" ")) {
      return new URL(`https://${url}`).hostname.replace(/^www\./, "");
    }
  } catch (e) {
    return null;
  }
};




export function formatLocation(subscriber: Pick<Subscriber, "clientIPCity" | "clientIPCountry">) {
  if(subscriber.clientIPCity && subscriber.clientIPCountry) {
    return `${decodeURIComponent(subscriber.clientIPCity)}, ${decodeURIComponent(subscriber.clientIPCountry)}`
  }
  return ''
}