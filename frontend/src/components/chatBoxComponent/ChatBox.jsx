
// import React, { useState, useEffect, useRef } from "react";
// import "./ChatBox.css";
// import imageSend from "../../images/send.png";
// import imageChatbot from "../../images/chat-bot.png";
// import axios from "axios";
// import Fuse from "fuse.js";
// import stringSimilarity from "string-similarity";

// // 🔹 Hàm loại bỏ dấu tiếng Việt
// const removeVietnameseTones = (str) => {
//   return str
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/đ/g, "d")
//     .replace(/Đ/g, "D")
//     .toLowerCase();
// };

// // 🔹 Từ vô nghĩa thường gặp trong hội thoại
// const fillerWords = [
//   "mày", "nói", "nghe", "coi", "vậy", "bot", "đi", "cho", "t", "tao",
//   "biết", "coi", "xem", "với", "và", "ơi", "cái", "gì", "vậy", "đó"
// ];

// // 🔹 Chuẩn hóa câu nhập
// const cleanSentence = (str) => {
//   let normalized = removeVietnameseTones(str);
//   const words = normalized.split(/\s+/).filter((w) => !fillerWords.includes(w));
//   return words.join(" ");
// };

// // 🔹 Hàm tìm câu trả lời bằng fuzzy matching nâng cao
// const findTrainedAnswer = (message, trainingData) => {
//   if (!message) return null;

//   const userMsg = cleanSentence(message);

//   // Gom tất cả câu hỏi trong trainingData
//   const allQuestions = trainingData.flatMap((item) =>
//     item.question.map((q) => ({
//       question: cleanSentence(q),
//       answer: item.answer,
//     }))
//   );

//   // 1️⃣ So khớp bằng string-similarity (mạnh hơn Fuse khi chuỗi ngắn)
//   const bestMatch = stringSimilarity.findBestMatch(
//     userMsg,
//     allQuestions.map((q) => q.question)
//   );

//   const bestScore = bestMatch.bestMatch.rating;
//   const bestAnswer = allQuestions[bestMatch.bestMatchIndex]?.answer;

//   if (bestScore > 0.35) {
//     return bestAnswer;
//   }

//   // 2️⃣ Nếu không đủ gần, fallback sang Fuse (tốt khi chuỗi dài)
//   const fuse = new Fuse(allQuestions, {
//     includeScore: true,
//     threshold: 0.6,
//     distance: 100,
//     keys: ["question"],
//   });

//   const fuseResult = fuse.search(userMsg);
//   if (fuseResult.length > 0 && fuseResult[0].score <= 0.6) {
//     return fuseResult[0].item.answer;
//   }

//   return null;
// };

// const ChatBot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [userMessage, setUserMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatBodyRef = useRef(null);

//   const userId = "68e7313a4e30d6bb62f03934";
//   const API_URL = "http://localhost:8088/api/chat";

//   // === Training data nội bộ ===
//   const trainingData = [
//     { question: ["xin chào", "hello", "hi", "chào bot"], answer: "Chào bạn! Rất vui được nói chuyện với bạn 😊" },
//     { question: ["bạn là ai", "m là ai", "bạn tên gì"], answer: "Tôi là UTE Shop Chatbot, trợ lý ảo giúp bạn tìm hiểu sản phẩm 💬" },
//     { question: ["shop ở đâu", "địa chỉ shop", "ở đâu"], answer: "Shop chúng tôi hiện có địa chỉ tại 01 Võ Văn Ngân, Thủ Đức, TP.HCM." },
//     { question: ["giờ mở cửa", "thời gian làm việc", "mở cửa khi nào"], answer: "Shop mở cửa từ 8:00 sáng đến 21:00 tối mỗi ngày." },
//     { question: ["tư vấn", "cần tư vấn", "hỗ trợ"], answer: "Bạn cần tư vấn sản phẩm gì ạ? Tôi có thể giúp bạn tìm thông tin nhanh nhất!" },
//   ];

//   // Thêm tin nhắn vào giao diện ngay lập tức
//   const appendLocalMessage = (role, content, dateIso) => {
//     setMessages((prev) => [
//       ...prev,
//       { role, content, date: dateIso || new Date().toISOString() },
//     ]);
//   };

//   // === Gửi tin nhắn ===
//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!userMessage.trim()) return;

//     const userMsg = userMessage.trim();
//     appendLocalMessage("user", userMsg);
//     setUserMessage("");
//     setLoading(true);

//     try {
//       const trainedAnswer = findTrainedAnswer(userMsg, trainingData);

//       // 1️⃣ Nếu có trong trainingData → không gọi AI
//       if (trainedAnswer) {
//         await axios.post(`${API_URL}/save-message`, {
//           userId,
//           message: userMsg,
//           role: "user",
//         });

//         appendLocalMessage("bot", trainedAnswer);

//         await axios.post(`${API_URL}/save-message`, {
//           userId,
//           message: trainedAnswer,
//           role: "chatbot",
//         });

//         setLoading(false);
//         return;
//       }

//       // 2️⃣ Nếu không có trong trainingData → gọi Gemini qua backend
//       const resp = await axios.post(`${API_URL}/send-message`, {
//         userId,
//         message: userMsg,
//       });

//       const { botMessage } = resp.data;
//       const botText = botMessage?.comment || "Xin lỗi, tôi chưa hiểu câu hỏi của bạn 🤔";
//       const botDate = botMessage?.createdAt || new Date().toISOString();

//       appendLocalMessage("bot", botText, botDate);
//     } catch (err) {
//       console.error("Error in sendMessage:", err);
//       appendLocalMessage("bot", "Xin lỗi, hệ thống đang gặp lỗi. Vui lòng thử lại sau.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // === Lấy lịch sử chat ===
//   useEffect(() => {
//     const fetchChatHistory = async () => {
//       try {
//         const r = await axios.get(`${API_URL}/history/${userId}`);
//         const history = r.data.map((msg) => ({
//           content: msg.comment || "",
//           role: msg.role?.toLowerCase() === "user" ? "user" : "bot",
//           date: msg.createdAt || msg.date,
//         }));
//         setMessages(history);
//       } catch (e) {
//         console.error("Fetch history error:", e);
//       }
//     };
//     fetchChatHistory();
//   }, [userId]);

//   // === Tự động cuộn khi có tin nhắn mới ===
//   useEffect(() => {
//     if (chatBodyRef.current) {
//       chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
//     }
//   }, [messages]);

//   // === Định dạng thời gian ===
//   const formatTime = (isoDate) => {
//     if (!isoDate) return "";
//     const d = new Date(isoDate);
//     return `${String(d.getHours()).padStart(2, "0")}:${String(
//       d.getMinutes()
//     ).padStart(2, "0")} - ${d.toLocaleDateString("vi-VN")}`;
//   };

//   return (
//     <div className="chatbot">
//       {/* Nút bật chat */}
//       <button id="chatbot-toggler" onClick={() => setIsOpen(!isOpen)}>
//         <img
//           src={imageChatbot}
//           alt="chatbot"
//           style={{
//             width: 80,
//             height: 80,
//             borderRadius: "50%",
//             border: "none",
//           }}
//         />
//       </button>

//       {/* Popup Chat */}
//       {isOpen && (
//         <div className="chatbot-popup">
//           <div className="chat-header">
//             <div className="chatbot-info">
//               <img src={imageChatbot} alt="bot" className="bot-avatar" />
//               <h3>UTE Shop Chatbot</h3>
//             </div>
//             <button id="close-chatbot" onClick={() => setIsOpen(false)}>
//               ✕
//             </button>
//           </div>

//           <div className="chat-body" ref={chatBodyRef}>
//             {messages.map((m, idx) => (
//               <div
//                 key={idx}
//                 className={`message ${m.role === "user" ? "user" : "bot"}`}
//               >
//                 <div className="bubble">{m.content}</div>
//                 <div className="timestamp">{formatTime(m.date)}</div>
//               </div>
//             ))}
//             {loading && <div className="thinking">Đang trả lời...</div>}
//           </div>

//           <div className="chat-footer">
//             <form onSubmit={sendMessage} className="chat-form">
//               <input
//                 value={userMessage}
//                 onChange={(e) => setUserMessage(e.target.value)}
//                 placeholder="Nhập tin nhắn..."
//               />
//               <button type="submit" disabled={loading}>
//                 <img
//                   style={{ width: 36, height: 36 }}
//                   src={imageSend}
//                   alt="send"
//                 />
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;
import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import imageSend from "../../images/send.png";
import imageChatbot from "../../images/chat-bot.png";
import axios from "axios";
import Fuse from "fuse.js";
import stringSimilarity from "string-similarity";

// 🔹 Hàm loại bỏ dấu tiếng Việt
const removeVietnameseTones = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

// 🔹 Từ vô nghĩa thường gặp
const fillerWords = ["mày", "nói", "nghe", "vậy", "bot", "đi", "cho", "tao", "biết", "xem", "với", "và", "ơi", "gì", "đó"];

// 🔹 Chuẩn hóa câu nhập
const cleanSentence = (str) => {
  const words = removeVietnameseTones(str)
    .split(/\s+/)
    .filter((w) => !fillerWords.includes(w));
  return words.join(" ");
};

// 🔹 Tìm câu trả lời trong trainingData
const findTrainedAnswer = (message, trainingData) => {
  if (!message) return null;
  const userMsg = cleanSentence(message);
  const allQuestions = trainingData.flatMap((item) =>
    item.question.map((q) => ({ question: cleanSentence(q), answer: item.answer }))
  );

  // String-similarity trước
  const bestMatch = stringSimilarity.findBestMatch(
    userMsg,
    allQuestions.map((q) => q.question)
  );
  const bestScore = bestMatch.bestMatch.rating;
  const bestAnswer = allQuestions[bestMatch.bestMatchIndex]?.answer;

  if (bestScore > 0.35) return bestAnswer;

  // Fuse fallback
  const fuse = new Fuse(allQuestions, { includeScore: true, threshold: 0.6, keys: ["question"] });
  const fuseResult = fuse.search(userMsg);
  return fuseResult.length > 0 && fuseResult[0].score <= 0.6
    ? fuseResult[0].item.answer
    : null;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // 🔹 Nếu null thì chat local
  const chatBodyRef = useRef(null);

  const api = axios.create({ baseURL: "http://localhost:8088/api/chat" });

  // Middleware thêm token nếu có
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Training data
  const trainingData = [
    { question: ["xin chào", "hello", "hi"], answer: "Chào bạn! 😊" },
    { question: ["bạn là ai", "m là ai"], answer: "Mình là UTE Shop Chatbot 💬" },
    { question: ["shop ở đâu", "địa chỉ shop"], answer: "01 Võ Văn Ngân, Thủ Đức, TP.HCM." },
    { question: ["giờ mở cửa", "làm việc khi nào"], answer: "8h sáng - 21h tối mỗi ngày." },
    { question: ["tư vấn", "hỗ trợ"], answer: "Bạn cần tư vấn sản phẩm nào ạ?" },
  ];

  // === Thêm tin nhắn vào giao diện ===
  const appendLocalMessage = (role, content) => {
    setMessages((prev) => [
      ...prev,
      { role, content, date: new Date().toISOString() },
    ]);
  };

  // === Gửi tin nhắn ===
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const userMsg = userMessage.trim();
    appendLocalMessage("user", userMsg);
    setUserMessage("");
    setLoading(true);

    try {
      const trainedAnswer = findTrainedAnswer(userMsg, trainingData);

      if (trainedAnswer) {
        appendLocalMessage("bot", trainedAnswer);

        // 🔹 Nếu có userId → lưu BE
        if (userId) {
          await api.post(`/save-message`, { userId, message: userMsg, role: "user" });
          await api.post(`/save-message`, { userId, message: trainedAnswer, role: "chatbot" });
        }
      } else {
        const fallbackText =
          "Xin lỗi, câu hỏi này hiện không nằm trong phạm vi hỗ trợ. Bạn hãy thử lại nhé! 🙏";
        appendLocalMessage("bot", fallbackText);

        if (userId) {
          await api.post(`/save-message`, { userId, message: userMsg, role: "user" });
          await api.post(`/save-message`, { userId, message: fallbackText, role: "chatbot" });
        }
      }
    } catch (err) {
      console.error("Send error:", err);
      appendLocalMessage("bot", "Xin lỗi, hệ thống gặp sự cố 😢");
    } finally {
      setLoading(false);
    }
  };

  // === Lấy lịch sử chat khi có userId ===
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/history`);
        if (res.data.userId) {
          setUserId(res.data.userId);
          const history = res.data.chatHistory.map((msg) => ({
            content: msg.comment || "",
            role: msg.role?.toLowerCase() === "user" ? "user" : "bot",
            date: msg.createdAt,
          }));
          setMessages(history);
        } else {
          console.log("⚠️ Chưa đăng nhập — chỉ chat local");
        }
      } catch (e) {
        console.error("Fetch history error:", e);
      }
    };
    fetchChatHistory();
  }, []);

  useEffect(() => {
    if (chatBodyRef.current)
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  const formatTime = (isoDate) => {
    const d = new Date(isoDate);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")} - ${d.toLocaleDateString("vi-VN")}`;
  };

  return (
    <div className="chatbot">
      {/* Nút bật chat */}
      <button id="chatbot-toggler" onClick={() => setIsOpen(!isOpen)}>
        <img
          src={imageChatbot}
          alt="chatbot"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "none",
          }}
        />
      </button>

      {/* Popup Chat */}
      {isOpen && (
        <div className="chatbot-popup">
          <div className="chat-header">
            <div className="chatbot-info">
              <img src={imageChatbot} alt="bot" className="bot-avatar" />
              <h3>UTE Shop Chatbot</h3>
            </div>
            <button id="close-chatbot" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`message ${m.role === "user" ? "user" : "bot"}`}
              >
                <div className="bubble">{m.content}</div>
                <div className="timestamp">{formatTime(m.date)}</div>
              </div>
            ))}
            {loading && <div className="thinking">Đang trả lời...</div>}
          </div>

          <div className="chat-footer">
            <form onSubmit={sendMessage} className="chat-form">
              <input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button type="submit" disabled={loading}>
                <img
                  style={{ width: 36, height: 36 }}
                  src={imageSend}
                  alt="send"
                />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
