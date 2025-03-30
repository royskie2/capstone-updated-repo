// Sidebar toggle functionality
document
  .getElementById("mobileMenuToggle")
  .addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("active");
  });

// Sample chart initialization
const salesCtx = document.getElementById("salesChart").getContext("2d");
const salesChart = new Chart(salesCtx, {
  type: "bar",
  data: {
    labels: [
      "SM Baliuag",
      "Baliuag Plaza",
      "Public Market",
      "University",
      "Maharlika Hwy",
    ],
    datasets: [
      {
        label: "Revenue (in PHP)",
        data: [1250, 980, 850, 650, 520],
        backgroundColor: "#ff6b35",
        borderColor: "#e64a19",
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

const productsCtx = document.getElementById("productsChart").getContext("2d");
const productsChart = new Chart(productsCtx, {
  type: "doughnut",
  data: {
    labels: [
      "Iced Coffee",
      "Hot Coffee",
      "Specialty Drinks",
      "Pastries",
      "Sandwiches",
    ],
    datasets: [
      {
        label: "Sales",
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          "#ff6b35",
          "#ff8a65",
          "#4527a0",
          "#7e57c2",
          "#2e7d32",
        ],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
});

// Updated Vendor Locations in Baliuag, Bulacan with peak hours
const vendorLocations = [
  {
    name: "SM Baliuag",
    lat: 14.9566,
    lng: 120.8969,
    peakHours: "2:00 PM - 6:00 PM",
    description: "Shopping mall with supermarket and department store",
    peakDescription:
      "High sales during afternoon hours due to shoppers visiting after work",
  },
  {
    name: "Baliuag Public Market",
    lat: 14.9541,
    lng: 120.8965,
    peakHours: "6:00 AM - 10:00 AM",
    description: "Traditional public market with fresh produce and meat",
    peakDescription: "Best sales in the morning when products are fresh",
  },
  {
    name: "Baliuag University",
    lat: 14.9563,
    lng: 120.8979,
    peakHours: "11:00 AM - 1:00 PM",
    description: "University with high student traffic during lunch hours",
    peakDescription:
      "Peak sales during lunch break as students look for meals and snacks",
  },
  {
    name: "Poblacion Plaza",
    lat: 14.9546,
    lng: 120.8973,
    peakHours: "4:00 PM - 7:00 PM",
    description: "Central plaza with surrounding shops and food stalls",
    peakDescription:
      "Busy in late afternoon and early evening as locals gather after work",
  },
  {
    name: "Baliuag Bus Terminal",
    lat: 14.9572,
    lng: 120.9001,
    peakHours: "5:00 AM - 8:00 AM, 5:00 PM - 8:00 PM",
    description: "Major transport hub for commuters",
    peakDescription:
      "High customer traffic during morning and evening commute times",
  },
];

let map, directionsService, directionsRenderer;
let heatmap, weatherOverlay, trafficLayer;
let markers = [];
let activeOverlays = {
  traffic: false,
  weather: false,
  density: false,
};
let userMarker = null;
let userLocation = null;

function initMap() {
  // Initialize map centered on Baliuag
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 14.9563, lng: 120.8979 }, // Centered on Baliuag University
    zoom: 15,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Add markers for vendor locations
  vendorLocations.forEach((location) => {
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.name,
    });

    // Create info window with peak hours
    // In the marker creation code:
    const contentString = `
          <div class="info-window">
              <h3>${location.name}</h3>
              <p>${location.description}</p>
              <div class="peak-hours">
                  <strong>Best Time to Visit:</strong> ${location.peakHours}<br>
                  <small>${location.peakDescription}</small>
              </div>
              <div style="margin-top: 10px;">
                  <button id="route-to-${location.name
                    .replace(/\s+/g, "-")
                    .toLowerCase()}" 
                          style="padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                      Route to Here
                  </button>
              </div>
          </div>
      `;

    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);

      // Add event listener to the "Route to Here" button after info window is opened
      setTimeout(() => {
        const routeBtn = document.getElementById(
          `route-to-${location.name.replace(/\s+/g, "-").toLowerCase()}`
        );
        if (routeBtn) {
          routeBtn.addEventListener("click", () => {
            routeToLocation(location);
          });
        }
      }, 300);
    });

    markers.push(marker);
  });

  // Initialize traffic layer
  trafficLayer = new google.maps.TrafficLayer();

  // Initialize heatmap for density with red-orange-yellow-green gradient
  const heatmapData = [
    // Based on your requirements - higher density near Baliuag University and SM
    { location: new google.maps.LatLng(14.9563, 120.8979), weight: 5 }, // Baliuag University (high density)
    { location: new google.maps.LatLng(14.9566, 120.8969), weight: 5 }, // SM Baliuag (high density)
    { location: new google.maps.LatLng(14.9541, 120.8965), weight: 4 }, // Public Market
    { location: new google.maps.LatLng(14.9546, 120.8973), weight: 4 }, // Poblacion Plaza
    // Additional density points around Baliuag University
    { location: new google.maps.LatLng(14.9568, 120.8985), weight: 4 }, // Near University
    { location: new google.maps.LatLng(14.9565, 120.8975), weight: 5 }, // Between Uni and SM
    { location: new google.maps.LatLng(14.956, 120.8983), weight: 5 }, // University area
    { location: new google.maps.LatLng(14.955, 120.8975), weight: 3 }, // Between Plaza and Market
  ];

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    radius: 50,
    // Red-Orange-Yellow-Green gradient
    gradient: [
      "rgba(0, 255, 0, 0)", // transparent green (lowest)
      "rgba(0, 255, 0, 1)", // green
      "rgba(255, 255, 0, 1)", // yellow
      "rgba(255, 165, 0, 1)", // orange
      "rgba(255, 0, 0, 1)", // red (highest)
    ],
    opacity: 0.7,
  });

  // Create the suggested locations list
  createSuggestionsList();

  // Set up event listeners
  setupEventListeners();
}

function createSuggestionsList() {
  const suggestionsList = document.getElementById("suggestionsList");

  // Get current time to highlight currently optimal locations
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  vendorLocations.forEach((location) => {
    const locationItem = document.createElement("div");
    locationItem.className = "location-item";

    // Check if current time is within peak hours
    const isPeakTime = isWithinPeakHours(
      location.peakHours,
      currentHour,
      currentMinute
    );

    locationItem.innerHTML = `
              <div>
                  <strong>${location.name}</strong>
                  <div style="font-size: 0.9em; color: #666;">Peak: ${
                    location.peakHours
                  }</div>
              </div>
              ${
                isPeakTime
                  ? '<span class="peak-tag">✓ Best Time Now</span>'
                  : ""
              }
          `;

    locationItem.addEventListener("click", () => {
      // Center map on this location
      map.setCenter({ lat: location.lat, lng: location.lng });
      map.setZoom(16);

      // Show route from user's location if available
      if (userLocation) {
        routeToLocation(location);
      }

      // Open info window
      for (let i = 0; i < markers.length; i++) {
        if (markers[i].getTitle() === location.name) {
          google.maps.event.trigger(markers[i], "click");
          break;
        }
      }
    });

    suggestionsList.appendChild(locationItem);
  });
}

function isWithinPeakHours(peakHoursStr, currentHour, currentMinute) {
  // Parse peak hours string like "11:00 AM - 1:00 PM" or "5:00 AM - 8:00 AM, 5:00 PM - 8:00 PM"
  const peakRanges = peakHoursStr.split(",");
  const currentTime = currentHour * 60 + currentMinute;

  for (let range of peakRanges) {
    range = range.trim();
    const [start, end] = range.split(" - ");

    // Parse time strings to minutes since midnight
    const startMinutes = parseTimeString(start);
    const endMinutes = parseTimeString(end);

    if (currentTime >= startMinutes && currentTime <= endMinutes) {
      return true;
    }
  }

  return false;
}

function parseTimeString(timeStr) {
  timeStr = timeStr.trim();
  let [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours < 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function routeToLocation(destination) {
  if (!userLocation) {
    alert(
      'Please share your location first using the "My Current Location" button.'
    );
    return;
  }

  document.getElementById("routeSummary").innerHTML =
    "<p>Calculating route to " + destination.name + "...</p>";

  directionsService.route(
    {
      origin: userLocation,
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        displayDirectRouteSummary(response, destination);
      } else {
        document.getElementById(
          "routeSummary"
        ).innerHTML = `<p>Directions request failed due to ${status}</p>`;
      }
    }
  );
}

function displayDirectRouteSummary(directionsResult, destination) {
  const route = directionsResult.routes[0];
  const leg = route.legs[0]; // Only one leg for direct route
  const summaryDiv = document.getElementById("routeSummary");

  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isPeakTime = isWithinPeakHours(
    destination.peakHours,
    currentHour,
    currentMinute
  );

  // Format arrival time
  const arrivalTime = new Date(now.getTime() + leg.duration.value * 1000);
  const arrivalHours = arrivalTime.getHours();
  const arrivalMinutes = arrivalTime.getMinutes();
  const arrivalTimeStr = `${arrivalHours % 12 || 12}:${arrivalMinutes
    .toString()
    .padStart(2, "0")} ${arrivalHours >= 12 ? "PM" : "AM"}`;

  let summaryHTML = `
          <h3>Route to ${destination.name}</h3>
          <p><strong>Distance:</strong> ${leg.distance.text}</p>
          <p><strong>Estimated Travel Time:</strong> ${leg.duration.text}</p>
          <p><strong>Estimated Arrival:</strong> ${arrivalTimeStr}</p>
      `;

  if (isPeakTime) {
    summaryHTML += `
              <div style="background-color: #dff0d8; padding: 10px; border-radius: 5px; margin-top: 10px;">
                  <p style="margin: 0;"><strong>✓ This is a peak time for sales at this location</strong></p>
                  <p style="margin: 5px 0 0 0; font-size: 0.9em;">${destination.peakDescription}</p>
              </div>
          `;
  } else {
    summaryHTML += `
              <div style="background-color: #fcf8e3; padding: 10px; border-radius: 5px; margin-top: 10px;">
                  <p style="margin: 0;"><strong>Note:</strong> Best selling time is ${destination.peakHours}</p>
                  <p style="margin: 5px 0 0 0; font-size: 0.9em;">${destination.peakDescription}</p>
              </div>
          `;
  }

  summaryDiv.innerHTML = summaryHTML;
}

function calculateAndDisplayRoute() {
  if (!userLocation) {
    alert(
      'Please share your location first using the "My Current Location" button.'
    );
    return;
  }

  document.getElementById("routeSummary").innerHTML =
    "<p>Calculating optimal route...</p>";

  // Create waypoints from vendor locations
  const waypoints = vendorLocations.map((location) => ({
    location: { lat: location.lat, lng: location.lng },
    stopover: true,
  }));

  // Remove the last location from waypoints to use as destination
  waypoints.pop();

  directionsService.route(
    {
      origin: userLocation,
      destination: {
        lat: vendorLocations[vendorLocations.length - 1].lat,
        lng: vendorLocations[vendorLocations.length - 1].lng,
      },
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        displayRouteSummary(response);
      } else {
        document.getElementById(
          "routeSummary"
        ).innerHTML = `<p>Directions request failed due to ${status}</p>`;
      }
    }
  );
}

function displayRouteSummary(directionsResult) {
  const route = directionsResult.routes[0];
  const summaryDiv = document.getElementById("routeSummary");

  // Calculate total distance and duration
  let totalDistance = 0;
  let totalDuration = 0;

  route.legs.forEach((leg) => {
    totalDistance += leg.distance.value; // in meters
    totalDuration += leg.duration.value; // in seconds
  });

  // Convert to user-friendly format
  const distanceInKm = (totalDistance / 1000).toFixed(2);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  let summaryHTML = `
          <h3>Optimized Route</h3>
          <p><strong>Total Distance:</strong> ${distanceInKm} km</p>
          <p><strong>Estimated Travel Time:</strong> ${
            hours > 0 ? hours + " hours " : ""
          }${minutes} minutes</p>
          <h4>Route Order:</h4>
          <ol>
              <li><strong>Starting Point:</strong> Your Location</li>
      `;

  // Add waypoints in optimized order
  const waypointOrder = route.waypoint_order;
  route.legs.forEach((leg, i) => {
    // For the last leg, the destination is the final location
    if (i === route.legs.length - 1) {
      summaryHTML += `<li><strong>${leg.end_address}</strong></li>`;
    } else {
      // Use waypoint_order to get the correct vendor location
      const locationIndex = waypointOrder[i];
      const location = vendorLocations[locationIndex];

      // Get current time
      const now = new Date();
      // Add the cumulative time to the current time to estimate arrival at this point
      let cumulativeTime = 0;
      for (let j = 0; j <= i; j++) {
        cumulativeTime += route.legs[j].duration.value;
      }
      const arrivalTime = new Date(now.getTime() + cumulativeTime * 1000);
      const arrivalHour = arrivalTime.getHours();
      const arrivalMinute = arrivalTime.getMinutes();

      // Check if arrival time is within peak hours
      const isPeakTime = isWithinPeakHours(
        location.peakHours,
        arrivalHour,
        arrivalMinute
      );

      summaryHTML += `
                  <li>
                      <strong>${location.name}</strong>
                      <div style="font-size: 0.9em; margin-top: 3px;">
                          Est. arrival: ${
                            arrivalHour % 12 || 12
                          }:${arrivalMinute.toString().padStart(2, "0")} ${
        arrivalHour >= 12 ? "PM" : "AM"
      }
                          ${
                            isPeakTime
                              ? '<span style="background-color: #dff0d8; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">✓ Peak Time</span>'
                              : ""
                          }
                      </div>
                  </li>
              `;
    }
  });

  summaryHTML += `</ol>`;

  summaryDiv.innerHTML = summaryHTML;
}

function setupEventListeners() {
  // My Current Location
  document.getElementById("myLocationBtn").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Add or update user marker
          if (userMarker) {
            userMarker.setPosition(userLocation);
          } else {
            userMarker = new google.maps.Marker({
              position: userLocation,
              map: map,
              title: "Your Location",
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              },
            });
          }

          // Center map on user location
          map.setCenter(userLocation);
          map.setZoom(15);

          // Update button to show location is active
          document.getElementById("myLocationBtn").classList.add("active");
          document.getElementById("myLocationBtn").innerText =
            "Location Shared";

          // Enable the Generate Route button
          document.getElementById("generateRouteBtn").disabled = false;
        },
        () => {
          alert(
            "Error: The Geolocation service failed. Please allow location access."
          );
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  });

  // Generate Route
  document
    .getElementById("generateRouteBtn")
    .addEventListener("click", calculateAndDisplayRoute);

  // Optimal Route
  document
    .getElementById("optimalRouteBtn")
    .addEventListener("click", calculateAndDisplayRoute);

  // High Density Areas
  document.getElementById("densityBtn").addEventListener("click", () => {
    activeOverlays.density = !activeOverlays.density;

    if (activeOverlays.density) {
      heatmap.setMap(map);
      document.getElementById("densityBtn").classList.add("active");
      document.getElementById("densityLegend").style.display = "block";
    } else {
      heatmap.setMap(null);
      document.getElementById("densityBtn").classList.remove("active");
      document.getElementById("densityLegend").style.display = "none";
    }

    updateStatusBar();
  });

  // Weather Overlay
  document.getElementById("weatherBtn").addEventListener("click", () => {
    activeOverlays.weather = !activeOverlays.weather;

    if (activeOverlays.weather) {
      document.getElementById("weatherBtn").classList.add("active");
      showWeatherInfo();
    } else {
      document.getElementById("weatherBtn").classList.remove("active");
      hideWeatherInfo();
    }

    updateStatusBar();
  });

  // Traffic Overlay
  document.getElementById("trafficBtn").addEventListener("click", () => {
    activeOverlays.traffic = !activeOverlays.traffic;

    if (activeOverlays.traffic) {
      trafficLayer.setMap(map);
      document.getElementById("trafficBtn").classList.add("active");
    } else {
      trafficLayer.setMap(null);
      document.getElementById("trafficBtn").classList.remove("active");
    }

    updateStatusBar();
  });

  // Save Route
  document.getElementById("saveRouteBtn").addEventListener("click", () => {
    alert("Route saved! Feature in development.");
  });
}

function showWeatherInfo() {
  // For demo purposes, just show a weather info box
  let weatherInfo = document.getElementById("weatherInfo");

  if (!weatherInfo) {
    weatherInfo = document.createElement("div");
    weatherInfo.id = "weatherInfo";
    weatherInfo.className = "weather-info-box";

    // Get current hour for weather condition
    const now = new Date();
    const currentHour = now.getHours();

    // Simulate different weather conditions based on time of day
    let condition, temp, humidity, wind;

    if (currentHour >= 11 && currentHour <= 15) {
      // Hot mid-day
      condition = "Sunny";
      temp = "33°C";
      humidity = "65%";
      wind = "3 km/h SE";
    } else if (currentHour >= 16 && currentHour <= 18) {
      // Afternoon
      condition = "Partly Cloudy";
      temp = "30°C";
      humidity = "70%";
      wind = "5 km/h SE";
    } else if (currentHour >= 6 && currentHour <= 10) {
      // Morning
      condition = "Clear";
      temp = "26°C";
      humidity = "80%";
      wind = "2 km/h NE";
    } else {
      // Evening/Night
      condition = "Clear";
      temp = "25°C";
      humidity = "75%";
      wind = "4 km/h E";
    }

    weatherInfo.innerHTML = `
              <h4>Current Weather - Baliuag</h4>
              <p>${temp} | ${condition}</p>
              <p>Humidity: ${humidity}</p>
              <p>Wind: ${wind}</p>
          `;

    document.getElementById("map").appendChild(weatherInfo);
  }
}

function hideWeatherInfo() {
  const weatherInfo = document.getElementById("weatherInfo");
  if (weatherInfo) {
    weatherInfo.remove();
  }
}
function updateStatusBar() {
  // Create or update status bar showing active overlays
  let statusBar = document.getElementById("mapStatusBar");

  if (!statusBar) {
    statusBar = document.createElement("div");
    statusBar.id = "mapStatusBar";
    statusBar.className = "map-status-bar";
    document.getElementById("map").appendChild(statusBar);
  }

  let activeOverlayText = "Active: ";
  let hasActiveOverlay = false;

  if (activeOverlays.traffic) {
    activeOverlayText += "Traffic ";
    hasActiveOverlay = true;
  }

  if (activeOverlays.weather) {
    activeOverlayText += "Weather ";
    hasActiveOverlay = true;
  }

  if (activeOverlays.density) {
    activeOverlayText += "Density ";
    hasActiveOverlay = true;
  }

  if (!hasActiveOverlay) {
    activeOverlayText += "None";
  }

  statusBar.textContent = activeOverlayText;
}

// Function to get the optimal routes for different time periods
function getOptimalRoutesByTime() {
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();

  // Different optimal routes based on time of day
  if (currentHour >= 5 && currentHour < 10) {
    // Morning route - prioritize morning peak locations like the Bus Terminal and Public Market
    return [4, 1, 0, 2, 3]; // Indices of vendorLocations
  } else if (currentHour >= 10 && currentHour < 14) {
    // Midday route - prioritize lunch time at Baliuag University
    return [2, 0, 3, 1, 4];
  } else if (currentHour >= 14 && currentHour < 19) {
    // Afternoon/Evening route - prioritize SM Baliuag and Poblacion Plaza
    return [0, 3, 2, 1, 4];
  } else {
    // Default route for other times
    return [0, 1, 2, 3, 4];
  }
}

// Function to suggest optimal route based on current time
function suggestTimeBasedRoute() {
  if (!userLocation) {
    alert(
      'Please share your location first using the "My Current Location" button.'
    );
    return;
  }

  const optimalRouteOrder = getOptimalRoutesByTime();
  document.getElementById("routeSummary").innerHTML =
    "<p>Calculating time-optimized route...</p>";

  // Create waypoints from the optimal route order
  const waypoints = [];
  for (let i = 0; i < optimalRouteOrder.length - 1; i++) {
    const locationIndex = optimalRouteOrder[i];
    waypoints.push({
      location: {
        lat: vendorLocations[locationIndex].lat,
        lng: vendorLocations[locationIndex].lng,
      },
      stopover: true,
    });
  }

  // Last location is the destination
  const lastLocationIndex = optimalRouteOrder[optimalRouteOrder.length - 1];

  directionsService.route(
    {
      origin: userLocation,
      destination: {
        lat: vendorLocations[lastLocationIndex].lat,
        lng: vendorLocations[lastLocationIndex].lng,
      },
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        displayTimeBasedRouteSummary(response, optimalRouteOrder);
      } else {
        document.getElementById(
          "routeSummary"
        ).innerHTML = `<p>Directions request failed due to ${status}</p>`;
      }
    }
  );
}

function displayTimeBasedRouteSummary(directionsResult, routeOrder) {
  const route = directionsResult.routes[0];
  const summaryDiv = document.getElementById("routeSummary");

  // Calculate total distance and duration
  let totalDistance = 0;
  let totalDuration = 0;

  route.legs.forEach((leg) => {
    totalDistance += leg.distance.value; // in meters
    totalDuration += leg.duration.value; // in seconds
  });

  // Convert to user-friendly format
  const distanceInKm = (totalDistance / 1000).toFixed(2);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  // Get current time period description
  const now = new Date();
  const currentHour = now.getHours();
  let timePeriod = "";

  if (currentHour >= 5 && currentHour < 10) {
    timePeriod =
      "Morning Route (optimized for breakfast and morning commuters)";
  } else if (currentHour >= 10 && currentHour < 14) {
    timePeriod = "Midday Route (optimized for lunch time traffic)";
  } else if (currentHour >= 14 && currentHour < 19) {
    timePeriod = "Afternoon/Evening Route (optimized for after-work visits)";
  } else {
    timePeriod = "Standard Route";
  }

  let summaryHTML = `
          <h3>Time-Optimized Route: ${timePeriod}</h3>
          <p><strong>Total Distance:</strong> ${distanceInKm} km</p>
          <p><strong>Estimated Travel Time:</strong> ${
            hours > 0 ? hours + " hours " : ""
          }${minutes} minutes</p>
          <h4>Route Order:</h4>
          <ol>
              <li><strong>Starting Point:</strong> Your Location</li>
      `;

  // Add locations in the optimized order
  let cumulativeTime = 0;
  for (let i = 0; i < routeOrder.length; i++) {
    const locationIndex = routeOrder[i];
    const location = vendorLocations[locationIndex];

    // Add the leg duration to calculate arrival time
    if (i < route.legs.length) {
      cumulativeTime += route.legs[i].duration.value;
    }

    // Calculate estimated arrival time
    const arrivalTime = new Date(now.getTime() + cumulativeTime * 1000);
    const arrivalHour = arrivalTime.getHours();
    const arrivalMinute = arrivalTime.getMinutes();
    const arrivalTimeStr = `${arrivalHour % 12 || 12}:${arrivalMinute
      .toString()
      .padStart(2, "0")} ${arrivalHour >= 12 ? "PM" : "AM"}`;

    // Check if arrival time is within peak hours
    const isPeakTime = isWithinPeakHours(
      location.peakHours,
      arrivalHour,
      arrivalMinute
    );

    summaryHTML += `
              <li>
                  <strong>${location.name}</strong>
                  <div style="font-size: 0.9em; margin-top: 3px;">
                      Est. arrival: ${arrivalTimeStr}
                      ${
                        isPeakTime
                          ? '<span style="background-color: #dff0d8; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">✓ Peak Time</span>'
                          : '<span style="background-color: #fcf8e3; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">Off-Peak</span>'
                      }
                  </div>
              </li>
          `;
  }

  summaryHTML += `</ol>
          <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
              <strong>Pro Tip:</strong> This route is optimized based on the current time of day and typical traffic patterns in Baliuag.
          </div>
      `;

  summaryDiv.innerHTML = summaryHTML;
}

// Add functionality to export route as GPX for navigation apps
function exportRouteAsGPX(directionsResult) {
  if (!directionsResult) {
    alert("No route to export. Please generate a route first.");
    return;
  }

  const route = directionsResult.routes[0];
  let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Baliuag Smart Route Planner" xmlns="http://www.topografix.com/GPX/1/1">
<metadata>
  <name>Optimized Baliuag Route</name>
  <time>${new Date().toISOString()}</time>
</metadata>
<rte>
  <name>Baliuag Optimized Route</name>`;

  // Add route points
  route.legs.forEach((leg) => {
    leg.steps.forEach((step) => {
      const startLat = step.start_location.lat();
      const startLng = step.start_location.lng();

      gpxContent += `
  <rtept lat="${startLat}" lon="${startLng}">
      <ele>0</ele>
  </rtept>`;
    });

    // Add the end point of the last step
    const lastStep = leg.steps[leg.steps.length - 1];
    const endLat = lastStep.end_location.lat();
    const endLng = lastStep.end_location.lng();

    gpxContent += `
  <rtept lat="${endLat}" lon="${endLng}">
      <ele>0</ele>
  </rtept>`;
  });

  gpxContent += `
</rte>
</gpx>`;

  // Create a download link
  const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "baliuag_route.gpx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Add functionality to optimize route based on traffic conditions
function optimizeForTraffic() {
  if (!userLocation) {
    alert(
      'Please share your location first using the "My Current Location" button.'
    );
    return;
  }

  // Turn on traffic layer to show traffic conditions
  trafficLayer.setMap(map);
  document.getElementById("trafficBtn").classList.add("active");
  activeOverlays.traffic = true;
  updateStatusBar();

  // Create departure time for traffic-based routing
  const departureTime = new Date();

  // Create waypoints from vendor locations
  const waypoints = vendorLocations.map((location) => ({
    location: { lat: location.lat, lng: location.lng },
    stopover: true,
  }));

  // Remove the last location from waypoints to use as destination
  waypoints.pop();

  document.getElementById("routeSummary").innerHTML =
    "<p>Calculating traffic-optimized route...</p>";

  directionsService.route(
    {
      origin: userLocation,
      destination: {
        lat: vendorLocations[vendorLocations.length - 1].lat,
        lng: vendorLocations[vendorLocations.length - 1].lng,
      },
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: departureTime,
        trafficModel: "bestguess",
      },
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        displayTrafficAwareRouteSummary(response);
      } else {
        document.getElementById(
          "routeSummary"
        ).innerHTML = `<p>Traffic-aware directions request failed due to ${status}</p>`;
      }
    }
  );
}

function displayTrafficAwareRouteSummary(directionsResult) {
  const route = directionsResult.routes[0];
  const waypointOrder = route.waypoint_order;
  const summaryDiv = document.getElementById("routeSummary");

  // Calculate total distance and duration
  let totalDistance = 0;
  let totalDuration = 0;
  let totalDurationWithTraffic = 0;

  route.legs.forEach((leg) => {
    totalDistance += leg.distance.value; // in meters
    totalDuration += leg.duration.value; // in seconds
    // Use duration_in_traffic if available, otherwise fall back to duration
    totalDurationWithTraffic += leg.duration_in_traffic
      ? leg.duration_in_traffic.value
      : leg.duration.value;
  });

  // Convert to user-friendly format
  const distanceInKm = (totalDistance / 1000).toFixed(2);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const hoursWithTraffic = Math.floor(totalDurationWithTraffic / 3600);
  const minutesWithTraffic = Math.floor((totalDurationWithTraffic % 3600) / 60);

  let summaryHTML = `
          <h3>Traffic-Optimized Route</h3>
          <p><strong>Total Distance:</strong> ${distanceInKm} km</p>
          <p><strong>Estimated Travel Time:</strong> ${
            hoursWithTraffic > 0 ? hoursWithTraffic + " hours " : ""
          }${minutesWithTraffic} minutes (with current traffic)</p>
          <p><strong>Normal Travel Time:</strong> ${
            hours > 0 ? hours + " hours " : ""
          }${minutes} minutes (without traffic)</p>
          <h4>Route Order:</h4>
          <ol>
              <li><strong>Starting Point:</strong> Your Location</li>
      `;

  // Get current time
  const now = new Date();
  let cumulativeTime = 0;

  // Add waypoints in optimized order
  for (let i = 0; i < route.legs.length; i++) {
    const leg = route.legs[i];

    // Add this leg's duration to the cumulative time
    cumulativeTime += leg.duration_in_traffic
      ? leg.duration_in_traffic.value
      : leg.duration.value;

    // Calculate arrival time
    const arrivalTime = new Date(now.getTime() + cumulativeTime * 1000);
    const arrivalHour = arrivalTime.getHours();
    const arrivalMinute = arrivalTime.getMinutes();
    const arrivalTimeStr = `${arrivalHour % 12 || 12}:${arrivalMinute
      .toString()
      .padStart(2, "0")} ${arrivalHour >= 12 ? "PM" : "AM"}`;

    // For the last leg, the destination is the final location
    if (i === route.legs.length - 1) {
      const location = vendorLocations[vendorLocations.length - 1];
      const isPeakTime = isWithinPeakHours(
        location.peakHours,
        arrivalHour,
        arrivalMinute
      );

      summaryHTML += `
                  <li>
                      <strong>${location.name}</strong>
                      <div style="font-size: 0.9em; margin-top: 3px;">
                          Est. arrival: ${arrivalTimeStr}
                          ${
                            isPeakTime
                              ? '<span style="background-color: #dff0d8; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">✓ Peak Time</span>'
                              : '<span style="background-color: #fcf8e3; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">Off-Peak</span>'
                          }
                      </div>
                  </li>
              `;
    } else {
      // Use waypoint_order to get the correct vendor location
      const locationIndex = waypointOrder[i];
      const location = vendorLocations[locationIndex];
      const isPeakTime = isWithinPeakHours(
        location.peakHours,
        arrivalHour,
        arrivalMinute
      );

      // Check if there's significant traffic on this leg
      const trafficDelay =
        leg.duration_in_traffic && leg.duration
          ? leg.duration_in_traffic.value - leg.duration.value
          : 0;
      const hasTrafficDelay = trafficDelay > 300; // More than 5 minutes delay

      summaryHTML += `
                  <li>
                      <strong>${location.name}</strong>
                      <div style="font-size: 0.9em; margin-top: 3px;">
                          Est. arrival: ${arrivalTimeStr}
                          ${
                            isPeakTime
                              ? '<span style="background-color: #dff0d8; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">✓ Peak Time</span>'
                              : '<span style="background-color: #fcf8e3; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">Off-Peak</span>'
                          }
                          ${
                            hasTrafficDelay
                              ? `<span style="background-color: #f2dede; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">Traffic Delay: ${Math.floor(
                                  trafficDelay / 60
                                )} min</span>`
                              : ""
                          }
                      </div>
                  </li>
              `;
    }
  }

  summaryHTML += `</ol>
          <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
              <strong>Traffic Info:</strong> This route has been optimized to avoid traffic congestion. Travel times include current traffic conditions.
          </div>
          <button id="exportGpxBtn" class="btn btn-secondary" style="margin-top: 15px;">Export Route as GPX</button>
      `;

  summaryDiv.innerHTML = summaryHTML;

  // Add event listener to the export button
  document.getElementById("exportGpxBtn").addEventListener("click", () => {
    exportRouteAsGPX(directionsResult);
  });
}

// Initialize map on page load
window.addEventListener("load", initMap);

// Create feature to compare different routes
function compareRoutes() {
  if (!userLocation) {
    alert(
      'Please share your location first using the "My Current Location" button.'
    );
    return;
  }

  const routeTypes = [
    {
      name: "Shortest Distance",
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
    },
    {
      name: "Avoid Highways",
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: true,
    },
    {
      name: "Time-Optimized",
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    },
  ];

  // Create summary div for comparison
  const summaryDiv = document.getElementById("routeSummary");
  summaryDiv.innerHTML = "<p>Comparing different route options...</p>";

  // Create waypoints from vendor locations
  const waypoints = vendorLocations.map((location) => ({
    location: { lat: location.lat, lng: location.lng },
    stopover: true,
  }));

  // Remove the last location from waypoints to use as destination
  waypoints.pop();

  const routePromises = routeTypes.map((routeType) => {
    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: userLocation,
          destination: {
            lat: vendorLocations[vendorLocations.length - 1].lat,
            lng: vendorLocations[vendorLocations.length - 1].lng,
          },
          waypoints: waypoints,
          optimizeWaypoints: routeType.optimizeWaypoints || false,
          travelMode: routeType.travelMode,
          avoidHighways: routeType.avoidHighways || false,
        },
        (response, status) => {
          if (status === "OK") {
            resolve({
              name: routeType.name,
              result: response,
            });
          } else {
            reject(`${routeType.name} routing failed: ${status}`);
          }
        }
      );
    });
  });

  Promise.all(routePromises)
    .then((results) => {
      displayRouteComparison(results);
    })
    .catch((error) => {
      summaryDiv.innerHTML = `<p>Error comparing routes: ${error}</p>`;
    });
}

function displayRouteComparison(routeResults) {
  const summaryDiv = document.getElementById("routeSummary");

  let summaryHTML = `
          <h3>Route Comparison</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Route Type</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Distance</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Est. Time</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Actions</th>
                  </tr>
              </thead>
              <tbody>
      `;

  routeResults.forEach((route, index) => {
    const result = route.result;
    const r = result.routes[0];

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    r.legs.forEach((leg) => {
      totalDistance += leg.distance.value; // in meters
      totalDuration += leg.duration.value; // in seconds
    });

    // Convert to user-friendly format
    const distanceInKm = (totalDistance / 1000).toFixed(2);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    summaryHTML += `
              <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${
                    route.name
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${distanceInKm} km</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${
                    hours > 0 ? hours + "h " : ""
                  }${minutes}m</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">
                      <button class="btn btn-primary btn-sm select-route-btn" data-route-index="${index}">
                          Select
                      </button>
                  </td>
              </tr>
          `;
  });

  summaryHTML += `
              </tbody>
          </table>
          <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
              <strong>Recommendation:</strong> The Time-Optimized route typically offers the best balance of distance and travel time.
          </div>
      `;

  summaryDiv.innerHTML = summaryHTML;

  // Add event listeners to the select buttons
  document.querySelectorAll(".select-route-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const routeIndex = parseInt(this.getAttribute("data-route-index"));
      const selectedRoute = routeResults[routeIndex];

      // Display the selected route
      directionsRenderer.setDirections(selectedRoute.result);

      // Update summary
      summaryDiv.innerHTML = `
                  <div style="padding: 10px; background-color: #dff0d8; border-radius: 5px; margin-bottom: 15px;">
                      <strong>Selected Route:</strong> ${selectedRoute.name}
                  </div>
              `;

      // Display detailed route information
      displayRouteSummary(selectedRoute.result);
    });
  });
}
// Add event listener for the compare routes button
document
  .getElementById("compareRoutesBtn")
  .addEventListener("click", compareRoutes);

// Function to show nearby parking locations
function showParkingLocations() {
  // Clear existing parking markers
  if (window.parkingMarkers) {
    window.parkingMarkers.forEach((marker) => marker.setMap(null));
  }

  // Create parking locations data (simulated for Baliuag)
  const parkingLocations = [
    {
      name: "SM Baliuag Parking",
      lat: 14.9568,
      lng: 120.8965,
      type: "Mall Parking",
      capacity: "High",
    },
    {
      name: "Public Market Parking",
      lat: 14.9538,
      lng: 120.8962,
      type: "Street Parking",
      capacity: "Medium",
    },
    {
      name: "Baliuag University Parking",
      lat: 14.9565,
      lng: 120.8982,
      type: "Campus Parking",
      capacity: "Medium",
    },
    {
      name: "Plaza Parking Lot",
      lat: 14.9543,
      lng: 120.8976,
      type: "Public Lot",
      capacity: "Low",
    },
  ];

  // Create markers for parking locations
  window.parkingMarkers = parkingLocations.map((location) => {
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.name,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/parkinglot.png",
      },
    });

    // Create info window for parking location
    const contentString = `
              <div class="info-window">
                  <h3>${location.name}</h3>
                  <p><strong>Type:</strong> ${location.type}</p>
                  <p><strong>Capacity:</strong> ${location.capacity}</p>
                  <div style="margin-top: 10px;">
                      <button class="btn btn-primary btn-sm" 
                              onclick="navigateToParking(${location.lat}, ${location.lng})">
                          Navigate Here
                      </button>
                  </div>
              </div>
          `;

    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    return marker;
  });

  // Show parking layer status
  document.getElementById("parkingBtn").classList.add("active");
  updateStatusBar();
}

// Function to navigate to parking location
function navigateToParking(lat, lng) {
  if (!userLocation) {
    alert(
      'Please share your location first using the "My Current Location" button.'
    );
    return;
  }

  directionsService.route(
    {
      origin: userLocation,
      destination: { lat: lat, lng: lng },
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);

        // Show summary
        document.getElementById("routeSummary").innerHTML = `
                  <h3>Parking Navigation</h3>
                  <p>Routing you to the selected parking location.</p>
                  <p><strong>Distance:</strong> ${response.routes[0].legs[0].distance.text}</p>
                  <p><strong>Estimated Time:</strong> ${response.routes[0].legs[0].duration.text}</p>
              `;
      } else {
        document.getElementById(
          "routeSummary"
        ).innerHTML = `<p>Directions request failed due to ${status}</p>`;
      }
    }
  );
}

// Function to show public transportation routes
function showPublicTransport() {
  // Simulated public transport routes for Baliuag
  const jeepneyRoutes = [
    {
      name: "Baliuag-San Rafael Route",
      path: [
        { lat: 14.9572, lng: 120.9001 }, // Bus Terminal
        { lat: 14.9566, lng: 120.8969 }, // SM Baliuag
        { lat: 14.9541, lng: 120.8965 }, // Public Market
        { lat: 14.95, lng: 120.895 }, // Towards San Rafael
      ],
      color: "#FF0000",
      frequency: "Every 15 minutes",
    },
    {
      name: "Poblacion Loop",
      path: [
        { lat: 14.9546, lng: 120.8973 }, // Plaza
        { lat: 14.9563, lng: 120.8979 }, // Baliuag University
        { lat: 14.9566, lng: 120.8969 }, // SM Baliuag
        { lat: 14.9541, lng: 120.8965 }, // Public Market
        { lat: 14.9546, lng: 120.8973 }, // Back to Plaza
      ],
      color: "#0000FF",
      frequency: "Every 20 minutes",
    },
  ];

  // Clear existing transport lines if any
  if (window.transportLines) {
    window.transportLines.forEach((line) => line.setMap(null));
  }

  // Create polylines for each route
  window.transportLines = jeepneyRoutes.map((route) => {
    const line = new google.maps.Polyline({
      path: route.path,
      geodesic: true,
      strokeColor: route.color,
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map,
    });

    // Add info window to first point of the route
    const firstPoint = route.path[0];
    const marker = new google.maps.Marker({
      position: firstPoint,
      map: map,
      title: route.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: route.color,
        fillOpacity: 1,
        strokeWeight: 0,
      },
    });

    const contentString = `
              <div class="info-window">
                  <h3>${route.name}</h3>
                  <p><strong>Frequency:</strong> ${route.frequency}</p>
                  <p><strong>Stops:</strong> ${route.path.length} major stops</p>
              </div>
          `;

    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    return line;
  });

  // Show public transport layer status
  document.getElementById("publicTransportBtn").classList.add("active");
  updateStatusBar();
}

// Function to find nearest vendor location from current position
function findNearestVendor() {
  if (!userLocation) {
    alert(
      'Please share your location first using the "My Current Location" button.'
    );
    return;
  }

  let nearestLocation = null;
  let shortestDistance = Infinity;

  // Calculate distance to each vendor location
  vendorLocations.forEach((location) => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      location.lat,
      location.lng
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestLocation = location;
    }
  });

  if (nearestLocation) {
    // Center map on the nearest location
    map.setCenter({ lat: nearestLocation.lat, lng: nearestLocation.lng });
    map.setZoom(16);

    // Show route to nearest location
    routeToLocation(nearestLocation);

    // Show info window
    for (let i = 0; i < markers.length; i++) {
      if (markers[i].getTitle() === nearestLocation.name) {
        google.maps.event.trigger(markers[i], "click");
        break;
      }
    }

    // Update summary
    document.getElementById("routeSummary").innerHTML = `
              <h3>Nearest Vendor Location</h3>
              <p><strong>${
                nearestLocation.name
              }</strong> is the closest to your current location.</p>
              <p><strong>Distance:</strong> ${shortestDistance.toFixed(
                2
              )} km</p>
              <p><strong>Peak Hours:</strong> ${nearestLocation.peakHours}</p>
          `;
  }
}

// Helper function to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Function to show historical sales data overlay
function showSalesData() {
  // Simulated sales data points
  const salesData = [
    { lat: 14.9566, lng: 120.8969, sales: 150 }, // SM Baliuag
    { lat: 14.9541, lng: 120.8965, sales: 200 }, // Public Market
    { lat: 14.9563, lng: 120.8979, sales: 120 }, // Baliuag University
    { lat: 14.9546, lng: 120.8973, sales: 90 }, // Poblacion Plaza
    { lat: 14.9572, lng: 120.9001, sales: 110 }, // Bus Terminal
  ];

  // Clear existing sales markers if any
  if (window.salesMarkers) {
    window.salesMarkers.forEach((marker) => marker.setMap(null));
  }

  // Create circle markers for sales data
  window.salesMarkers = salesData.map((data) => {
    // Calculate circle radius based on sales (scaled for visibility)
    const radius = Math.sqrt(data.sales) * 20;

    const circle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: map,
      center: { lat: data.lat, lng: data.lng },
      radius: radius,
    });

    // Find the corresponding location name
    const location = vendorLocations.find(
      (loc) =>
        Math.abs(loc.lat - data.lat) < 0.001 &&
        Math.abs(loc.lng - data.lng) < 0.001
    );

    const locationName = location ? location.name : "Unknown Location";

    // Create info window for sales data
    const contentString = `
              <div class="info-window">
                  <h3>${locationName}</h3>
                  <p><strong>Average Daily Sales:</strong> ${data.sales} units</p>
                  <p>Circle size represents relative sales volume</p>
              </div>
          `;

    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
    });

    // Add click listener to the circle
    circle.addListener("click", () => {
      infoWindow.setPosition({ lat: data.lat, lng: data.lng });
      infoWindow.open(map);
    });

    return circle;
  });

  // Show sales data layer status
  document.getElementById("salesDataBtn").classList.add("active");
  updateStatusBar();
}

// Initialize the application
window.addEventListener("load", () => {
  initMap();

  // Add additional event listeners
  document
    .getElementById("parkingBtn")
    .addEventListener("click", showParkingLocations);
  document
    .getElementById("publicTransportBtn")
    .addEventListener("click", showPublicTransport);
  document
    .getElementById("nearestVendorBtn")
    .addEventListener("click", findNearestVendor);
  document
    .getElementById("salesDataBtn")
    .addEventListener("click", showSalesData);
  document
    .getElementById("compareRoutesBtn")
    .addEventListener("click", compareRoutes);

  // Disable Generate Route button initially until location is shared
  document.getElementById("generateRouteBtn").disabled = true;
});
