import locationData from "../states-and-districts.json";

const STATE_DISTRICTS = {};

if (locationData && locationData.states) {
  locationData.states.forEach((s) => {
    if (s.state && s.districts) {
      STATE_DISTRICTS[s.state] = s.districts;
    }
  });
}

export { STATE_DISTRICTS };
