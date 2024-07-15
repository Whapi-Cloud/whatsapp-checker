const { checkFiles, DBFiles } = require("./core/files");
const { CSVModule } = require("./core/csv_module");
const { Channel } = require("./core/channel");
const fs = require("fs");
const { Checker } = require("./core/checker");

const csv_module = new CSVModule();

async function start() {
  checkFiles();
  const isRefresh = canRefreshLimit();
  if (isRefresh) refreshLimit(); // if refresh condition is true - refresh limit
  let phones = csv_module.getPhonesFromCSV(DBFiles.phones);

  if (phones.length === 0) throw "Phones file is empty!";
  const configData = fs.readFileSync(DBFiles.config, "utf-8");
  const config = JSON.parse(configData);
  console.log(`||| Will be check ${config.daily_limit <= phones.length ? config.daily_limit : phones.length} phones |||`)
  const channel = new Channel(config.token);
  const checker = new Checker(channel, phones, config.daily_limit);
  await checker.start(config.delay, config.checks_per_delay);
}

start()
  .then(() => console.log("In progress"))
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
