
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
  return fuseResult.length > 0 && fuseResult[0].score <= 0.4
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

  const trainingData = [
  // 🏪 Giới thiệu chung
  {
    question: [
      "shop là gì",
      "shop bạn bán gì",
      "shop hoạt động ở đâu",
      "shop này bán áo gì",
      "shop này có uy tín không",
      "shop là cửa hàng gì"
    ],
    answer:
      "Chào bạn 👋 UTE Fashion Shop là cửa hàng thời trang chuyên bán áo thun, áo sơ mi, áo khoác của khoa.",
  },
  {
    question: [
      "shop ở đâu",
      "địa chỉ shop",
      "cửa hàng ở đâu",
      "shop có chi nhánh không"
    ],
    answer:
      "Hiện shop có trụ sở chính tại 01 Võ Văn Ngân, Thủ Đức, TP.HCM và giao hàng toàn quốc 🚚.",
  },
  {
    question: [
      "shop mở cửa lúc mấy giờ",
      "thời gian làm việc",
      "mở cửa khi nào",
      "giờ làm việc"
    ],
    answer:
      "Shop mở cửa từ 8:00 sáng đến 21:30 tối mỗi ngày, bao gồm cả cuối tuần.",
  },

  // 👕 Sản phẩm & danh mục
  {
    question: [
      "shop có những loại áo nào",
      "shop bán những loại áo gì",
      "có áo thun không",
      "có áo sơ mi không",
    
    ],
    answer:
      "Shop hiện bán áo thun, áo sơ mi, áo khoác cho cả nam và nữ .",
  },
  {
    question: [
      "áo có đủ size không",
      "có size nhỏ không",
      "shop có size lớn không",
      "có size cho người mập không"
    ],
    answer:
      "Dạ có ạ 😊 Shop có đủ size từ S → XXL, phù hợp cho nhiều dáng người khác nhau. Bạn có thể xem bảng size chi tiết trong trang sản phẩm.",
  },
  {
    question: [
      "áo chất liệu gì",
      "vải áo là gì",
      "áo làm bằng gì",
      "chất vải có tốt không"
    ],
    answer:
      "Các sản phẩm của shop chủ yếu được làm từ cotton, cotton lạnh và vải thun co giãn 4 chiều, thấm hút mồ hôi rất tốt 👍.",
  },


  // 💰 Giá cả & khuyến mãi
  {
    question: [
      "giá áo thun là bao nhiêu",
      "áo này giá bao nhiêu",
      "có áo dưới 200k không",
      "shop có khuyến mãi không",
      "giảm giá chưa"
    ],
    answer:
      "Giá áo thun dao động từ 150.000đ đến 350.000đ tuỳ mẫu. Shop thường có chương trình khuyến mãi mỗi tuần 🎉.",
  },
  {
    question: [
      "khi nào sale",
      "giảm giá bao nhiêu phần trăm",
      "có mã giảm giá không",
      "nhập mã gì để được giảm giá"
    ],
    answer:
      "Hiện shop đang có chương trình giảm 10% cho đơn hàng đầu tiên và freeship với đơn từ 300.000đ trở lên 🚚💸.",
  },

  // 💳 Thanh toán
  {
    question: [
     
      "thanh toán thế nào",
      "có trả tiền khi nhận hàng không",
      "shop có nhận cod không"
    ],
    answer:
      "Shop hỗ trợ thanh toán qua MoMo, ZaloPay, chuyển khoản và thanh toán khi nhận hàng (COD) nhé 💳.",
  },
  {
    question: [
      "shop có trả góp không",
      "có thể trả góp không",
      "mua trả góp được không"
    ],
    answer:
      "Hiện tại shop chưa hỗ trợ trả góp, bạn có thể thanh toán trước 100% hoặc chọn COD để nhận hàng rồi thanh toán.",
  },

  // 🚚 Giao hàng
  {
    question: [
      "shop giao hàng bằng gì",
      "giao hàng qua đơn vị nào",
      "shop có giao hàng toàn quốc không",
      "thời gian giao hàng bao lâu"
    ],
    answer:
      "Shop giao hàng toàn quốc qua Giao Hàng Nhanh và Viettel Post. TP.HCM: 1–2 ngày, tỉnh khác: 3–5 ngày.",
  },
  {
    question: [
      "phí ship bao nhiêu",
      "shop có freeship không",
      "phí vận chuyển thế nào"
    ],
    answer:
      "Miễn phí vận chuyển cho đơn từ 300.000đ. Các đơn nhỏ hơn sẽ tính phí từ 25.000đ – 35.000đ tùy khu vực 🚛.",
  },
  {
    question: [
      "có được kiểm tra hàng trước khi thanh toán không",
      "được xem hàng trước không"
    ],
    answer:
      "Có ạ 💬 Bạn được kiểm tra hàng trước khi thanh toán đối với đơn COD. Nếu sản phẩm lỗi hoặc sai, có thể đổi trả ngay.",
  },

  // 🔁 Đổi trả & bảo hành
  {
    question: [
      "chính sách đổi trả thế nào",
      "đổi hàng được không",
      "shop có nhận đổi hàng không",
      "muốn đổi size thì sao"
    ],
    answer:
      "Bạn có thể đổi hàng trong vòng 7 ngày kể từ khi nhận, nếu sản phẩm còn nguyên tag và chưa giặt. Shop hỗ trợ đổi size miễn phí 1 lần đầu tiên 👕.",
  },
  {
    question: [
      "shop có hoàn tiền không",
      "trả hàng hoàn tiền được không",
      "muốn trả hàng thì làm sao"
    ],
    answer:
      "Shop sẽ hoàn tiền 100% nếu sản phẩm lỗi hoặc không đúng mô tả. Vui lòng liên hệ admin để được hỗ trợ chi tiết 💸.",
  },

  // 📦 Đơn hàng
  {
    question: [
      "xem đơn hàng ở đâu",
      "kiểm tra đơn hàng thế nào",
      "làm sao biết đơn của tôi đang ở đâu"
    ],
    answer:
      "Bạn có thể xem đơn hàng trong mục 'Đơn hàng của tôi' trên website hoặc app UTE Fashion Shop 📱.",
  },
  {
    question: [
      "tôi muốn hủy đơn",
      "cách hủy đơn hàng",
      "shop ơi hủy đơn giúp tôi"
    ],
    answer:
      "Nếu đơn hàng chưa được xác nhận, bạn có thể hủy trực tiếp trong mục 'Đơn hàng của tôi' hoặc nhắn admin để được hỗ trợ.",
  },

  // 👤 Tài khoản & hỗ trợ
  {
    question: [
      "quên mật khẩu",
      "đăng nhập không được",
      "làm sao đổi email",
      "đăng ký tài khoản sao"
    ],
    answer:
      "Bạn có thể đăng ký tài khoản nhanh bằng email hoặc Google. Nếu quên mật khẩu, nhấn 'Quên mật khẩu' tại màn hình đăng nhập để đặt lại.",
  },
  {
    question: [
      "liên hệ với shop thế nào",
      "shop có số điện thoại không",
      "shop có fanpage không",
      "gọi điện cho shop ở đâu"
    ],
    answer:
      "Bạn có thể liên hệ shop qua fanpage Facebook UTE Fashion, email: utefashion@gmail.com hoặc chat trực tiếp tại đây 💬.",
  },
  {
    question: [
      "shop có hỗ trợ kỹ thuật không",
      "tư vấn giúp tôi",
      "shop ơi hỗ trợ với"
    ],
    answer:
      "Dạ có ạ 😊 Bạn cần tư vấn chọn size, phối đồ hay tìm sản phẩm phù hợp? Shop luôn sẵn sàng hỗ trợ!",
  },

  // ❤️ Phong cách & phối đồ
  {
    question: [
      "phối đồ sao cho đẹp",
      "áo này mặc với gì hợp",
      "gợi ý phối đồ"
    ],
    answer:
      "Với áo thun trơn, bạn có thể phối cùng quần jean hoặc short để tạo phong cách năng động. Còn áo sơ mi nên đi với quần tây để lịch sự hơn 😎.",
  },
  {
    question: [
      "áo này có phù hợp mùa hè không",
      "chất liệu mát không"
    ],
    answer:
      "Dạ, các áo thun và sơ mi của shop được làm từ cotton lạnh, rất thoáng mát, cực kỳ phù hợp cho mùa hè 🔥.",
  },
  {
    question: [
      "sản phẩm nào bán chạy ",
      "Áo nào bán chạy nhất vậy"
    ],
    answer:
      "Dạ, các áo thun của trường được bán chạy nhất ạ!",
  },
  
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
