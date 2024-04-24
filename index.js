const { checkFiles, DBFiles } = require("./core/files");
const { CSVModule } = require("./core/csv_module");
const { Channel } = require("./core/channel");
const fs = require("fs");

const csv_module = new CSVModule();

async function start() {
  checkFiles();
  const isRefresh = canRefreshLimit();
  if (isRefresh) refreshLimit(); // if refresh condition is true - refresh limit
  const phones = csv_module.getPhonesFromCSV(DBFiles.phones);
  if (phones.length === 0) throw "Phones file is empty!";
  const configData = fs.readFileSync(DBFiles.config, "utf-8");
  const config = JSON.parse(configData);

  const channel = new Channel(config.token);
  await channel.checkHealth();

  let unLimittedPhones = [];
  let newLimit;
  if (!config.token || config.token === "") {
    // if token is empty - log error
    throw "Token is empty";
  }
  if (config.daily_limit === 0) {
    // if limit equal 0 - log error
    throw "Your limit is done!";
  }

  if (phones.length > config.daily_limit) {
    // if the number of phones being checked exceeds the limit, check only those that fit into it.
    const checkPhonesLength = phones.length;
    const diff = checkPhonesLength - config.daily_limit;
    unLimittedPhones = phones.splice(phones.length - 1, diff);
    newLimit = 0;
  } else {
    // else, decrease the limit by the difference.
    const checkPhonesLength = phones.length;
    const diff = config.daily_limit - checkPhonesLength;
    newLimit = diff;
  }
  config.daily_limit = newLimit;
  const writeConfigData = JSON.stringify(config);
  fs.writeFileSync(DBFiles.config, writeConfigData, "utf-8"); // save decreased limit.
  const checkedPhones = await channel.checkPhones(phones);
  const writeData = checkedPhones.contacts.map((elem) => {
    return { phone: elem.input, status: elem.status };
  });
  console.log(checkedPhones);
  csv_module.writeCSV(writeData, DBFiles.result);
  if (unLimittedPhones > 0) {
    console.log(
      "The limit is over! Not all numbers have been verified! Check phones.json file."
    );
    const uncheckedPhones = unLimittedPhones.map((elem) => {
      return { phone: elem, status: "limited" };
    });
    csv_module.writeCSV(uncheckedPhones, DBFiles.unlimitted_phones);
  }
}

start()
  .then(() => console.log("Started"))
  .catch((err) => console.log(err));

function refreshLimit() {
  // refresh daily_limit
  const now = Date.now();
  const configData = fs.readFileSync(DBFiles.config, "utf-8");
  const config = JSON.parse(configData);
  config.last_limit_refresh = now; // set last limit date to today
  config.daily_limit = config.refreshed_limit; // refresh daily limit
  const writeData = JSON.stringify(config);
  fs.writeFileSync(DBFiles.config, writeData, "utf-8"); // save to file
}

function getLastRefresh() {
  // get date of last refresh daily limiy
  const configData = fs.readFileSync(DBFiles.config, "utf-8");
  const config = JSON.parse(configData);
  return config.last_limit_refresh;
}

function canRefreshLimit() {
  // check if 24 hours have passed since the last update.
  const lastRefreshDate = getLastRefresh();
  const now = Date.now();
  const isCanRefresh = now - lastRefreshDate >= 24 * 3600 * 1000;
  return isCanRefresh;
}
