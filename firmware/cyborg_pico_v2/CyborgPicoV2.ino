/*--add board manager--
  Raspberry Pi Pico/RP2040 by earlephilhower(https://github.com/earlephilhower/arduino-pico/)
  https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json
  -------------------*/

/*--Required Libraries--
  Adafruit TinyUSB Library
  Adafruit NeoPixel
  --------------------*/

//TinyUSB
#include "Adafruit_TinyUSB.h"
//RGBLED
#include <Adafruit_NeoPixel.h>
//EEEPROM
#include <EEPROM.h>

//OLED
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define EEPROM_SIZE 4096
#define MAINLAYER_START_ADDRESS 1000
#define SUBLAYER_START_ADDRESS 2000
#define LAYER_ADDRESS 0
#define BRIGHTNESS_ADDRESS 1
#define ENCINVERT_ADDRESS 2
#define LAYERMASK_ADDRESS 3


//RotaryEncoder
#define SIGA1 11
#define SIGB1 12
//Push Button
#define PB1 10

#define ROW1 0
#define ROW2 1
#define ROW3 2
#define ROW4 3
#define ROW5 6
#define ROW6 7

//WS2812B
#define PIN 9
#define WS_BUILTIN 16
#define MAXIMUM_BRIGHTNESS 128


#define OLED_POWER 8
#define SCREEN_WIDTH 128  // OLED display width, in pixels
#define SCREEN_HEIGHT 32  // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET -1  // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

int rows[] = { ROW1, ROW2, ROW3, ROW4, ROW5, ROW6 };
int columns[] = { 0 };
int rowsCount = 0;
int columnsCount = 0;

int rot1 = 0;
int rot2 = 0;
int counter = 0;
int clearCounter = 0;
int layers = 0;
int count = 0;
int Brightness = 64;
int layer_num = 0;
int layer_key_num = 0;
int offsetAddress = MAINLAYER_START_ADDRESS;

uint8_t sigA1 = SIGA1;
uint8_t sigB1 = SIGB1;
uint8_t rgb_mask[3] = { 1, 1, 1 };
uint8_t keys[6] = { 0 };
uint8_t keyputs[6] = { 0 };
uint8_t temp_keys[7] = { 0 };
uint8_t layer_keys[6][10][7] = { 0 };  //layer 6 ,keys 10 ,code 6 + 1 modifier
char buff[64] = { '\0' };
String layer_name[6] = {
  "LAYER 0",
  "LAYER 1",
  "LAYER 2",
  "LAYER 3",
  "LAYER 4",
  "LAYER 5"
};
String setup_url = "https://favorscreation.github.io/kb-setup/";
String str = "";

volatile int8_t pos1;  //エンコーダー状態を記憶
volatile int enc_count1;
volatile uint8_t key = 0b00000000;
volatile uint8_t oldKey = 0b00000000;
uint8_t layermask = 0b11111111;

unsigned long watch = 0;

bool state;
bool layerChangeFlag;
bool sendURI;
bool mount_state = false;
bool serial_state = false;
bool suspend_state = false;

//WS2812
Adafruit_NeoPixel strip =
  Adafruit_NeoPixel(6, PIN, NEO_GRB + NEO_KHZ800);

Adafruit_NeoPixel builtin_strip =
  Adafruit_NeoPixel(6, WS_BUILTIN, NEO_GRB + NEO_KHZ800);

// Report ID
enum {
  RID_KEYBOARD1 = 1,
  RID_KEYBOARD2,
  RID_KEYBOARD3,
  RID_KEYBOARD4,
  RID_KEYBOARD5,
  RID_KEYBOARD6,
  RID_CONSUMER_CONTROL,  // Media, volume etc ..
  RID_MOUSE,
};

// HID report descriptor using TinyUSB's template
uint8_t const desc_hid_report[] = {
  TUD_HID_REPORT_DESC_KEYBOARD(HID_REPORT_ID(RID_KEYBOARD1)),
  TUD_HID_REPORT_DESC_KEYBOARD(HID_REPORT_ID(RID_KEYBOARD2)),
  TUD_HID_REPORT_DESC_KEYBOARD(HID_REPORT_ID(RID_KEYBOARD3)),
  TUD_HID_REPORT_DESC_KEYBOARD(HID_REPORT_ID(RID_KEYBOARD4)),
  TUD_HID_REPORT_DESC_KEYBOARD(HID_REPORT_ID(RID_KEYBOARD5)),
  TUD_HID_REPORT_DESC_KEYBOARD(HID_REPORT_ID(RID_KEYBOARD6)),
  TUD_HID_REPORT_DESC_CONSUMER(HID_REPORT_ID(RID_CONSUMER_CONTROL)),
  TUD_HID_REPORT_DESC_MOUSE(HID_REPORT_ID(RID_MOUSE))
};

Adafruit_USBD_HID usb_hid(desc_hid_report, sizeof(desc_hid_report), HID_ITF_PROTOCOL_KEYBOARD, 2, false);

void (*resetFunc)(void) = 0;

void setup() {

  setDefaultKeys();

#if defined(ARDUINO_ARCH_MBED) && defined(ARDUINO_ARCH_RP2040)
  // Manual begin() is required on core without built-in support for TinyUSB such as mbed rp2040
  TinyUSB_Device_Init(0);
#endif

  //PIN設定より前に書かないとプルアップされない
  //割り込み
  attachInterrupt(SIGA1, interrupt_enc, CHANGE);
  attachInterrupt(SIGB1, interrupt_enc, CHANGE);

  //ピン設定
  pinMode(SIGA1, INPUT_PULLUP);
  pinMode(SIGB1, INPUT_PULLUP);

  rowsCount = (sizeof(rows) / sizeof(rows[0]));
  columnsCount = (sizeof(columns) / sizeof(columns[0]));

  for (int i = 0; i < rowsCount; i++) {
    pinMode(rows[i], INPUT_PULLUP);
  };

  pinMode(PB1, INPUT_PULLUP);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(PIN, OUTPUT);

  //OLED
  pinMode(OLED_POWER, OUTPUT);
  digitalWrite(OLED_POWER, HIGH);

  //EEPROMエミュレート開始
  EEPROM.begin(EEPROM_SIZE);

  //rgbLED初期化
  strip.begin();
  strip.show();  // Initialize all pixels to 'off'

  builtin_strip.begin();
  builtin_strip.setPixelColor(0, 0, 64, 64);
  builtin_strip.show();

  //シリアル通信開始
  Serial.begin(115200);

  // Set up output report (on control endpoint) for Capslock indicator
  usb_hid.setReportCallback(NULL, hid_report_callback);
  //hid開始
  usb_hid.begin();

  // wait until device mounted
  while (!TinyUSBDevice.mounted()) {
    digitalWrite(LED_BUILTIN, HIGH);
    strip.setPixelColor(0, 0, 0, 255);
    strip.show();
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
    strip.setPixelColor(0, 0, 0, 0);
    strip.show();
    delay(100);
  }
  Serial.println("Begin TinyUSB HID");
  mount_state = true;
  init();  //eepromで初期化

  //Setup SSD1306
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 can not allocate memory!"));
    return;
  }

  oled_outputs("Hello", 1, "CyborgPico", 2, "", 1);
}

void init() {

  if (EEPROM.read(LAYERMASK_ADDRESS) != 0)
    layermask = EEPROM.read(LAYERMASK_ADDRESS);

  uint8_t read_layernum = EEPROM.read(LAYER_ADDRESS);
  if (read_layernum < 10)
    layers = read_layernum;
  else if (read_layernum == 255) {
    layers = 0;
  } else {
    layers = 0;
    Serial.print("Memory Error");
  }

  //EEPROM読み取り
  short addres;
  uint8_t value;
  short len1 = sizeof(layer_keys[0][0]);
  short len2 = sizeof(layer_keys[0]);
  short len3 = sizeof(layer_keys);
  for (int i = 0; i < (len3 / len2); i++) {    //layers
    for (int j = 0; j < (len2 / len1); j++) {  //keys
      for (int k = 0; k < len1; k++) {         //code
        addres = i * 100 + j * 10 + k;
        value = EEPROM.read(addres + offsetAddress);
        if (value != 255) {
          layer_keys[i][j][k] = value;
        }
      }
    }
  }
  if (MAXIMUM_BRIGHTNESS < EEPROM.read(BRIGHTNESS_ADDRESS))
    Brightness = MAXIMUM_BRIGHTNESS;
  else
    EEPROM.read(BRIGHTNESS_ADDRESS);

  layerState_led(layers);

  if (EEPROM.read(ENCINVERT_ADDRESS) == 1) {
    sigA1 = SIGB1;
    sigB1 = SIGA1;
  } else {
    sigA1 = SIGA1;
    sigB1 = SIGB1;
  }
}

void loop() {
  Switch_function(0);
  RotEncFunc();
  read_keys();
  check_mount();
  save();
}