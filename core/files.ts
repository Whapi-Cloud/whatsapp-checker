import * as fs from "fs";

export enum DBFiles {
  "result" = "result.csv",
  "phones" = "phones.csv",
  "unlimitted_phones" = "unlimited.csv",
  "config" = "config.json"
}

type ConfigFileData = {
  token: string;
  last_limit_refresh: number;
  daily_limit: number;
  refreshed_limit: number;
};

export function checkFiles() {
  // checking for files
  const keys = Object.keys(DBFiles);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const path = DBFiles[key];
    if (key === "config") continue;
    if(key === "phones") continue
    if(key === "result"){
      fs.writeFileSync(path, "Phone,Status");
      continue;
    }
    if(key === "unlimitted_phones")continue
    fs.writeFile(path, "[]", function (err) {
      if (err) throw err;
      console.log(`${key} is created succesfully.`);
    });
  }
}

export function refreshLimit() {
  // refresh daily_limit
  const now = Date.now();
  const configData = fs.readFileSync("checker_data.json", "utf-8");
  const config: ConfigFileData = JSON.parse(configData);
  config.last_limit_refresh = now; // set last limit date to today
  config.daily_limit = config.refreshed_limit; // refresh daily limit
  const writeData = JSON.stringify(config);
  fs.writeFileSync("checker_data.json", writeData, "utf-8"); // save to file
}

export function getLastRefresh(): number {
  // get date of last refresh daily limiy
  const configData = fs.readFileSync("checker_data.json", "utf-8");
  const config: ConfigFileData = JSON.parse(configData);
  return config.last_limit_refresh;
}

export function canRefreshLimit(): boolean {
  // check if 24 hours have passed since the last update.
  const lastRefreshDate = getLastRefresh();
  const now = Date.now();
  const isCanRefresh = now - lastRefreshDate >= 24 * 3600 * 1000;
  return isCanRefresh;
}