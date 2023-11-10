void setDefaultKeys() {
  // For keycode definition check out https://github.com/hathach/tinyusb/blob/master/src/class/hid/hid.h
  //layer 0
  layer_keys[0][0][1] = 0xFF;
  layer_keys[0][0][2] = HID_USAGE_CONSUMER_BRIGHTNESS_DECREMENT;
  layer_keys[0][0][0] = 0x00;

  layer_keys[0][1][1] = 0xFF;
  layer_keys[0][1][2] = HID_USAGE_CONSUMER_BRIGHTNESS_INCREMENT;
  layer_keys[0][1][0] = 0x00;

  layer_keys[0][2][1] = 0xFF;
  layer_keys[0][2][2] = HID_USAGE_CONSUMER_MUTE;
  layer_keys[0][2][0] = 0x00;

  layer_keys[0][3][1] = 0xFF;
  layer_keys[0][3][2] = HID_USAGE_CONSUMER_SCAN_PREVIOUS;
  layer_keys[0][3][0] = 0x00;

  layer_keys[0][4][1] = 0xFF;
  layer_keys[0][4][2] = HID_USAGE_CONSUMER_PLAY_PAUSE;
  layer_keys[0][4][0] = 0x00;

  layer_keys[0][5][1] = 0xFF;
  layer_keys[0][5][2] = HID_USAGE_CONSUMER_SCAN_NEXT;
  layer_keys[0][5][0] = 0x00;

  layer_keys[0][6][1] = 0xFF;
  layer_keys[0][6][2] = HID_USAGE_CONSUMER_VOLUME_INCREMENT;
  layer_keys[0][6][0] = 0x00;

  layer_keys[0][7][1] = 0xFF;
  layer_keys[0][7][2] = HID_USAGE_CONSUMER_VOLUME_DECREMENT;
  layer_keys[0][7][0] = 0x00;


  //layer 1
  layer_keys[1][0][1] = HID_KEY_NONE;
  layer_keys[1][0][0] = 0x08;

  layer_keys[1][1][1] = HID_KEY_NONE;
  layer_keys[1][1][0] = 0x00;

  layer_keys[1][2][1] = HID_KEY_NONE;
  layer_keys[1][2][0] = 0x00;

  layer_keys[1][3][1] = HID_KEY_NONE;
  layer_keys[1][3][0] = 0x01;

  layer_keys[1][4][1] = HID_KEY_NONE;
  layer_keys[1][4][0] = 0x02;

  layer_keys[1][5][1] = HID_KEY_NONE;
  layer_keys[1][5][0] = 0x04;

  layer_keys[1][6][1] = HID_KEY_KEYPAD_ADD;
  layer_keys[1][6][0] = 0x00;

  layer_keys[1][7][1] = HID_KEY_KEYPAD_SUBTRACT;
  layer_keys[1][7][0] = 0x00;


  //layer 2
  layer_keys[2][0][1] = HID_KEY_PAGE_UP;
  layer_keys[2][0][0] = 0x00;

  layer_keys[2][1][1] = HID_KEY_ARROW_UP;
  layer_keys[2][1][0] = 0x00;

  layer_keys[2][2][1] = HID_KEY_PAGE_DOWN;
  layer_keys[2][2][0] = 0x00;

  layer_keys[2][3][1] = HID_KEY_ARROW_LEFT;
  layer_keys[2][3][0] = 0x00;

  layer_keys[2][4][1] = HID_KEY_ARROW_DOWN;
  layer_keys[2][4][0] = 0x00;

  layer_keys[2][5][1] = HID_KEY_ARROW_RIGHT;
  layer_keys[2][5][0] = 0x00;

  layer_keys[2][6][1] = HID_KEY_NONE;
  layer_keys[2][6][0] = 0x00;

  layer_keys[2][7][1] = HID_KEY_NONE;
  layer_keys[2][7][0] = 0x00;


  //layer 3
  layer_keys[3][0][1] = HID_KEY_E;
  layer_keys[3][0][0] = 0x00;

  layer_keys[3][1][1] = HID_KEY_B;
  layer_keys[3][1][0] = 0x00;

  layer_keys[3][2][1] = HID_KEY_C;
  layer_keys[3][2][0] = 0x00;

  layer_keys[3][3][1] = HID_KEY_Z;
  layer_keys[3][3][0] = 0x08;

  layer_keys[3][4][1] = HID_KEY_Z;
  layer_keys[3][4][0] = 0x0A;

  layer_keys[3][5][1] = HID_KEY_SPACE;
  layer_keys[3][5][0] = 0x00;

  layer_keys[3][6][1] = HID_KEY_BRACKET_RIGHT;
  layer_keys[3][6][0] = 0x08;

  layer_keys[3][7][1] = HID_KEY_BRACKET_LEFT;
  layer_keys[3][7][0] = 0x08;


  //layer 4
  layer_keys[4][0][1] = HID_KEY_E;
  layer_keys[4][0][0] = 0x00;

  layer_keys[4][1][1] = HID_KEY_B;
  layer_keys[4][1][0] = 0x00;

  layer_keys[4][2][1] = HID_KEY_NONE;
  layer_keys[4][2][0] = 0x04;

  layer_keys[4][3][1] = HID_KEY_Z;
  layer_keys[4][3][0] = 0x01;

  layer_keys[4][4][1] = HID_KEY_Z;
  layer_keys[4][4][0] = 0x03;

  layer_keys[4][5][1] = HID_KEY_X;
  layer_keys[4][5][0] = 0x00;

  layer_keys[4][6][1] = 0x32;
  layer_keys[4][6][0] = 0x00;

  layer_keys[4][7][1] = 0x30;
  layer_keys[4][7][0] = 0x00;


  //layer 5
  layer_keys[5][0][1] = HID_KEY_E;
  layer_keys[5][0][0] = 0x00;

  layer_keys[5][1][1] = HID_KEY_B;
  layer_keys[5][1][0] = 0x00;

  layer_keys[5][2][1] = HID_KEY_NONE;
  layer_keys[5][2][0] = 0x04;

  layer_keys[5][3][1] = HID_KEY_Z;
  layer_keys[5][3][0] = 0x08;

  layer_keys[5][4][1] = HID_KEY_Z;
  layer_keys[5][4][0] = 0x0A;

  layer_keys[5][5][1] = HID_KEY_X;
  layer_keys[5][5][0] = 0x00;

  layer_keys[5][6][1] = 0x32;
  layer_keys[5][6][0] = 0x00;

  layer_keys[5][7][1] = 0x30;
  layer_keys[5][7][0] = 0x00;
}