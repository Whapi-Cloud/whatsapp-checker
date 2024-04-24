import * as fs from "fs";

export class CSVModule {
  writeCSV(data: { phone: string; status: string }[], filePath: string) {
    let writeString = "";
    for (let i = 0; i < data.length; i++)
      writeString += `${data[i].phone},${data[i].status}\n`;

    fs.writeFileSync(filePath, writeString, "utf-8");
  }

  readCSVRaw(filePath: string) {
    return fs.readFileSync(filePath, "utf-8");
  }

  getPhonesFromCSV(filePath: string) {
    const rawData = fs
      .readFileSync(filePath, "utf-8")
      .replace(/(\r\n|\r|\n)/g, ",");
    const returnedData: string[] = rawData.split(",");
    returnedData.pop();
    return returnedData;
  }

  parseCSV(csvString: string): { phone: string; status: string }[] {
    const readString = csvString.split("\n");
    const returnedData: { phone: string; status: string }[] = [];
    for (let i = 0; i < readString.length; i++) {
      const row = readString[i];
      returnedData.push({ phone: row[0], status: row[1] });
    }
    return returnedData;
  }
}
