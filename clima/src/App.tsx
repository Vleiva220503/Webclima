import { Box, Heading, Select, Input, Button, VStack, Flex, Spinner, useToast, extendTheme, ThemeProvider, CSSReset } from "@chakra-ui/react";
import { useState, useEffect } from "react";

const theme = extendTheme({
  colors: {
    brand: {
      900: "#1a365d",
      800: "#153e75",
      700: "#2a69ac",
    },
  },
});

interface WeatherData {
  name: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    icon: string;
  }[];
  cod?: string;
}

const countries = [
  { value: "NI", label: "Nicaragua" },
  { value: "CR", label: "Costa Rica" },
  { value: "PA", label: "Panama" },
  { value: "HO", label: "Honduras" },
  { value: "PE", label: "Perú" },
];

const App = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (errorMessage !== "") {
      toast({
        title: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setErrorMessage("");
    }
  }, [errorMessage, toast]);

  const showError = (message: string) => {
    setLoading(false);
    setErrorMessage(message);
  };

  const clearHTML = () => {
    setWeatherData(null);
  };

  const showWeather = (data: WeatherData) => {
    setWeatherData(data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const city = e.currentTarget.elements.namedItem("city") as HTMLInputElement;
    const country = e.currentTarget.elements.namedItem("country") as HTMLSelectElement;

    if (city.value === "" || country.value === "") {
      setLoading(false);
      setErrorMessage("Ambos campos son obligatorios...");
      return;
    }

    const apiId = "41d1d7f5c2475b3a16167b30bc4f265c";
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city.value},${country.value}&appid=${apiId}`;

    try {
      const response = await fetch(url);
      const dataJSON = await response.json();

      if (dataJSON.cod === "404") {
        showError("Ciudad no encontrada...");
      } else {
        clearHTML();
        showWeather(dataJSON);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const kelvinToCentigrade = (temp: number) => {
    return Math.round(temp - 273.15);
  };

  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Box bg="brand.700" color="white" minHeight="100vh">
        <VStack p={4} align="center" spacing={8}>
          <Heading as="h1">Buscador del clima</Heading>
          <Box as="form" onSubmit={handleSubmit} width={["100%", "80%", "60%", "40%"]}>
            <VStack spacing={4}>
              <Select name="country" placeholder="Select the country" bg="brand.800" color="white">
                {countries.map((country) => (
                  <option key={country.value} value={country.value} style={{ color: "black" }}>
                    {country.label}
                  </option>
                ))}
              </Select>
              <Input type="text" name="city" id="city" placeholder="Write your city..." bg="brand.800" color="white" />
              <Button type="submit" colorScheme="teal" variant="solid" width="full">
                {loading ? <Spinner color="brand.800" /> : "Get Weather"}
              </Button>
            </VStack>
          </Box>
          {weatherData && !loading && (
            <Flex direction="column" align="center" justify="center" bg="brand.800" p={4} borderRadius="md">
              <Heading as="h5" mb={2}>
                Clima en {weatherData.name}
              </Heading>
              <Box
                as="img"
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="weather icon"
                mb={2}
              />
              <Heading as="h2" mb={2}>
                {kelvinToCentigrade(weatherData.main.temp)}°C
              </Heading>
              <Box as="p" mb={2}>Max: {kelvinToCentigrade(weatherData.main.temp_max)}°C</Box>
              <Box as="p">Min: {kelvinToCentigrade(weatherData.main.temp_min)}°C</Box>
            </Flex>
          )}
        </VStack>
      </Box>
    </ThemeProvider>
  );
};

export default App;
