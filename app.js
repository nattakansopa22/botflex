require('dotenv').config();
const request = require('request');
const express = require('express');
const port = process.env.PORT || 4000;
const _ = require('lodash');const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());// STATUS LED
let status = [false, false];
// TOPIC
const LED_TOPIC = `/Car`;// Create a MQTT Client
const mqtt = require('mqtt');
// Create a client connection to CloudMQTT for live data
const client = mqtt.connect('mqtt://hairdresser.cloudmqtt.com',  // Server MQTT ของเรานะ
{
  username: 'qtjwedau', // Username MQTT ของเรานะ
  password: 'pSYbwv9cIIWS', // Password MQTT ของเรานะ
  port: 16093 // Port MQTT ของเรานะ
});client.on('connect', function() { 
  // When connected
  console.log("Connected to CloudMQTT");client.subscribe('/Car', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
      switch(topic) {
        case LED_TOPIC:
          messageFromBuffer = message.toString('utf8');
          if (messageFromBuffer != 'GET') {
            const splitStatus = messageFromBuffer.split(',');
            if (splitStatus.length > 0) {
              splitStatus.map((ele, index)=> {
                console.log(`DOIT ${ele} ${index} ${parseInt(ele)}`);
                if (ele == 0) {
                  status[index] = false;
                } else {
                  status[index] = true;
                }
              });
            }
          }console.log(`Received '${message}' on '${topic}`);
        break;
        default:
          console.log(`Unknow Topic group`);
      }
    });
  });
});app.post('/webhook', async (req, res) => {const message = req.body.events[0].message.text;
  const reply_token = req.body.events[0].replyToken;
  const TOKEN = `PrEXTPeWFFBKhqPxCjRz1+tKJ76bSTmkKkzVE3UwSBcMedaupGVzEWZGffy/j6iUanH2mt+jri8nLCtOgX8QTZCRD7fmo1QIIIwZ0ikCt7bwbUx6pm7GPxPQt8UNFKbuqEZfp364rzhmKQvRZVgsFAdB04t89/1O/w1cDnyilFU=`; // Token ที่ได้จาก Channel access token
  const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  };

  if (message == 'บิดกุญแจ Scoopy I' || message == 'หยุดรถ Scoopy I') {
    if (message == 'บิดกุญแจ Scoopy I') {
      await mqttMessage(LED_TOPIC, 'LEDON_ONE');
    } else {
      await mqttMessage(LED_TOPIC, 'LEDOFF_ONE');
    }
  }
  if (message == 'กำลังสตาร์ทรถ' || message == 'สตาร์ทรถ') {
    if (message == 'กำลังสตาร์ทรถ') {
      await mqttMessage(LED_TOPIC, 'LEDON_TWO');
    } else {
      await mqttMessage(LED_TOPIC, 'LEDOFF_TWO');
    }
  }
  mqttMessage(LED_TOPIC, 'GET');if (message == 'สถานะทั้งหมด') {
    await checkStatus();
  } else {
    await checkStatus();
  }console.log(status);
  const objectMessage = genFlexMessage(status[0], status[1]);const body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      objectMessage
    ]
  });request({
    method: `POST`,
    url: 'https://api.line.me/v2/bot/message/reply',
    headers: HEADERS,
    body: body
  });res.sendStatus(200);
});let mqttMessage = async (topic, message) => {
  client.publish(topic, message);
  await checkStatus();
}
let checkStatus = async () => {
  await new Promise(done => setTimeout(done, 3000));
}
let genFlexMessage = (ledOne, ledTwo) => {

  return {
    "type": "flex",
    "altText": "สถานะของรถ",
    "contents": {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "https://www.aphonda.co.th/honda2017/uploads/product_gallery_big/photos/shares/Product_List/Automatic/scoopyi2018/color/Scoopy_i_Matt_Black_colorchart_620x350_px.jpg",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "action": {
          "type": "uri",
          "label": "Line",
          "uri": "https://linecorp.com/"
        }
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "สถานะของรถ",
            "flex": 0,
            "size": "xl",
            "weight": "bold"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "flex": 1,
            "margin": "md",
            "contents": [
              {
                "type": "text",
                "text": "Scoopy i",
                "align": "start",
                "gravity": "top",
                "weight": "bold"
              },
              {
                "type": "text",
                "text": (ledOne == false) ? "Start" : "Stop",
                "align": "start",
                "weight": "bold",
                "color": (ledOne == false) ? "#FF0000" : "#000000",
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "flex": 1,
            "margin": "md",
            "contents": [
              {
                "type": "text",
                "text": "สถานะรถขณะนี้",
                "align": "start",
                "gravity": "top",
                "weight": "bold"
              },
              {
                "type": "text",
                "text": (ledOne == false) ? "รถทำงานอยู่" : "รถหยุดอยู่",
                "align": "start",
                "weight": "bold",
                "color": (ledOne == false) ? "#FF0000" : "#000000",
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "flex": 0,
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": `${(ledOne == false) ? "หยุดรถ" : "บิดกุญแจ"}Scoopy I`,
              "text": `${(ledOne == false) ? "หยุดรถ" : "บิดกุญแจ"} Scoopy I`
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": `${(ledOne == false) ? "กำลังสตาร์ทรถ" : "สตาร์ทรถ"}`,
              "text": `${(ledTwo == false) ? "กำลังสตาร์ทรถ" : "สตาร์ทรถ"}`
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "Map" ,
              "text":  "Map" 
            },
            "height": "sm",
            "style": "link"
          },
          {
            "type": "spacer",
            "size": "sm"
          }
        ]
      }
    }
  };
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
