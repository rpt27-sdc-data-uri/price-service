import http from "k6/http";
import { sleep } from "k6";

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: "constant-arrival-rate",
      rate: 500,
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 1000,
      maxVUs: 2500,
    },
  },
};
export default function () {
  let id = Math.floor(Math.random() * (10000000 - 9900000 + 1) + 9900000);
  //let id = 9000001;
  http.get(http.url`http://localhost:3001/api/price/${id}`);
}
