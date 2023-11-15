static const int iRotPtn[] = { 0, 1, -1, 0, -1, 0, 0, 1, 1, 0, 0, -1, 0, -1, 1, 0, 0 };
//割り込みで変化を読み取る
void interrupt_enc(void) {
  byte cur1 = (!digitalRead(sigA1) << 1) + !digitalRead(sigB1);
  byte old1 = pos1 & 0b00000011;
  byte dir1 = (pos1 & 0b00110000) >> 4;

  if (cur1 == 3) cur1 = 2;
  else if (cur1 == 2) cur1 = 3;

  if (cur1 != old1) {
    if (dir1 == 0) {
      if (cur1 == 1 || cur1 == 3) dir1 = cur1;
    } else {
      if (cur1 == 0) {
        if (dir1 == 1 && old1 == 3) enc_count1++;
        else if (dir1 == 3 && old1 == 1) enc_count1--;
        dir1 = 0;
      }
    }

    bool rote1 = 0;
    if (cur1 == 3 && old1 == 0) rote1 = 0;
    else if (cur1 == 0 && old1 == 3) rote1 = 1;
    else if (cur1 > old1) rote1 = 1;

    pos1 = (dir1 << 4) + (old1 << 2) + cur1;
  }
}