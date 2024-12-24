import { getRoomTitle, sendQQGroupMessage, getPocketList } from "./apis/index.js";
import { Ex_WebSocket_UnLogin } from "./utils/libs/websocket.js";
import { getStrMiddle } from "./utils/index.js";
import fs from "fs";

const wsList = [];
const options = [
  {
    rid: "4042402",
    content: "开播了！",
    qq: {
      // Q群
      groupIds: ["600072388"]
    }
  },
  {
    rid: "5132174",
    content: "来了来了！",
    qq: {
      groupIds: ["795483296"]
    }
  }
];
const lastNoticeTimeMap = getLocalLastNoticeTime(); // 上一次通知时间
const noticeInterval = 6 * 3600000; // 6小时

async function main() {
  for (const item of options) {
    const ws = new Ex_WebSocket_UnLogin(item.rid, async (msg) => {
      const type = getStrMiddle(msg, "type@=", "/");
      if (type !== "rss") return;
      const rid = getStrMiddle(msg, "rid@=", "/");
      const ss = getStrMiddle(msg, "ss@=", "/");
      const ivl = getStrMiddle(msg, "ivl@=", "/"); // ivl为1则表示是轮播内容
      console.log("【开播消息】", item.rid, msg);
      if (ss == "1" && ivl == "0") {
        // 开播了
        // 获取上次通知时间，如果时间间隔小于noticeInterval，则不通知
        const lastNoticeTime = lastNoticeTimeMap[rid];
        if (lastNoticeTime && new Date().getTime() - lastNoticeTime < noticeInterval) return;
        const title = await getRoomTitle(rid);
        const pocketList = await getPocketList(rid);

        let pocketText = pocketList.filter(pocket => !pocket.name.includes("流量")).map(item => item.name).join("、");

        for (const groupId of item.qq.groupIds) {
          const ret = await sendQQGroupMessage({
            groupId: groupId,
            text: `${item.content}${title}${pocketText !== "" ? "\n\n当前生效道具：" : ""}${pocketText}`,
            atAll: true
          }).catch(err => console.log(err));
          console.log("【通知结果】", ret);
        }

        // 保存最后通知时间
        saveLastNoticeTime(rid, new Date().getTime());
      }
    });
    wsList.push(ws);
    console.log("【开始监控】", item.rid);
  }
}

function saveLastNoticeTime(rid, time) {
  lastNoticeTimeMap[String(rid)] = time;
  fs.writeFileSync("./lastNoticeTime.json", JSON.stringify(lastNoticeTimeMap));
}

function getLocalLastNoticeTime() {
  let localData = null;
  try {
    localData = fs.readFileSync("./lastNoticeTime.json");
  } catch (error) {
  }
  if (!localData) return {};
  return JSON.parse(localData.toString());
}

main();
