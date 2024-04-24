type ResponseFromApi = {
  contacts: { input: string; status: string; wa_id: string }[];
};

export class Channel {
  token: string;
  constructor(token: string) {
    this.token = token;
  }

  async checkHealth() {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${this.token}`,
      },
    };

    const responseRaw = await fetch("https://gate.whapi.cloud/health?wakeup=false", options); // send request for check health
    const response = await responseRaw.json();
    if (response.status.text !== "AUTH") throw 401;
  }

  async sendMessage(to: string, body: string): Promise<boolean> {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ typing_time: 0, to, body }),
    };

    const responseRaw = await fetch(
      "https://gate.whapi.cloud/messages/text",
      options
    ); // send request for send message to contact
    const response = await responseRaw.json();
    return response.sent;
  }

  async checkPhones(phones: string[]): Promise<ResponseFromApi> {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        blocking: "wait",
        force_check: true,
        contacts: phones,
      }),
    };
    const response = await fetch("https://gate.whapi.cloud/contacts", options); // send request for check contact in WA
    if (response.status === 200) {
      const responseJson: ResponseFromApi = await response.json();
      return responseJson; // return contact status
    }
    throw response.status;
  }
}
