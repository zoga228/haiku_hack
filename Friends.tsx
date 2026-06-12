import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, MessageSquare, Send, ShoppingBag, Home, User, MoreVertical, X } from "lucide-react";
import { useLocation } from "wouter";

// Mock data for friends and messages to ensure stability
const MOCK_FRIENDS = [
  { id: "1", name: "Александр", email: "alex@example.com", avatar: "А", lastMessage: "Привет! Видел новый гаджет в Coins?", online: true },
  { id: "2", name: "Мария", email: "mary@example.com", avatar: "М", lastMessage: "Давай закажем вместе, так дешевле!", online: false },
  { id: "3", name: "Дмитрий", email: "dima@example.com", avatar: "Д", lastMessage: "Групповой заказ создан", online: true },
];

const MOCK_MESSAGES: Record<string, any[]> = {
  "1": [
    { id: "m1", sender: "1", content: "Привет! Видел новый гаджет в Coins?", time: "10:30" },
    { id: "m2", sender: "me", content: "Да, выглядит круто!", time: "10:32" },
  ],
  "2": [
    { id: "m3", sender: "2", content: "Давай закажем вместе, так дешевле!", time: "09:15" },
    { id: "m4", sender: "2", type: "collective_purchase", product: { name: "Умная колонка", price: "4990", discount: "30%", image: "https://images.pexels.com/photos/3585088/pexels-photo-3585088.jpeg" }, time: "09:16" },
  ],
  "3": [
    { id: "m5", sender: "3", content: "Групповой заказ создан", time: "Вчера" },
  ]
};

export default function FriendsPage() {
  const [, setLocation] = useLocation();
  const [selectedFriend, setSelectedFriend] = useState<any>(MOCK_FRIENDS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedFriend, messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedFriend) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: "me",
      content: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMessage]
    }));
    setInputValue("");
  };

  if (!isLoaded) return <div className="fixed inset-0 bg-sky-50 flex items-center justify-center text-sky-600 font-bold">Загрузка чатов...</div>;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar - Friends List */}
      <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="p-2 hover:bg-gray-100 rounded-full transition">
            <Home className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-800">Друзья</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <UserPlus className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск друзей..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MOCK_FRIENDS.map(friend => (
            <div 
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition ${selectedFriend?.id === friend.id ? "bg-white border-r-4 border-blue-500 shadow-sm" : "hover:bg-gray-100"}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {friend.avatar}
                </div>
                {friend.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{friend.name}</h3>
                </div>
                <p className="text-xs text-gray-500 truncate">{friend.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {selectedFriend.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{selectedFriend.name}</h3>
                  <p className="text-[10px] text-green-500 font-medium">{selectedFriend.online ? "В сети" : "Был недавно"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {messages[selectedFriend.id]?.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  {msg.type === "collective_purchase" ? (
                    <div className="max-w-xs w-full bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                      <div className="bg-blue-600 p-3 flex items-center justify-between">
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">Групповой заказ</span>
                        <span className="bg-white text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">-{msg.product.discount}</span>
                      </div>
                      <img src={msg.product.image} className="w-full h-32 object-cover" alt="" />
                      <div className="p-4">
                        <h4 className="font-bold text-gray-800 text-sm mb-1">{msg.product.name}</h4>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-blue-600 font-black text-lg">{msg.product.price} ₽</span>
                          <span className="text-gray-400 text-xs line-through">7120 ₽</span>
                        </div>
                        <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-blue-700 transition active:scale-95">
                          Присоединиться
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === "me" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"}`}>
                      {msg.content}
                      <div className={`text-[9px] mt-1 ${msg.sender === "me" ? "text-blue-100 text-right" : "text-gray-400"}`}>
                        {msg.time}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2">
                <button className="text-gray-400 hover:text-blue-600 transition">
                  <ShoppingBag className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Напишите сообщение..." 
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
                />
                <button 
                  onClick={handleSendMessage}
                  className={`p-2 rounded-full transition ${inputValue.trim() ? "bg-blue-600 text-white shadow-md" : "text-gray-300"}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="font-bold text-gray-800 mb-1">Выберите чат</h3>
            <p className="text-sm max-w-xs">Общайтесь с друзьями и совершайте выгодные коллективные покупки</p>
          </div>
        )}
      </div>
    </div>
  );
}
