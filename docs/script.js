const typedKey = document.querySelector(".typedKey");

window.onload = async function () {
    jis();
    try {
        navigator.serial.getPorts().then((ports) => {
            // ページが読み込まれた時、`ports` を用いて利用可能なポートのリストを初期化します。
            console.log(ports);
        });
    } catch {
        alert("not support browser");
    }
    await sleep(500);
    const spinner = document.getElementById('init');
    spinner.classList.add('loaded');
};

function sleep(msec) {
    return new Promise(function (resolve) {

        setTimeout(function () { resolve() }, msec);

    })
}

function clearKeys(e) {
    let key_triggers = document.querySelectorAll("input[name=trigger]:checked");
    let mod_triggers = document.querySelectorAll("input[name=modtrigger]:checked");
    let con_triggers = document.querySelectorAll("input[name=contrigger]:checked");
    let count = 0;
    for (item of key_triggers) {
        if (item.checked == true)
            count++;
        item.checked = false;
    }
    for (item of mod_triggers) {
        if (item.checked == true)
            count++;
        item.checked = false;
    }

    for (item of con_triggers) {
        if (item.checked == true)
            count++;
        item.checked = false;
    }

    if (e == true && count != 0)
        delete_last_line();
}

const send_data = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
function typed(e) {
    send_data[0] = 0;
    send_data[1] = 0;
    send_data[2] = 0;
    send_data[3] = 0;
    send_data[4] = 0;
    send_data[5] = 0;
    send_data[6] = 0;
    let key_triggers = document.querySelectorAll("input[name=trigger]:checked");
    let mod_triggers = document.querySelectorAll("input[name=modtrigger]:checked");
    let con_triggers = document.querySelectorAll("input[name=contrigger]:checked");
    let mod = "None"
    let mod_value = 0;
    for (let checked_data of mod_triggers) {
        if (mod == "None")
            mod = "";
        mod += checked_data.value;
        const view = new DataView(new ArrayBuffer(1));
        let bit_shift = checked_data.value - 224;
        mod_bit = 1;
        if (bit_shift > 0) {
            mod_bit = mod_bit << bit_shift;
            mod_value |= mod_bit;
        }
        else {
            mod_bit = 1;
            mod_value |= mod_bit;
        }
    }
    send_data[0] = mod_value;

    //cancel
    if ((key_triggers.length + con_triggers.length) > 1) {
        e.preventDefault();
        return;
    }

    let count = 0;
    for (let checked_data of key_triggers) {
        if (count > 0)
            break;
        send_data[1] = checked_data.value;
        count++;
    }

    for (let checked_data of con_triggers) {
        if (count > 0)
            break;
        send_data[1] = 255;
        send_data[2] = checked_data.value;
        count++;
    }

    create_senddata();

    if ((con_triggers.length + key_triggers.length + mod_triggers.length) > 0)
        document.getElementById("pending").textContent += textdata;
    else
        delete_last_line();

    cleanup();
    line2allocation();
}

let Layer_num = 0;
let key_num = 0;
function setLayerNum(e) {
    Layer_num = e.target.value;
    clearKeys();
    clrearAssign();
    set_assign();
}

function setKeyNum(e) {
    key_num = e.target.value - 1;
    clearKeys();
}


function openSerial(e) {
    keepReading = true;
    SerialBegin();
}

async function closeSerial(e) {
    keepReading = false;
    reader.cancel();
    await closedPromise;
}

var port;
var closedPromise;
async function SerialBegin() {
    // Prompt user to select any serial port.
    const filters = [
        { usbVendorId: 0xcafe },
        { usbVendorId: 0x239a },
    ];
    // Prompt user to select an Arduino Uno device.
    port = await navigator.serial.requestPort({ filters });

    await port.open({ baudRate: 115200 });

    keepReading = true;
    closedPromise = readUntilClosed();
};

let keepReading = true;
let reader;
let decoder = new TextDecoder()
let buffer = "";
const write = document.getElementById('write');
const connect = document.getElementById('connect');
const disconnect = document.getElementById('disconnect');
const read = document.getElementById('read');
disconnect.disabled = true;
connect.disabled = false;
read.disabled = true;
write.disabled = true;
async function readUntilClosed() {
    while (port.readable) {
        reader = port.readable.getReader();
        try {
            write.disabled = false;
            disconnect.disabled = false;
            read.disabled = false;
            connect.disabled = true;

            while (keepReading) {
                const { value, done } = await reader.read();
                if (done) {
                    // reader.cancel() has been called.
                    break;
                }
                // value is a Uint8Array.
                buffer += decoder.decode(value);
                let i = 0;
                for (let c of buffer) {
                    if (c == '\n') {
                        let line = buffer.slice(0, i).replace('\n', "");
                        if (line != "") {
                            readfunction(line);
                        }
                        buffer = buffer.slice(i);
                        i = 0;
                    }
                    i++;
                }
            }
        } catch (error) {
            console.log(error);
            // Handle error...
        } finally {
            // Allow the serial port to be closed later.
            reader.releaseLock();
        }
        await port.close();
        disconnect.disabled = true;
        connect.disabled = false;
        read.disabled = true;
        write.disabled = true;
    }
}

const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

document.getElementById("write").addEventListener('click', async () => {
    var pending = document.getElementById('pending').textContent.replace(/\r\n|\r/g, "\n");
    var queue = pending.split('\n');
    var encoder = new TextEncoder();
    for (var i = 0; i < queue.length; i++) {
        if (queue[i] == '') {
            continue;
        }
        const writer = port.writable.getWriter();
        var ab8 = encoder.encode(queue[i] + "\r\n");
        const data = ab8;
        writer.write(data);
        writer.releaseLock();
        await wait(50);
    }
    document.getElementById('pending').textContent = "";
    document.getElementById('allocation').textContent = "";

    if (pending.length != 0) {
        alert("write complete");
    }
});

function toHex(v) {
    return '0x' + (('00' + v.toString(16).toUpperCase()).substring(v.toString(16).length));
}

let textdata = "";
function create_senddata() {
    textdata = "M_";
    textdata += Layer_num;
    textdata += "_";
    textdata += key_num;
    textdata += "_[";
    textdata += toHex(send_data[0]); textdata += ",";
    textdata += toHex(send_data[1]); textdata += ",";
    textdata += toHex(send_data[2]); textdata += ",";
    textdata += toHex(send_data[3]); textdata += ",";
    textdata += toHex(send_data[4]); textdata += ",";
    textdata += toHex(send_data[5]); textdata += ",";
    textdata += toHex(send_data[6]);
    textdata += "]\r\n";
}

function clrearAssign() {
    document.getElementById("assign1").textContent = "";
    document.getElementById("assign2").textContent = "";
    document.getElementById("assign3").textContent = "";
    document.getElementById("assign4").textContent = "";
    document.getElementById("assign5").textContent = "";
    document.getElementById("assign6").textContent = "";
    document.getElementById("assign7").textContent = "";
    document.getElementById("assign8").textContent = "";
}

function cleanup() {
    var text = document.getElementById('pending').value.replace(/\r\n|\r/g, "\n");
    var lines = text.split('\n');
    var outArray = new Array();

    for (var i = 0; i < lines.length; i++) {
        // 空行は無視する
        if (lines[i] == '') {
            continue;
        }

        outArray.push(lines[i]);
    }
    var remove = new Array();
    for (var i = outArray.length - 1; i >= 0; i--) {
        for (var j = i - 1; j >= 0; j--) {
            if (outArray[i].slice(0, 6) == outArray[j].slice(0, 6))
                remove.push(j)
        }
    }
    new Set(remove).forEach(item => {
        outArray.splice(item, 1);
    });

    var newtext = "";
    outArray.forEach(line => {
        newtext += line;
        newtext += "\n";
    })
    document.getElementById('pending').textContent = newtext;
}

function delete_last_line() {
    var text = document.getElementById('pending').value.replace(/\r\n|\r/g, "\n");
    var lines = text.split('\n');
    var outArray = new Array();

    for (var i = 0; i < (lines.length - 2); i++) {
        if (lines[i] == '') {
            continue;
        }
        outArray.push(lines[i]);
    }

    var newtext = "";
    outArray.forEach(line => {
        newtext += line;
        newtext += "\n";
    })
    document.getElementById('pending').textContent = newtext;
    line2allocation();
}

let maxLayer = 5;
function prev() {
    Layer_num--;
    if (Layer_num < 0)
        Layer_num = maxLayer;
    radio_btns[Layer_num].checked = true;
    document.querySelector(`#layerNum`).innerHTML = `LAYER ${Layer_num}`;
    clearKeys();
    clrearAssign();
    set_assign();
}

function next() {
    Layer_num++;
    if (Layer_num > maxLayer)
        Layer_num = 0;
    radio_btns[Layer_num].checked = true;
    document.querySelector(`#layerNum`).innerHTML = `LAYER ${Layer_num}`;
    clearKeys();
    clrearAssign();
    set_assign();
}

let radio_btns = document.querySelectorAll(`input[type='radio'][name='Layer']`);

for (let target of radio_btns) {
    target.addEventListener(`change`, function () {
        document.querySelector(`#layerNum`).innerHTML = `LAYER ${target.value}`;
    });
}

async function readkeys() {
    const writer = port.writable.getWriter();
    const data = new Uint8Array([65, 95, 92, 110, 92, 114]);
    await writer.write(data);
    writer.releaseLock();
}

async function send_layer(num) {
    const writer = port.writable.getWriter();
    const data = new Uint8Array([76, 95, parseInt(num), 92, 110]);
    await writer.write(data);
    writer.releaseLock();
}

async function layerMask() {
    var state = document.querySelectorAll("input[name=LMnum]");
    bit = 0b00000000;
    if (state[0].checked)
        bit |= 0b00000001;
    if (state[1].checked)
        bit |= 0b00000010;
    if (state[2].checked)
        bit |= 0b00000100;
    if (state[3].checked)
        bit |= 0b00001000;
    if (state[4].checked)
        bit |= 0b00010000;
    if (state[5].checked)
        bit |= 0b00100000;

    const textEncoder = new TextEncoder();
    try {
        const writer = port.writable.getWriter();
        await writer.write(textEncoder.encode("MASK_" + bit.toString()));
        writer.releaseLock();
    } catch {
        alert("Please connect");
    }
}

function readfunction(messeage) {

    switch (parseInt(messeage.replace('lyr:', ''))) {
        case 0:
            document.getElementById("layer0").checked = true;
            Layer_num = 0;
            break;
        case 1:
            document.getElementById("layer1").checked = true;
            Layer_num = 1;
            break;
        case 2:
            document.getElementById("layer2").checked = true;
            Layer_num = 2;
            break;
        case 3:
            document.getElementById("layer3").checked = true;
            Layer_num = 3;
            break;
        case 4:
            document.getElementById("layer4").checked = true;
            Layer_num = 4;
            break;
        case 5:
            document.getElementById("layer5").checked = true;
            Layer_num = 5;
            break;
    }

    document.querySelector(`#layerNum`).innerHTML = `LAYER ${Layer_num}`;

    switch (parseInt(messeage.replace('kys:', ''))) {
        case 1:
            document.getElementById("key1").checked = true;
            key_num = 0;
            break;
        case 2:
            document.getElementById("key2").checked = true;
            key_num = 1;
            break;
        case 4:
            document.getElementById("key3").checked = true;
            key_num = 2;
            break;
        case 8:
            document.getElementById("key4").checked = true;
            key_num = 3;
            break;
        case 16:
            document.getElementById("key5").checked = true;
            key_num = 4;
            break;
        case 32:
            document.getElementById("key6").checked = true;
            key_num = 5;
            break;
    }

    if (messeage.toString().indexOf("enc:+") !== -1) {
        document.getElementById("keyR").checked = true;
        key_num = 6;
    }

    if (messeage.toString().indexOf("enc:-") !== -1) {
        document.getElementById("keyL").checked = true;
        key_num = 7;
    }

    if (messeage[0] == 'A') {
        messeage = messeage.slice(1, messeage.length);
        let split = messeage.split(" ");
        let num = parseInt(split[0]);
        let Layer_num = parseInt(num / 10);
        let keys = num % 10;
        let mod = parseInt(split[2]);
        let code = parseInt(split[3]);
        let con = parseInt(split[4]);
        key_assign[Layer_num][keys] = mod2str(mod) + code2str(mod, code, con);
    }

    clearKeys();
    console.log(messeage);
    set_assign();
}

let key_assign =
    [['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],];

function mod2str(mod) {
    let str = "";
    if (mod & 0b00000001)
        str += "LCtrl ";
    if (mod & 0b00000010)
        str += "LShift ";
    if (mod & 0b00000100)
        str += "LAlt ";
    if (mod & 0b00001000)
        str += "LGUI ";
    if (mod & 0b00010000)
        str += "RCtrl ";
    if (mod & 0b00100000)
        str += "RShift ";
    if (mod & 0b01000000)
        str += "RAlt ";
    if (mod & 0b10000000)
        str += "RGUI ";
    return str;
}

function code2str(mod, code, con) {
    if (4 <= code && code <= 29)
        return String.fromCharCode(code + 61);

    if (30 <= code && code <= 38)
        return String.fromCharCode(code + 19);

    if (code == 39)
        return 0;

    switch (code) {
        case 0:
            if (!mod)
                return "Blank ";
            return "";

        case 40:
            return "Enter ";

        case 41:
            return "Esc ";

        case 42:
            return "Back ";

        case 43:
            return "Tab ";

        case 44:
            return "Space ";

        case 45:
            return "- ";

        case 46:
            return "^ ";

        case 47:
            return "@ ";

        case 48:
            return "[ ";

        case 135:
            return "_ ";

        case 136:
            return "カタカナ ";

        case 137:
            return "¥ ";

        case 138:
            return "変換 ";

        case 139:
            return "無変換 ";

        case 50:
            return "] ";

        case 51:
            return "; ";

        case 52:
            return ": ";

        case 53:
            return "半角/ ";

        case 54:
            return ", ";

        case 55:
            return ". ";

        case 56:
            return "/ ";

        case 57:
            return "Caps ";

        case 70:
            return "PrtSc ";

        case 71:
            return "ScrLk ";

        case 72:
            return "Pause ";

        case 73:
            return "Ins ";

        case 74:
            return "Home ";

        case 75:
            return "PgUp ";

        case 76:
            return "Delete ";

        case 77:
            return "End ";

        case 78:
            return "PgDn ";

        case 79:
            return "Right ";

        case 80:
            return "Left ";

        case 81:
            return "Down ";

        case 82:
            return "Up ";

        case 83:
            return "Num ";

        case 84:
            return "Pad/ ";

        case 85:
            return "Pad* ";

        case 86:
            return "Pad- ";

        case 87:
            return "Pad+ ";

        case 88:
            return "P-Enter ";
    }

    if (58 <= code && code <= 69)
        return "F" + (code - 57);

    if (89 <= code && code <= 97)
        return "Pad" + String.fromCharCode(code - 40);

    if (code == 98)
        return "Pad" + 0;

    if (code == 99)
        return "Pad.";
    if (code == 101)
        return "Menu";

    if (code == 255) {
        switch (con) {
            case 111:
                return "Bri+ ";

            case 112:
                return "Bri- ";

            case 181:
                return "Next ";

            case 182:
                return "Prev ";

            case 205:
                return "Play ";

            case 233:
                return "Vol+ ";

            case 234:
                return "Vol- ";

            case 226:
                return "Mute ";
        }
    }
}

function line2allocation() {
    var all = document.getElementById("allocation");
    var lines = document.getElementById('pending').textContent.split('\n');

    all.textContent = "";
    for (let line of lines) {
        if (line.length > 41) {

            var code = parseInt(line.slice(12, 17), 16);
            var mod = parseInt(line.slice(7, 11), 16);
            var con = parseInt(line.slice(17, 21), 16);

            if (mod)
                all.textContent += mod2str(mod);
            if ((code == 0 && mod == 0) || code || con)
                all.textContent += code2str(mod, code, con)


        }
        all.textContent += "\n";
    }
    let sl;
    let index = 0;
    for (let i = all.textContent.length - 3; i > 0; i--) {
        if (all.textContent[i] == "\n") {
            index = i;
            break;
        }
    }

    if (index)
        sl = all.textContent.slice(index, all.textContent.length);
    else
        sl = all.textContent.slice(0, all.textContent.length);

    let key_triggers = document.querySelectorAll("input[name=trigger]:checked");
    let mod_triggers = document.querySelectorAll("input[name=modtrigger]:checked");
    let con_triggers = document.querySelectorAll("input[name=contrigger]:checked");

    if (key_triggers.length == 0 && mod_triggers.length == 0 && con_triggers.length == 0)
        sl = "";

    key_assign[Layer_num][key_num] = sl.replace(/\r?\n/g, '');
    set_assign();
}

function set_assign() {
    document.getElementById("assign1").textContent = key_assign[Layer_num][0];
    document.getElementById("assign2").textContent = key_assign[Layer_num][1];
    document.getElementById("assign3").textContent = key_assign[Layer_num][2];
    document.getElementById("assign4").textContent = key_assign[Layer_num][3];
    document.getElementById("assign5").textContent = key_assign[Layer_num][4];
    document.getElementById("assign6").textContent = key_assign[Layer_num][5];
    document.getElementById("assign7").textContent = key_assign[Layer_num][6];
    document.getElementById("assign8").textContent = key_assign[Layer_num][7];
}

function us() {
    let us = document.querySelectorAll("label[class=us]");
    for (label of us) {
        label.style.display = "block"
    }
    let jis = document.querySelectorAll("label[class=jis]");
    for (label of jis) {
        label.style.display = "none"
    }
}

function jis() {
    let jis = document.querySelectorAll("label[class=jis]");
    for (label of jis) {
        label.style.display = "block"
    }
    let us = document.querySelectorAll("label[class=us]");
    for (label of us) {
        label.style.display = "none"
    }
}