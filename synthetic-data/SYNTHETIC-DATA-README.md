# Household Energy Usage Data

This CSV file contains simulated daily energy usage data for a household over the month of January 2023. It can be used to analyze energy consumption patterns and trends. It was generated specifically for use in Hands on AWS CDK Book projects.

## Columns

- `date` - The date of the energy usage
- `6am` - Energy usage from 6am to 12pm in kWh
- `12pm` - Energy usage from 12pm to 6pm in kWh
- `6pm` - Energy usage from 6pm to 12am in kWh
- `12am` - Energy usage from 12am to 6am in kWh
- `electricVehicleCharging` - Boolean indicating if an electric vehicle was charging that day
- `hotWaterHeater` - Boolean indicating if the hot water heater was active that day
- `poolPump` - Boolean indicating if the pool pump was running that day
- `heatPump` - Boolean indicating if the heat pump was active that day

## Data Generation

The data was randomly generated to simulate a typical single family household's energy consumption patterns. Lower usage overnight, increasing during the day when occupants are awake and appliances are in use, and dropping off in the evening. Weekends tend to have slightly higher usage.

The additional columns represent high energy draw items like an EV, hot water heater, pool pump etc. These were randomly turned "on" and "off" to simulate real world usage.

Overall the data represents a moderately energy efficient household with a mix of energy intensive appliances. It provides a realistic profile for analysis and modelling.

## Usage

This dataset can be used to identify peak usage times, analyze usage on weekdays vs weekends, evaluate impact of high draw appliances, and develop models to predict future energy needs. It provides a sample profile for energy-related projects and research.
