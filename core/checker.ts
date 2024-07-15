import { Channel } from "./channel";
import { DBFiles } from "./files";
import { CSVModule } from "./csv_module";
import * as fs from "fs";

export class Checker {
  channel: Channel;
  phones: string[];
  checkedPhones: { phone: string; status: string }[];
  checkerIntervalId: number;
  syncIntervalId: number;
  limit: number;
  isRunning: boolean;
  constructor(channel: Channel, phones: string[], limit: number) {
    this.channel = channel;
    this.phones = phones;
    this.limit = limit;
    this.checkedPhones = [];
  }

  async start(delay: number, checksPerTime: number) {
    await this.channel.checkHealth();
    const csv_module = new CSVModule();
    console.log("Checker started.");
    this.isRunning = true;
    const checkerInterval = setInterval(async () => {
      if (this.limit === 0) {
        console.log("||| Limit is Done! |||");
        clearInterval(this.checkerIntervalId);
        return;
      }
      if (this.phones.length === 0) {
        this.isRunning = false;
        clearInterval(this.checkerIntervalId);
        return;
      }

      const checkPhones = this.phones.splice(
        0,
        checksPerTime < this.phones.length ? checksPerTime : this.phones.length
      );
      if (checkPhones.length > this.limit)
        checkPhones.splice(this.limit, checkPhones.length - 1);

      const result = await this.channel.checkPhones(checkPhones);
      const writeData = result.contacts.map((elem) => ({
        phone: elem.input,
        status: elem.status,
      }));
      this.checkedPhones.push(...writeData);
      this.limit -= checkPhones.length;
    }, delay);

    const syncInterval = setInterval(() => {
      csv_module.writeCSV(this.checkedPhones, DBFiles.result);
      const configData = fs.readFileSync(DBFiles.config, "utf-8");
      const config = JSON.parse(configData);
      config.daily_limit = this.limit;
      const writeConfigData = JSON.stringify(config);
      fs.writeFileSync(DBFiles.config, writeConfigData, "utf-8"); // save decreased limit.

      if (this.limit === 0) {
        clearInterval(this.syncIntervalId);
        return;
      }
      if (!this.isRunning) {
        console.log("||| Checker Finished |||");
        clearInterval(this.syncIntervalId);
        return;
      }
    }, delay + 5000);

    this.checkerIntervalId = checkerInterval[Symbol.toPrimitive]();
    this.syncIntervalId = syncInterval[Symbol.toPrimitive]();
  }
}
