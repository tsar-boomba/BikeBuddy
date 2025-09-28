/*
 *  This sketch sends a message to a TCP server
 *
 */

#include <WiFi.h>
#include <WiFiMulti.h>

WiFiMulti WiFiMulti;

const uint16_t port = 80;
const char *host = "192.168.4.1";

const int leftPin = 5;
const int rightPin = 9;

int leftTurn = 0;
int rightTurn = 0;

void setup() {
  Serial.begin(115200);
  pinMode(leftPin, INPUT_PULLUP);
  pinMode(rightPin, INPUT_PULLUP);

  delay(10);

  WiFiMulti.addAP("helmetwap", "helmet123");

  Serial.println();
  Serial.println();
  Serial.print("Waiting for WiFi... ");

  while (WiFiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  delay(500);
}

void loop() {
  int curLeft = !digitalRead(leftPin);
  int curRight = !digitalRead(rightPin);
  int success;

  if (curLeft != leftTurn) {
    String request = "GET /left?status=" + String(curLeft) + " HTTP/1.1\r\n\r\n";
    success = wifi_request(request);
    if (success == 1) {
      leftTurn = curLeft;
    }
  } 
  
  if (curRight != rightTurn) {
    String request = "GET /right?status=" + String(curRight) + " HTTP/1.1\r\n\r\n";
    success = wifi_request(request);
    if (success == 1) {
      rightTurn = curRight;
    }
  }
}

int wifi_request(String request) {
  Serial.print("Connecting to ");
  Serial.println(host);

  NetworkClient client;

  if (!client.connect(host, port)) {
    Serial.println("Connection failed.");
    return 0;
  }

  Serial.print("Sending request: ");
  Serial.println(request);
  client.print(request);

  // int maxloops = 0;

  // //wait for the server's reply to become available
  // while (!client.available() && maxloops < 1000) {
  //   maxloops++;
  //   delay(1);  //delay 1 msec
  // }
  // if (client.available() > 0) {
  //   //read back one line from the server
  //   String line = client.readStringUntil('\r');
  //   Serial.println(line);
  // } else {
  //   Serial.println("client.available() timed out ");
  // }

  Serial.println("Closing connection.");
  client.stop();

  return 1; 
}
