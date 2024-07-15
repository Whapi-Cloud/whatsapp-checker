# WhatsApp Phone Number Checker

## Description

This script is designed to check if phone numbers exist in WhatsApp. It analyzes the numbers specified in the `phones.csv` file and classifies them into existing numbers in WhatsApp (exist_phones) and non-existing numbers (not_exist_phones). This checker is designed to check numbers for whatsapp installed on them. Validate any numbers from any country. Identify which phone numbers are active and those that are not able to receive whatsapp messages. Optimize your resources and save time and money.

### How to use

### Preparation

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository or download the source files of the script.

### Customization

1. open the `phones.csv` file.
2. Write down the phone numbers you need to check. One line - one phone.

## Requirements
This tool was created using our public API that you can access too with your [Whapi.Cloud](https://whapi.cloud) account. It takes 3 steps to get started to use WhatsApp API with Whapi.Cloud. You will need a phone with WhatsApp Business or regular WhatsApp. Access is granted for 5 days free of charge. Pair your number via QR code in your account

> In the file `config.json` you need to insert the token from your personal account Whapi.Cloud, as well as the number you want to check.
It also shows the limits we recommend to use. `daily_limit` is how many checks are left (Filled automatically), and `refreshed_limit` is how much of the limit is set on refresh. `last_limit_refresh` shows the date the limits were last updated (Filled automatically). The `delay` argument determines the frequency of checks. And `checks_per_delay` is responsible for the number of numbers that will be checked during the check.

## Running the script
Open a terminal or command prompt in the folder with the script.
Run the following commands to install the necessary dependencies and compile the script:
`npm i`

Run the script with the command:
`npm run start`

## Getting Started
https://support.whapi.cloud/help-desk/getting-started/getting-started
### How to Connect to Whapi.Cloud
[Registration](https://panel.whapi.cloud/register). The first step is to register on the Whapi.Cloud website and create an account. <b>It's free and doesn't require you to enter a credit card.</b>
After registration you will immediately have access to a test channel with a small limitation. Wait for it to start (it usually takes about a minute). You will need to connect your phone for Whatsapp automation. It is from the connected phone that messages will be sent. The big advantage of the service is that it takes only a couple of minutes to launch and start working.

To connect your phone, use the QR code available when you click on your trial channel in your personal account. Then open WhatsApp on your mobile device, go to Settings -> Connected devices -> Connect device -> Scan QR code.

In the second and third steps, the service will ask you to customize the channel: write its name for your convenience, set webhooks, change settings. All these steps can be skipped, and we will come back to webhooks a little later. After launching, you will find in the center block under the information about limits, your API KEY, that is Token. This token will be used to authenticate your API requests. Generally, it's added to the request headers as a Bearer Token or simply as a request parameter, depending on the API method you're using.
