
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
// See the following for generating UUIDs:
// https://www.uuidgenerator.net/
#define SERVICE_UUID "dee13011-14d8-4e12-94af-a6edfeaa1af9"
#define CHARACTERISTIC_UUID "dee13012-14d8-4e12-94af-a6edfeaa1af9"
#include "config.h"
bool rebooting = false;
int errorTidak = 0;

// #include <SD.h>
#include "imageUpdate.h"
#include <SPI.h>
#include <FS.h>
#include <SPIFFS.h>
#include <TFT_eSPI.h>  // Install this library with the Arduino Library Manager
                       // Don't forget to configure the driver for the display!

#include <AnimatedGIF.h>  // Install this library with the Arduino Library Manager

// #define SD_CS_PIN 12 // Chip Select Pin (CS) for SD card Reader

AnimatedGIF gif;
AnimatedGIF gif1;
File gifFile;   // Global File object for the GIF file
File gifFile1;  // Global File object for the GIF file
TFT_eSPI tft = TFT_eSPI();

const char *filename = "/eyeLeft.h";    // Change to load other gif files in images/GIF
const char *filename1 = "/eyeRight.h";  // Change to load other gif files in images/GIF

// Adjust this value based on the number of displays
const int NUM_DISPLAYS = 2;
// Add more CS pins if you have more displays, each display must have a dedicated pin
const int CS_PINS[NUM_DISPLAYS] = { 4, 16 };
int currentScreenIndex = 0;

bool kondisi = true;
byte updateYgMana = 0;
File file;
class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    // Konversi std::string ke std::vector<uint8_t>
    std::vector<uint8_t> valueVector(value.begin(), value.end());
    const uint8_t *uint8Array = valueVector.data();

    if (value.length() > 0) { 
      if (value == "awala") {
        // Serial.println("AWAL OK");
        kondisi = true;
        updateYgMana = 0;
      } else if (value == "awalb") {
        // Serial.println("AWAL OK");
        kondisi = true;
        updateYgMana = 1;
      } else if (value == "akhira" or value == "akhirb") {
        // Serial.println("AKHIR OK");
        rebooting = true;
      } else {

        if (updateYgMana == 0) {
          file = SPIFFS.open("/eyeLeft.h", kondisi ? FILE_WRITE : FILE_APPEND);

        } else if (updateYgMana == 1) {
          file = SPIFFS.open("/eyeRight.h", kondisi ? FILE_WRITE : FILE_APPEND);
        }
        // Tulis data ke file 
        int bytesWritten = file.write(uint8Array, valueVector.size()); 
        kondisi = false;
        // Tutup file
        file.close();
      }
    }
  }
};
void setup() {
  Serial.begin(115200);
  BLEinit();
  tft.init();
  for (int i = 0; i < NUM_DISPLAYS; i++) {
    pinMode(CS_PINS[i], OUTPUT);
    digitalWrite(CS_PINS[i], LOW);  // select the display
    tft.setSwapBytes(false);
    tft.fillScreen(TFT_BLACK);
    tft.setRotation(0);              // Adjust Rotation of your screen (0-3)
    digitalWrite(CS_PINS[i], HIGH);  // Deselect the display
  }


  // Initialize SPIFFS
  Serial.println("Initialize SPIFFS...");
  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS initialization failed!");
  }

  // file = SPIFFS.open("/eyeLeft.h", FILE_READ);
  // while (file.available()) {
  //   // mataKiri[count_] = (int)file.read();
  //   Serial.println(file.read());
  //   // count_++;
  // }
  Serial.println("AKHIR");
  Serial.println(file.size());
  file.close();


  gifFile = SPIFFS.open(filename, FILE_READ);
  gifFile1 = SPIFFS.open(filename1, FILE_READ);
  // Initialize the GIF
  Serial.println("Starting animation...");
  Serial.println(gifFile.size());
  Serial.println(gifFile1.size());

  gif.begin(BIG_ENDIAN_PIXELS);
  gif1.begin(BIG_ENDIAN_PIXELS);
  if (!gif.open(filename, fileOpen, fileClose, fileRead, fileSeek, GIFDraw)) {
    Serial.printf("Could not open gif \n");
    errorTidak = 1;
  }
  if (!gif1.open(filename1, fileOpen1, fileClose1, fileRead1, fileSeek1, GIFDraw)) {
    Serial.printf("Could not open gif \n");
    errorTidak = 1;
  }
}

void loop() {

  if (rebooting) {
    delay(1000);
    ESP.restart();
  } 
  if (!kondisi) {
    showUpdate(updateYgMana);
  } else {
    if (errorTidak == 0) {
      playGif(&gif, 0);
      playGif(&gif1, 1);
    }
  }
 
}


void playGif(AnimatedGIF *giff, int screenIndex) {
  currentScreenIndex = screenIndex;
  int res = giff->playFrame(false, NULL);
  if (res == 0) {
    // If no more frames are available, reset the GIF to the beginning
    // Serial.println("KELAR");
    giff->reset();
    giff->playFrame(false, NULL);
  }
  if (res == -1) {
    // Serial.printf("Gif Error = %d on screen %d\n", giff->getLastError(), screenIndex);
  }
}

// Callbacks for file operations for the Animated GIF Lobrary
void *fileOpen(const char *filename, int32_t *pFileSize) {
  // gifFile = SPIFFS.open(filename, FILE_READ);
  *pFileSize = gifFile.size();
  if (!gifFile) {
    // Serial.println("Failed to open GIF file from SPIFFS!");
  }
  return (void *)&gifFile;
}
void *fileOpen1(const char *filename, int32_t *pFileSize) {
  // gifFile1 = SPIFFS.open(filename1, FILE_READ);
  *pFileSize = gifFile1.size();
  if (!gifFile1) {
    // Serial.println("Failed to open GIF file from SPIFFS!");
  }
  return (void *)&gifFile1;
}

void fileClose(void *pHandle) {
  gifFile.close();
}

void fileClose1(void *pHandle) {
  gifFile1.close();
}


int32_t fileRead(GIFFILE *pFile, uint8_t *pBuf, int32_t iLen) {

  int32_t iBytesRead;
  iBytesRead = iLen;
  if ((pFile->iSize - pFile->iPos) < iLen)
    iBytesRead = pFile->iSize - pFile->iPos - 1;
  if (iBytesRead <= 0)
    return 0;

  // gifFile.seek(pFile->iPos);
  iBytesRead = gifFile.read(pBuf, iLen);
  pFile->iPos = gifFile.position();

  return iBytesRead;
}

int32_t fileRead1(GIFFILE *pFile, uint8_t *pBuf, int32_t iLen) {

  int32_t iBytesRead;
  iBytesRead = iLen;
  if ((pFile->iSize - pFile->iPos) < iLen)
    iBytesRead = pFile->iSize - pFile->iPos - 1;
  if (iBytesRead <= 0)
    return 0;

  // gifFile.seek(pFile->iPos);
  iBytesRead = gifFile1.read(pBuf, iLen);
  pFile->iPos = gifFile1.position();

  return iBytesRead;
}


int32_t fileSeek(GIFFILE *pFile, int32_t iPosition) {
  if (iPosition < 0)
    iPosition = 0;
  else if (iPosition >= pFile->iSize)
    iPosition = pFile->iSize - 1;
  pFile->iPos = iPosition;
  gifFile.seek(pFile->iPos);
  return iPosition;
}
int32_t fileSeek1(GIFFILE *pFile, int32_t iPosition) {
  if (iPosition < 0)
    iPosition = 0;
  else if (iPosition >= pFile->iSize)
    iPosition = pFile->iSize - 1;
  pFile->iPos = iPosition;
  gifFile1.seek(pFile->iPos);
  return iPosition;
}
