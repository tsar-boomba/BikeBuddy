#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClient.h>

const char *ssid = "wap";
const char *password = "password";

WiFiServer server(80);

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("Configuring platforimo Access Point...");

  // Explicit channel 1 to improve visibility
  if (WiFi.softAP(ssid, password, 1)) {
    Serial.println("AP Created Successfully!");
    Serial.print("AP IP address: ");
    Serial.println(WiFi.softAPIP());
  } else {
    Serial.println("AP Creation Failed!");
    while (true) { delay(1000); } // halt if AP fails
  }

  server.begin();
  Serial.println("HTTP Server started");
}

void loop() {
}