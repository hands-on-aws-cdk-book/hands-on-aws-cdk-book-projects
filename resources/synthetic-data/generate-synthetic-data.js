const fs = require("fs");

// Sample data pools
const customers = [
  { name: "Big Bird", email: "bigbird@sesamestreet.org" },
  { name: "Cookie Monster", email: "cookiemonster@sesamestreet.org" },
  { name: "Elmo", email: "elmo@sesamestreet.org" },
  { name: "Bert", email: "bert@sesamestreet.org" },
  { name: "Ernie", email: "ernie@sesamestreet.org" },
  { name: "Oscar the Grouch", email: "oscar@sesamestreet.org" },
  { name: "Grover", email: "grover@sesamestreet.org" },
  { name: "Count von Count", email: "count@sesamestreet.org" },
  { name: "Abby Cadabby", email: "abby@sesamestreet.org" },
  { name: "Snuffleupagus", email: "snuffy@sesamestreet.org" },
];

const streets = [
  "Sesame Street",
  "Cookie Lane",
  "Rubber Duckie Road",
  "Count Avenue",
  "Alphabet Boulevard",
  "Numbers Way",
  "Friendship Circle",
  "Muppet Drive",
  "Rainbow Road",
  "Sunny Day Street",
];

const cities = [
  { city: "New York", state: "NY", postalPrefix: "100" },
  { city: "Los Angeles", state: "CA", postalPrefix: "900" },
  { city: "Chicago", state: "IL", postalPrefix: "606" },
  { city: "Houston", state: "TX", postalPrefix: "770" },
  { city: "Phoenix", state: "AZ", postalPrefix: "850" },
  { city: "Philadelphia", state: "PA", postalPrefix: "191" },
  { city: "San Antonio", state: "TX", postalPrefix: "782" },
  { city: "San Diego", state: "CA", postalPrefix: "921" },
  { city: "Dallas", state: "TX", postalPrefix: "752" },
  { city: "San Jose", state: "CA", postalPrefix: "951" },
];

function generateRandomLocation() {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const cityInfo = cities[Math.floor(Math.random() * cities.length)];
  const postalCode =
    cityInfo.postalPrefix +
    String(Math.floor(Math.random() * 100)).padStart(2, "0");

  return {
    address: `${streetNumber} ${street}`,
    city: cityInfo.city,
    state: cityInfo.state,
    postalCode,
  };
}

function generateCustomer(index) {
  const customer = customers[index % customers.length];
  const customerId = `CUST-${String(index + 1).padStart(3, "0")}`;
  return {
    customerId,
    name: customer.name,
    email: customer.email,
  };
}

function generateLocation(customerId, index) {
  const location = generateRandomLocation();
  const locationId = `LOC-${String(index + 1).padStart(3, "0")}`;
  return {
    locationId,
    customerId,
    ...location,
  };
}

function generateMonthlyEnergyData(
  year = 2024,
  month = 1,
  customer = {
    customerId: "CUST-001",
    name: "John Doe",
    email: "john@example.com",
  },
  location = {
    locationId: "MAIN-01",
    customerId: "CUST-001",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
  }
) {
  const data = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  // Temperature baseline and patterns
  const baseTemp = 8;
  let lastEvCharge = -2; // Days since last charge

  function formatNumber(num) {
    return Number(num.toFixed(1));
  }

  function getTemperature(day, hour) {
    // Daily variation
    const dayVariation = Math.sin((day / 31) * Math.PI) * 3;
    // Hourly variation (coldest at 5am, warmest at 2pm)
    const hourVariation = Math.sin(((hour - 5) / 24) * Math.PI) * 5;
    return formatNumber(baseTemp + dayVariation + hourVariation);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    for (let hour = 0; hour < 24; hour++) {
      const timestamp = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")} ${String(hour).padStart(2, "0")}:00`;
      const outsideTemp = getTemperature(day, hour);

      // Base load (always present)
      let kWh = 0.2 + Math.random() * 0.1;

      // Device states
      let evCharging = false;
      let hotWaterHeater = false;
      let poolPump = false;
      let heatPump = false;

      // EV Charging (typically overnight, every 2-3 days)
      if (day - lastEvCharge >= 3 && hour >= 1 && hour <= 4) {
        evCharging = true;
        kWh += 1.7 + Math.random() * 0.2;
        if (hour === 1) lastEvCharge = day;
      }

      // Hot Water Heater
      if (hour === 6 || hour === 19 || (isWeekend && hour === 10)) {
        hotWaterHeater = true;
        kWh += 1.2 + Math.random() * 0.3;
      }

      // Pool Pump (during daylight hours)
      if (hour >= 9 && hour <= 16 && outsideTemp > 12) {
        poolPump = true;
        kWh += 0.3 + Math.random() * 0.2;
      }

      // Heat Pump (temperature dependent)
      if (outsideTemp < 12 || outsideTemp > 25) {
        heatPump = true;
        kWh += 0.5 + Math.random() * 0.3;
      }

      // Additional usage during peak hours
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 21)) {
        kWh += 0.2 + Math.random() * 0.2;
      }

      // Weekend variation
      if (isWeekend && hour >= 9 && hour <= 21) {
        kWh += 0.2;
      }

      data.push({
        customerId: customer.customerId,
        customerName: customer.name,
        locationId: location.locationId,
        address: location.address,
        timestamp,
        kWh: formatNumber(kWh),
        outsideTemp,
        electricVehicleCharging: evCharging,
        hotWaterHeater,
        poolPump,
        heatPump,
      });
    }
  }

  return data;
}

function generateCsv(data) {
  const headers =
    "customerId,customerName,locationId,address,timestamp,kWh,outsideTemp,electricVehicleCharging,hotWaterHeater,poolPump,heatPump\n";
  const rows = data
    .map(
      (row) =>
        `${row.customerId},${row.customerName},${row.locationId},${row.address},${row.timestamp},${row.kWh},${row.outsideTemp},${row.electricVehicleCharging},${row.hotWaterHeater},${row.poolPump},${row.heatPump}`
    )
    .join("\n");
  return headers + rows;
}

function saveDataToFile(csvContent, year, month) {
  // Create timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const monthStr = String(month).padStart(2, "0");
  const filename = `synthetic-electric-usage-data-${year}-${monthStr}-generated-${timestamp}.csv`;

  fs.writeFileSync(filename, csvContent);
  console.log(`Generated data saved to: ${filename}`);
}

// Generate single month
function generateMonth(year, month) {
  const data = generateMonthlyEnergyData(year, month);
  const csvContent = generateCsv(data);
  saveDataToFile(csvContent, year, month);
}

// Generate multiple months
function generateMultipleMonths(
  startYear = 2024,
  startMonth = 1,
  numberOfMonths = 6
) {
  const allData = [];

  // Generate data for each customer
  customers.forEach((_, customerIndex) => {
    const customer = generateCustomer(customerIndex);

    // Each customer has 1-3 locations
    const numLocations = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numLocations; i++) {
      const location = generateLocation(customer.customerId, i);
      const data = generateMonthlyEnergyData(
        startYear,
        startMonth,
        customer,
        location
      );
      const csvContent = generateCsv(data);
      saveDataToFile(csvContent, startYear, startMonth);
    }
  });
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  // Default: generate current month
  generateMonth(2024, 1);
} else if (args.length === 3) {
  // Generate multiple months
  const [year, month, numMonths] = args.map(Number);
  generateMultipleMonths(year, month, numMonths);
} else if (args.length === 2) {
  // Generate specific month
  const [year, month] = args.map(Number);
  generateMonth(year, month);
} else {
  console.log("Usage:");
  console.log(
    "  Generate single month: node generate-synthetic-data.js YEAR MONTH"
  );
  console.log(
    "  Generate multiple months: node generate-synthetic-data.js YEAR MONTH NUMBER_OF_MONTHS"
  );
  console.log("  Example: node generate-synthetic-data.js 2024 1 6");
}
