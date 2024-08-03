void showUpdate(byte kon) {
  digitalWrite(CS_PINS[kon], LOW);  // Select the display
  tft.setSwapBytes(true);
  tft.pushImage(0, 0, 240, 240, imageUpdate);
  tft.setSwapBytes(false);
  digitalWrite(CS_PINS[kon], LOW);               // Select the display

  digitalWrite(CS_PINS[kon == 0 ? 1 : 0], LOW);  // Select the display
  tft.setSwapBytes(false);
  // tft.fillScreen(TFT_BLACK);
  digitalWrite(CS_PINS[kon == 0 ? 1 : 0], LOW);  // Select the display
}