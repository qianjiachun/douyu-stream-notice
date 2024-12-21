import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getRoomTitle(rid) {
  // 获取直播间标题
  return new Promise((resolve, reject) => {
    axios
      .get(`https://www.douyu.com/betard/${rid}`)
      .then(res => {
        if (!res.data) return resolve("");
        resolve(res.data.room.room_name);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function sendQQGroupMessage(options) {
  // 发送qq群消息，atAll为true时，会在最后艾特全体
  const { groupId, text, atAll } = options;
  const data = {
    group_id: groupId,
    message: [
      {
        type: "text",
        data: {
          text: `${text}${atAll ? " " : ""}`
        }
      },
      ...(atAll
        ? [
            {
              type: "at",
              data: {
                qq: "all"
              }
            }
          ]
        : [])
    ]
  };
  // 拼接api的url，自动识别最后有没有/
  const apiUrl = process.env.API_URL_QQ.replace(/\/$/, "");
  
  return new Promise((resolve, reject) => {
    axios
      .post(`${apiUrl}/send_group_msg`, data)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}
