import * as fs from "fs";

type ResponseFromApi = {
  contacts: { input: string; status: string; wa_id: string }[];
};
type PhonesFileData = {
  check_phones: string[];
  exist_phones: string[];
  not_exist_phones: string[];
};
type ConfigFileData = {
  token: string;
  last_limit_refresh: number;
  daily_limit: number;
  refreshed_limit: number;
};

async function start() {
  const isRefresh = canRefreshLimit();
  if (isRefresh) refreshLimit(); // if refresh condition is true - refresh limit
  const data = fs.readFileSync("phones.json", "utf-8");
  const phones: PhonesFileData = JSON.parse(data); // read phones.json file data
  const configData = fs.readFileSync("checker_data.json", "utf-8");
  const config: ConfigFileData = JSON.parse(configData);

  let unLimittedPhones: string[] = [];
  let newLimit: number;
  if (!phones.check_phones || phones.check_phones.length === 0) {
    // if check_phones array is empty - log error
    console.log("Check phones is empty!");
    return;
  }
  if (!config.token || config.token === "") {
    // if token is empty - log error
    console.log("Token is empty");
    return;
  }
  if (config.daily_limit === 0) {
    // if limit equal 0 - log error
    console.log("Your limit is done!");
    return;
  }

  const isAuth = await checkHealth(config.token);
  if (!isAuth) {
    // if channel not auth - log error
    console.log("Channel not auth");
    return;
  }

  if (phones.check_phones.length > config.daily_limit) {
    // if the number of phones being checked exceeds the limit, check only those that fit into it.
    const checkPhonesLength = phones.check_phones.length;
    const diff = checkPhonesLength - config.daily_limit;
    unLimittedPhones = phones.check_phones.splice(
      phones.check_phones.length - 1,
      diff
    );
    newLimit = 0;
  } else {
    // else, decrease the limit by the difference.
    const checkPhonesLength = phones.check_phones.length;
    const diff = config.daily_limit - checkPhonesLength;
    newLimit = diff;
  }

  try {
    const checkedPhones = await checkPhones(config.token, phones.check_phones);
    const updatedData = updateInfo(checkedPhones);

    config.daily_limit = newLimit;
    const writeData = JSON.stringify(config);
    fs.writeFileSync("checker_data.json", writeData, "utf-8"); // save decreased limit.
    if (unLimittedPhones.length > 0) {
      // if there are unchecked phones, then save them.
      console.log(
        "The limit is over! Not all numbers have been verified! Check phones.json file."
      );
      updatedData.check_phones = unLimittedPhones;
      const writeData = JSON.stringify(updatedData);
      fs.writeFileSync("phones.json", writeData, "utf-8"); // save unchecked phones.
    }
  } catch (e) {
    if (e === 400) console.log("Incorrect phones in check phones");
  }
}

async function checkHealth(token: string): Promise<boolean> {
  // check channel health
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(
    "https://gate.whapi.cloud/health?wakeup=false&channel_type=web",
    options
  );
  const responseJson = await response.json();
  if (responseJson.status.text !== "AUTH") return false;
  return true;
}

async function checkPhones(
  token: string,
  phones: string[]
): Promise<ResponseFromApi> {
  // send request for check phones
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      blocking: "wait",
      force_check: true,
      contacts: phones,
    }),
  };
  const response = await fetch("https://gate.whapi.cloud/contacts", options);
  if (response.status === 200) {
    const responseJson: ResponseFromApi = await response.json();
    return responseJson;
  }
  throw response.status;
}

function updateInfo(scannedPhones: ResponseFromApi): PhonesFileData {
  // update file with scan result
  const data = fs.readFileSync("phones.json", "utf-8");
  const phones: PhonesFileData = JSON.parse(data);

  for (let i = 0; i < scannedPhones.contacts.length; i++) {
    const elem = scannedPhones.contacts[i];
    const phoneIndex = phones.check_phones.findIndex((e) => e === elem.input);
    phones.check_phones.splice(phoneIndex, 1);
    if (elem.status === "valid") {
      // if phone is exist in WA - add to exist_phones array
      phones.exist_phones.push(elem.input);
      continue;
    }
    phones.not_exist_phones.push(elem.input); // else - add to not_exist_phones array
  }
  const writeData = JSON.stringify(phones);
  fs.writeFileSync("phones.json", writeData, "utf-8"); // save to file
  return phones;
}

function refreshLimit() {
  // refresh daily_limit
  const now = Date.now();
  const configData = fs.readFileSync("checker_data.json", "utf-8");
  const config: ConfigFileData = JSON.parse(configData);
  config.last_limit_refresh = now; // set last limit date to today
  config.daily_limit = config.refreshed_limit; // refresh daily limit
  const writeData = JSON.stringify(config);
  fs.writeFileSync("checker_data.json", writeData, "utf-8"); // save to file
}

function getLastRefresh(): number {
  // get date of last refresh daily limiy
  const configData = fs.readFileSync("checker_data.json", "utf-8");
  const config: ConfigFileData = JSON.parse(configData);
  return config.last_limit_refresh;
}

function canRefreshLimit(): boolean {
  // check if 24 hours have passed since the last update.
  const lastRefreshDate = getLastRefresh();
  const now = Date.now();
  const isCanRefresh = now - lastRefreshDate >= 24 * 3600 * 1000;
  return isCanRefresh;
}

start().then();
