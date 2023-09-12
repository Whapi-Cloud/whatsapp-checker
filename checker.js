var dataFile = require("./checker_data.json");

async function start() {
  const phone = dataFile.phone;
  const token = dataFile.token;
  if (!phone || phone === "") console.log("Phone is empty");
  if (!token || token === "") console.log("Token is empty");
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${dataFile.token}`,
    },
    body: JSON.stringify({
      blocking: "no_wait",
      force_check: false,
      contacts: [dataFile.phone],
    }),
  };
  fetch("https://gate.whapi.cloud/contacts", options)
    .then((response) => response.json())
    .then((response) => {
      if (response.contacts && response.contacts.length != 0) {
        response.contacts[0].status === "valid"
          ? console.log("Phone is exist")
          : console.log("Phone doesn't exist");
      } else console.log("Check your checker_data file");
    })
    .catch((err) => console.error(err));
}

start();
