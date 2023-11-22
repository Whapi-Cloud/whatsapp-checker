# WhatsApp Phone Number Checker

## Description

This script is designed to check if phone numbers exist in WhatsApp. It analyzes the numbers specified in the `phones.json` file and classifies them into existing numbers in WhatsApp (exist_phones) and non-existing numbers (not_exist_phones). This checker is designed to check numbers for whatsapp installed on them. Validate any numbers from any country. Identify which phone numbers are active and those that are not able to receive whatsapp messages. Optimize your resources and save time and money.

### How to use

### Preparation

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository or download the source files of the script.

### Customization

1. open the `phones.json` file.
2. In the `check_phones` array, add the phone numbers you want to check. For example:
   ```json
   {
     "`check_phones`: [ "number1", "number2".]
   }

## Requirements
This tool was created using our public API that you can access too with your [Whapi.Cloud](https://whapi.cloud) account. It takes 3 steps to get started to use WhatsApp API with Whapi.Cloud. You will need a phone with WhatsApp Business or regular WhatsApp. Access is granted for 5 days free of charge. Pair your number via QR code in your account

> In the file checker_data.json you need to insert the token from your personal account Whapi.Cloud, as well as the number you want to check.
It also shows the limits we recommend to use. `daily_limit` is how many checks are left, and `refreshed_limit` is how much of the limit is set on refresh.

## Running the script
Open a terminal or command prompt in the folder with the script.
Run the following commands to install the necessary dependencies and compile the script:
`npm i`
`npx tsc`

Run the script with the command:
`node checker.js`




