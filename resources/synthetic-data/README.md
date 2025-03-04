# Household Energy Usage Data

This CSV file contains simulated hourly energy usage data for a household over the month of January 2024. It can be used to analyze energy consumption patterns and trends. It was generated specifically for use in Hands on AWS CDK Book projects.

## Columns

- `timestamp` - The date and hour of the energy reading (YYYY-MM-DD HH:00 format)
- `kWh` - Energy usage for that hour in kilowatt-hours
- `outsideTemp` - Outside temperature in Celsius
- `electricVehicleCharging` - Boolean indicating if an electric vehicle was charging
- `hotWaterHeater` - Boolean indicating if the hot water heater was active
- `poolPump` - Boolean indicating if the pool pump was running
- `heatPump` - Boolean indicating if the heat pump was active

## Data Patterns

The data was generated to simulate realistic household energy consumption:

### Base Load

- Constant background usage of 0.2-0.3 kWh/hour
- Represents always-on appliances like refrigerators and standby power

### Daily Patterns

- Morning peak (6-9am): Hot water usage, breakfast preparation
- Daytime moderate usage: Pool pump, general household activities
- Evening peak (5-9pm): Cooking, TV, lighting, hot water
- Night low usage: Base load only, except during EV charging

### Device-Specific Patterns

- **EV Charging**: 1.7-1.9 kWh/hour, typically 1-4am every 2-3 days
- **Hot Water**: 1.2-1.5 kWh when active, morning and evening usage
- **Pool Pump**: 0.3-0.5 kWh/hour during daylight hours
- **Heat Pump**: Usage varies with temperature, 0.5-0.8 kWh when active

### Temperature Correlation

- Daily temperature cycle (coldest at 5am, warmest at 2pm)
- Heat pump activity increases at temperatures below 12°C or above 25°C
- Pool pump operates during warmer daylight hours

### Weekend Variation

- Later morning peak
- Higher daytime usage
- Additional hot water usage mid-morning

## Data Generation

The data is generated using a JavaScript script (`generate-synthetic-data.js`) that creates realistic usage patterns while maintaining natural variations. To regenerate the data:

```bash
# Navigate to the synthetic data directory
cd ./resources/synthetic-data/

# Generate one month of data
node generate-synthetic-data.js > synthetic-electric-usage-data.csv
```

## Usage

This dataset can be used to:

- Analyze daily and weekly consumption patterns
- Study the impact of temperature on energy usage
- Identify peak usage times and potential cost-saving opportunities
- Model device-specific energy consumption
- Develop and test energy monitoring applications

The hourly granularity and realistic device patterns make it suitable for various energy analysis and modeling projects.

## Generating Additional Data

### Data Generation Script

The `generate-synthetic-data.js` script can be used to create synthetic energy usage data. Here's how to use it:

1. **Location**: Script is stored in `hands-on-aws-cdk-book-projects/resources/synthetic-data/generate-synthetic-data.js`

2. **Generate Data**:

```bash
# Navigate to the synthetic data directory
cd hands-on-aws-cdk-book-projects/resources/synthetic-data/

# Generate one month of data
node generate-synthetic-data.js > synthetic-electric-usage-data.csv
```

### Customizing the Data

The script uses realistic patterns that you can modify:

```javascript
// Modify these values in generate-synthetic-data.js to adjust patterns

// Change the time period
generateMonthlyEnergyData(2024, 1)  // Year, Month

// Adjust base temperature
const baseTemp = 8;  // Change baseline temperature

// Modify device usage patterns
if (hour >= 1 && hour <= 4) {  // EV charging hours
    evCharging = true;
    kWh += 1.7 + (Math.random() * 0.2);  // EV charging load
}

if ((
```
