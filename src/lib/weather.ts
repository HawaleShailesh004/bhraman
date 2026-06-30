import "server-only";

export type WeatherSignal = {
  label: "Good to go" | "Weather watch";
  summary: string;
  temperatureC: number | null;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
};

function summarizeConditions(
  precipitation: number,
  windSpeed: number,
  weatherCode: number,
): { label: WeatherSignal["label"]; summary: string } {
  const stormCodes = new Set([95, 96, 99]);
  const rainCodes = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82]);

  if (
    precipitation >= 2.5 ||
    windSpeed >= 35 ||
    stormCodes.has(weatherCode) ||
    rainCodes.has(weatherCode)
  ) {
    return {
      label: "Weather watch",
      summary:
        "Rain or stronger winds expected - check conditions before you head out.",
    };
  }

  if (precipitation > 0.2 || windSpeed >= 25) {
    return {
      label: "Weather watch",
      summary:
        "Light showers or breezy conditions - still doable with the right gear.",
    };
  }

  return {
    label: "Good to go",
    summary:
      "Clear skies and light winds - ideal conditions for this adventure.",
  };
}

export async function getWeatherSignal(
  latitude: number,
  longitude: number,
): Promise<WeatherSignal> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set(
    "current",
    "temperature_2m,precipitation,wind_speed_10m,weather_code",
  );
  url.searchParams.set("timezone", "Asia/Kolkata");

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const current = data.current;
    if (!current) throw new Error("Missing weather payload");

    const precipitation = current.precipitation ?? 0;
    const windSpeed = current.wind_speed_10m ?? 0;
    const weatherCode = current.weather_code ?? 0;
    const verdict = summarizeConditions(precipitation, windSpeed, weatherCode);

    return {
      label: verdict.label,
      summary: verdict.summary,
      temperatureC:
        typeof current.temperature_2m === "number"
          ? Math.round(current.temperature_2m)
          : null,
    };
  } catch {
    return {
      label: "Weather watch",
      summary:
        "Live weather is temporarily unavailable - plan with extra buffer time.",
      temperatureC: null,
    };
  }
}
