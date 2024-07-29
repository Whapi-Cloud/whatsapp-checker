import { Channel } from "./channel";
import { DBFiles } from "./files";
import { CSVModule } from "./csv_module";
import * as fs from "fs";

export class Checker {
  channel: Channel;
  phones: string[];
  checkedPhones: { phone: string; status: string }[];
  validPhones: { phone: string; status: string}[];
  invalidPhones: { phone: string; status: string}[];
  checkerIntervalId: number;
  syncIntervalId: number;
  limit: number;
  isRunning: boolean;
  constructor(channel: Channel, phones: string[], limit: number) {
    this.channel = channel;
    this.phones = phones;
    this.limit = limit;
    this.checkedPhones = [];
    this.validPhones = [];
    this.invalidPhones = [];
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
      let checkPhonesLength;
      if(checksPerTime < this.phones.length && checksPerTime <= this.limit)
        checkPhonesLength = checksPerTime;
      if(checksPerTime >= this.phones.length && checksPerTime <= this.limit)
        checkPhonesLength = this.phones.length;
      if(checksPerTime >= this.limit)
        checkPhonesLength = this.limit;

      const checkPhones = this.phones.splice(
        0,
        checkPhonesLength
      );

      const result = await this.channel.checkPhones(checkPhones);
      const writeData = result.contacts.map((elem) => ({
        phone: elem.input,
        status: elem.status,
      }));
      this.checkedPhones.push(...writeData);
      this.limit -= checkPhones.length;
    }, delay);

    const syncInterval = setInterval(() => {
      for(let i = 0; i < this.checkedPhones.length; i++){
        const elem = this.checkedPhones[i];
        elem.status === "valid" ? this.validPhones.push(elem) : this.invalidPhones.push(elem);
        this.checkedPhones.splice(0, 1);
        i--;
      }
      csv_module.writeCSV(this.validPhones, DBFiles.valid_phones);
      csv_module.writeCSV(this.invalidPhones, DBFiles.invalid_phones);
      const configData = fs.readFileSync(DBFiles.config, "utf-8");
      const config = JSON.parse(configData);
      config.daily_limit = this.limit;
      const writeConfigData = JSON.stringify(config);
      fs.writeFileSync(DBFiles.config, writeConfigData, "utf-8"); // save decreased limit.

      if (this.limit === 0) {
        csv_module.writeUnlimittedCsv(this.phones, DBFiles.unlimitted_phones);
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
