import { WebSocket } from "ws";
/*
   DouyuEx WebSocket UnLogin
    By: 小淳
*/
class Ex_WebSocket_UnLogin {
  constructor(rid, msgHandler) {
    this.timer = null;
    this.rid = rid;
    this.msgHandler = msgHandler;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket("wss://danmuproxy.douyu.com:850" + String(getRandom(2, 5)));

    this.ws.onopen = () => {
      this.ws.send(WebSocket_Packet("type@=loginreq/roomid@=" + this.rid));
      this.ws.send(WebSocket_Packet("type@=joingroup/rid@=" + this.rid + "/gid@=-9999/"));

      if (!this.timer) {
        this.timer = setInterval(() => {
          this.ws.send(WebSocket_Packet("type@=mrkl/"));
        }, 40000);
      }
    };

    this.ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      this.reconnect();
    };

    this.ws.onmessage = (e) => {
      let str = new TextDecoder("utf-8").decode(e.data);
      let arr = String(str).split("\0"); // 分包
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].length > 12) {
            this.msgHandler(arr[i]);
          }
        }
    };

    this.ws.onclose = () => {
      this.close();
      this.reconnect();
    };
  }

  reconnect() {
    if (this.ws) this.close(); // Ensures closure before reconnecting
    setTimeout(() => {
      this.connect();
    }, 3000); // Retry after 3 seconds
  }

  close() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null; // Ensure timer reference is cleared
    }
    if (this.ws) {
      this.ws.onclose = null; // Remove onclose listener to avoid redundant calls
      this.ws.close();
      this.ws = null; // Remove reference to avoid memory leak
    }
  }
}

/*
   DouyuEx WebSocket
    By: 小淳
    Public functions
*/

function WebSocket_Packet(str) {
  const MSG_TYPE = 689;
  let bytesArr = stringToByte(str);
  let buffer = new Uint8Array(bytesArr.length + 4 + 4 + 2 + 1 + 1 + 1);
  let p_content = new Uint8Array(bytesArr.length); // Message content
  for (let i = 0; i < p_content.length; i++) {
    p_content[i] = bytesArr[i];
  }
  let p_length = new Uint32Array([bytesArr.length + 4 + 2 + 1 + 1 + 1]); // Message length
  let p_type = new Uint32Array([MSG_TYPE]); // Message type

  buffer.set(new Uint8Array(p_length.buffer), 0);
  buffer.set(new Uint8Array(p_length.buffer), 4);
  buffer.set(new Uint8Array(p_type.buffer), 8);
  buffer.set(p_content, 12);

  return buffer;
}

function stringToByte(str) {
  let bytes = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export { Ex_WebSocket_UnLogin };
