
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



// import React, { useState, useEffect, useRef } from "react";
// import "./ChatBox.css";
// import imageSend from "../../images/send.png";
// import imageChatbot from "../../images/chat-bot.png";
// import axios from "axios";
// import Fuse from "fuse.js";
// import stringSimilarity from "string-similarity";

// // 🔹 Hàm loại bỏ dấu tiếng Việt
// const removeVietnameseTones = (str) =>
//   str
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/đ/g, "d")
//     .replace(/Đ/g, "D")
//     .toLowerCase();

// // 🔹 Từ vô nghĩa thường gặp
// const fillerWords = [
//   "mày","nói","nghe","vậy","bot","đi","cho","tao","biết","xem",
//   "với","và","ơi","gì","đó","ngoài","chỉ","thôi","hả","à","không","ko"
// ];


// // 🔹 Chuẩn hóa câu nhập
// const cleanSentence = (str) => {
//   const words = removeVietnameseTones(str)
//     .split(/\s+/)
//     .filter((w) => !fillerWords.includes(w));
//   return words.join(" ");
// };

// // 🔹 Tìm câu trả lời trong trainingData
// const findTrainedAnswer = (message, trainingData) => {
//   if (!message) return null;
//   const userMsg = cleanSentence(message);
//   const allQuestions = trainingData.flatMap((item) =>
//     item.question.map((q) => ({ question: cleanSentence(q), answer: item.answer }))
//   );

//   // String-similarity trước
//   const bestMatch = stringSimilarity.findBestMatch(
//     userMsg,
//     allQuestions.map((q) => q.question)
//   );
//   const bestScore = bestMatch.bestMatch.rating;
//   const bestAnswer = allQuestions[bestMatch.bestMatchIndex]?.answer;

//   if (bestScore > 0.6) return bestAnswer;

//   // Fuse fallback
//   const fuse = new Fuse(allQuestions, { includeScore: true, threshold: 0.4, keys: ["question"] });
//   const fuseResult = fuse.search(userMsg);
//   return fuseResult.length > 0 && fuseResult[0].score <= 0.6
//     ? fuseResult[0].item.answer
//     : null;
// };

// const ChatBot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [userMessage, setUserMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [userId, setUserId] = useState(null); // 🔹 Nếu null thì chat local
//   const chatBodyRef = useRef(null);

//   const api = axios.create({ baseURL: "http://localhost:8088/api/chat" });

//   // Middleware thêm token nếu có
//   api.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   });

// const trainingData = [
//   // 👋 Chào hỏi & giới thiệu
//   {
//     question: [
//       "xin chào",
//       "chào bạn",
//       "hello",
//       "hi",
//       "bot ơi",
//       "alo",
//       "ê bot",
//       "chào shop",
//       "có ai không",
//       "bạn khỏe không",
//       "hôm nay thế nào",
//     ],
//     answer:
//       "Chào bạn 👋 Mình là UTE Shop Chatbot — trợ lý ảo của UTE Fashion Shop! Rất vui được hỗ trợ bạn hôm nay 💬.",
//   },
//   {
//     question: [
//       "bạn là ai",
//       "bạn tên gì",
//       "m là ai",
//       "ai tạo ra bạn",
//       "bạn được làm bởi ai",
//     ],
//     answer:
//       "Mình là UTE Shop Chatbot 🤖, được phát triển bởi đội ngũ sinh viên UTE để hỗ trợ khách hàng mua sắm nhanh chóng, thân thiện và tiện lợi nhất!",
//   },
//   {
//     question: [
//       "shop là gì",
//       "shop này bán gì",
//       "shop bạn bán áo gì",
//       "shop có uy tín không",
//       "shop là cửa hàng gì",
//     ],
//     answer:
//       "UTE Fashion Shop là cửa hàng thời trang của sinh viên Trường ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE) 👕. Shop chuyên bán áo khoác, áo thun, áo sơ mi của các khoa trong trường — vừa đẹp vừa mang tinh thần UTE ❤️.",
//   },
//   {
//     question: [
//       "shop ở đâu",
//       "địa chỉ shop",
//       "shop nằm ở đâu",
//       "có chi nhánh không",
//     ],
//     answer:
//       "Shop có trụ sở chính tại 01 Võ Văn Ngân, Thủ Đức, TP.HCM 🏬. Ngoài ra, bạn có thể đặt hàng online, shop giao toàn quốc nhé 🚚.",
//   },
//   {
//     question: [
//       "giờ mở cửa",
//       "shop mở cửa lúc mấy giờ",
//       "giờ làm việc",
//       "làm việc đến mấy giờ",
//     ],
//     answer:
//       "Shop mở cửa từ 8:00 sáng đến 21:30 tối mỗi ngày, bao gồm cả thứ Bảy và Chủ nhật ⏰.",
//   },

//   // 👕 Sản phẩm & danh mục
//   {
//     question: [
//       "shop có những loại áo nào",
//       "shop có những loại sản phẩm nào",
//       "shop bán gì",
//       "shop bán những loại áo gì",
//       "có áo thun không",
//       "có áo sơ mi không",
//       "có áo khoác không",
//       "có áo khoa không",
//     ],
//     answer:
//       "Shop chuyên bán áo khoác, áo thun, áo sơ mi các khoa của trường HCMUTE như Khoa CNTT, Cơ khí, Điện – Điện tử, Ô tô, và nhiều hơn nữa 🎓.",
//   },
//   {
//     question: [
//       "áo khoa là gì",
//       "áo khoa của trường là sao",
//       "áo khoa ute là gì",
//     ],
//     answer:
//       "Áo khoa là áo đồng phục riêng của từng khoa trong Trường ĐH Sư phạm Kỹ thuật TP.HCM 💙. Mỗi khoa có thiết kế và màu sắc riêng, thể hiện cá tính sinh viên UTE.",
//   },
//   {
//     question: [
//       "áo chất liệu gì",
//       "vải áo là gì",
//       "chất liệu có bền không",
//       "áo làm bằng gì",
//       "áo có mát không",
//     ],
//     answer:
//       "Áo của shop được làm từ vải thun cotton lạnh, co giãn 4 chiều, thấm hút mồ hôi cực tốt 🌿. Áo khoác thì may bằng vải kaki nhẹ, thoáng mát, bền đẹp lâu dài.",
//   },
//   {
//     question: [
//       "áo có đủ size không",
//       "shop có size lớn không",
//       "có size nhỏ không",
//       "có size cho người mập không",
//     ],
//     answer:
//       "Shop có đủ size từ S → XXL nhé! 🧍‍♂️🧍‍♀️ Phù hợp với mọi dáng người. Nếu cần tư vấn chọn size, bạn chỉ cần gửi chiều cao và cân nặng, mình giúp chọn ngay.",
//   },
//   {
//     question: [
//       "sản phẩm nào bán chạy nhất",
//       "áo nào hot nhất",
//       "áo nào đẹp nhất",
//       "áo nào được mua nhiều nhất",
//     ],
//     answer:
//       "Các mẫu áo thun khoa và áo khoác khoa luôn là lựa chọn hot nhất 🔥 vì mang phong cách sinh viên UTE năng động, trẻ trung và tự hào khoa mình!",
//   },

//   // 💰 Giá cả & khuyến mãi
//   {
//     question: [
//       "giá bao nhiêu",
//       "giá áo thun là bao nhiêu",
//       "áo khoác giá bao nhiêu",
//       "có áo dưới 200k không",
//       "shop có khuyến mãi không",
//       "đang sale không",
//       "giảm giá chưa",
//     ],
//     answer:
//       "Giá áo thun dao động từ 150k – 300k, áo khoác từ 250k – 450k tuỳ mẫu. Shop thường có khuyến mãi mỗi tuần 🎉 và giảm 10% cho đơn đầu tiên.",
//   },
//   {
//     question: [
//       "có mã giảm giá không",
//       "nhập mã gì để giảm giá",
//       "có freeship không",
//       "phí ship bao nhiêu",
//     ],
//     answer:
//       "Hiện shop đang freeship cho đơn từ 300.000đ 🚚 và tặng mã giảm 10% cho khách hàng mới! Bạn chỉ cần nhập mã **UTESHOP10** khi thanh toán nhé 💸.",
//   },

//   // 💳 Thanh toán & giao hàng
//   {
//     question: [
//       "thanh toán như thế nào",
//       "có nhận cod không",
//       "trả tiền khi nhận hàng được không",
//       "shop có trả góp không",
//     ],
//     answer:
//       "Shop hỗ trợ thanh toán bằng MoMo, ZaloPay, chuyển khoản hoặc COD (nhận hàng rồi trả tiền) 💳. Hiện tại chưa hỗ trợ trả góp nhé!",
//   },
//   {
//     question: [
//       "giao hàng bằng gì",
//       "shop giao hàng toàn quốc không",
//       "bao lâu nhận hàng",
//       "thời gian giao hàng",
//     ],
//     answer:
//       "Shop giao toàn quốc qua Giao Hàng Nhanh và Viettel Post 🚚. TP.HCM nhận trong 1–2 ngày, các tỉnh khác 3–5 ngày làm việc.",
//   },
//   {
//     question: [
//       "được kiểm tra hàng không",
//       "xem hàng trước khi thanh toán được không",
//     ],
//     answer:
//       "Có ạ ✅ Bạn được kiểm tra hàng trước khi thanh toán với đơn COD. Nếu hàng lỗi hoặc sai mẫu, shop hỗ trợ đổi trả ngay.",
//   },

//   // 🔁 Đổi trả & bảo hành
//   {
//     question: [
//       "chính sách đổi trả",
//       "đổi hàng được không",
//       "muốn đổi size",
//       "đổi áo được không",
//     ],
//     answer:
//       "Shop hỗ trợ đổi size hoặc đổi mẫu trong vòng 7 ngày kể từ khi nhận hàng, miễn phí đổi lần đầu 🎽. Chỉ cần áo còn tag và chưa giặt là được.",
//   },
//   {
//     question: [
//       "shop có hoàn tiền không",
//       "muốn trả hàng",
//       "trả hàng hoàn tiền thế nào",
//     ],
//     answer:
//       "Shop sẽ hoàn tiền 100% nếu sản phẩm lỗi hoặc không đúng mô tả 🪙. Bạn chỉ cần liên hệ admin hoặc gửi lại hình ảnh để được hỗ trợ nhanh nhất.",
//   },

//   // 📦 Đơn hàng
//   {
//     question: [
//       "kiểm tra đơn hàng",
//       "xem đơn hàng ở đâu",
//       "đơn hàng của tôi đang ở đâu",
//     ],
//     answer:
//       "Bạn có thể xem tình trạng đơn hàng tại mục **Đơn hàng của tôi** trên website hoặc app UTE Shop 📱.",
//   },
//   {
//     question: [
//       "muốn hủy đơn",
//       "cách hủy đơn",
//       "shop ơi hủy đơn giúp tôi",
//     ],
//     answer:
//       "Nếu đơn hàng chưa xác nhận, bạn có thể hủy trực tiếp trong mục Đơn hàng của tôi hoặc nhắn admin để được hỗ trợ 💬.",
//   },

//   // 👤 Hỗ trợ & tài khoản
//   {
//     question: [
//       "quên mật khẩu",
//       "đăng nhập không được",
//       "đăng ký tài khoản sao",
//       "đổi email như thế nào",
//     ],
//     answer:
//       "Bạn có thể đăng ký nhanh bằng Google hoặc email. Nếu quên mật khẩu, nhấn 'Quên mật khẩu' trên màn hình đăng nhập để đặt lại 🔐.",
//   },
//   {
//     question: [
//       "liên hệ shop thế nào",
//       "shop có số điện thoại không",
//       "shop có fanpage không",
//       "shop có zalo không",
//     ],
//     answer:
//       "Bạn có thể liên hệ shop qua fanpage **UTE Fashion**, Zalo hoặc email: **utefashion@gmail.com** nhé 📞.",
//   },
//   {
//     question: [
//       "tư vấn giúp tôi",
//       "shop ơi hỗ trợ với",
//       "cần tư vấn chọn áo",
//       "chọn size giúp tôi",
//     ],
//     answer:
//       "Dạ có ạ 😊 Bạn cần tư vấn chọn size, mẫu áo, hay phối đồ? Gửi mình chiều cao, cân nặng hoặc sở thích nhé — mình giúp ngay!",
//   },

//   // 💡 Phong cách & phối đồ
//   {
//     question: [
//       "áo này mặc với gì hợp",
//       "phối đồ sao cho đẹp",
//       "mặc áo khoa sao cho ngầu",
//       "gợi ý phối đồ",
//     ],
//     answer:
//       "Áo khoác khoa bạn có thể phối với áo thun trắng + quần jean là chuẩn style sinh viên UTE 😎. Áo sơ mi thì hợp quần tây hoặc kaki để lịch sự hơn.",
//   },
// ];


//   // === Thêm tin nhắn vào giao diện ===
//   const appendLocalMessage = (role, content) => {
//     setMessages((prev) => [
//       ...prev,
//       { role, content, date: new Date().toISOString() },
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

//       if (trainedAnswer) {
//         appendLocalMessage("bot", trainedAnswer);

//         // 🔹 Nếu có userId → lưu BE
//         if (userId) {
//           await api.post(`/save-message`, { userId, message: userMsg, role: "user" });
//           await api.post(`/save-message`, { userId, message: trainedAnswer, role: "chatbot" });
//         }
//       } else {
//         const fallbackText =
//           "Xin lỗi, câu hỏi này hiện không nằm trong phạm vi hỗ trợ. Bạn hãy thử lại nhé! 🙏";
//         appendLocalMessage("bot", fallbackText);

//         if (userId) {
//           await api.post(`/save-message`, { userId, message: userMsg, role: "user" });
//           await api.post(`/save-message`, { userId, message: fallbackText, role: "chatbot" });
//         }
//       }
//     } catch (err) {
//       console.error("Send error:", err);
//       appendLocalMessage("bot", "Xin lỗi, hệ thống gặp sự cố 😢");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // === Lấy lịch sử chat khi có userId ===
//   useEffect(() => {
//     const fetchChatHistory = async () => {
//       try {
//         const res = await api.get(`/history`);
//         if (res.data.userId) {
//           setUserId(res.data.userId);
//           const history = res.data.chatHistory.map((msg) => ({
//             content: msg.comment || "",
//             role: msg.role?.toLowerCase() === "user" ? "user" : "bot",
//             date: msg.createdAt,
//           }));
//           setMessages(history);
//         } else {
//           console.log("⚠️ Chưa đăng nhập — chỉ chat local");
//         }
//       } catch (e) {
//         console.error("Fetch history error:", e);
//       }
//     };
//     fetchChatHistory();
//   }, []);

//   useEffect(() => {
//     if (chatBodyRef.current)
//       chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
//   }, [messages]);

//   const formatTime = (isoDate) => {
//     const d = new Date(isoDate);
//     return `${d.getHours().toString().padStart(2, "0")}:${d
//       .getMinutes()
//       .toString()
//       .padStart(2, "0")} - ${d.toLocaleDateString("vi-VN")}`;
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
import axios from "axios";
import imageSend from "../../images/send.png";
import imageChatbot from "../../images/chat-bot.png";
import "./ChatBox.css";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
   const [userId, setUserId] = useState(null); // 🔹 Nếu null thì chat local
  const chatBodyRef = useRef(null);

  const api = axios.create({ baseURL: "http://localhost:8088/api" });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const appendMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content, date: new Date().toISOString() }]);
  };

const sendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const msg = userMessage.trim();
    appendMessage("user", msg);
    setUserMessage("");
    setLoading(true);

    try {
      // Gửi kèm userId nếu có
      const body = userId ? { userId, message: msg } : { message: msg };
      const res = await api.post("/chat/send-message", body);

      const botReply = res.data?.botMsg?.comment || "Không có phản hồi từ chatbot.";
      appendMessage("bot", botReply);
    } catch (err) {
      console.error("Send error:", err);
      appendMessage("bot", "Xin lỗi, hệ thống gặp sự cố 😢");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/chat/history");
        const history = res.data.chatHistory.map((m) => ({
          content: m.comment,
          role: m.role,
          date: m.createdAt,
        }));
        setMessages(history);
        setUserId(res.data.userId);
      } catch (err) {
        console.error("Không thể tải lịch sử chat:", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (chatBodyRef.current)
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  const formatTime = (iso) => {
    const d = new Date(iso);
    return `${d.getHours()}:${d.getMinutes()} - ${d.toLocaleDateString("vi-VN")}`;
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
