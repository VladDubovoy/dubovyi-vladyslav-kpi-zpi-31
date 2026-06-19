import { CircleUser, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { apiBase, request } from "../api/client";
import { useAuth } from "../store/auth";

export function ChatPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socket = useMemo(
    () => (token ? io(apiBase.replace("/api", ""), { auth: { token } }) : null),
    [token],
  );

  useEffect(() => {
    if (!user?._id) {
      setUsers([]);
      setActive(null);
      setMessages([]);
      return;
    }
    request("/chat/users")
      .then((response) => setUsers(response.users || []))
      .catch((error) => {
        console.error("Failed to load chat users:", error);
        setUsers([]);
      });
  }, [user?._id]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (message) => {
      setMessages((prev) =>
        active &&
        (message.sender._id === active._id ||
          message.receiver._id === active._id)
          ? [...prev, message]
          : prev,
      );
    });

    return () => socket.disconnect();
  }, [socket, active]);

  async function openChat(targetUser) {
    setActive(targetUser);
    const response = await request(`/chat/messages/${targetUser._id}`);
    setMessages(response.messages);
  }

  async function sendMessage() {
    if (!text.trim() || !active) return;

    const message = await request(`/chat/messages/${active._id}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    setMessages((prev) => [...prev, message]);
    setText("");
  }

  return (
    <main>
      <h1>
        <MessageSquare /> Чат користувачів
      </h1>
      <section className="chat glass">
        <aside>
          {users.map((item) => (
            <button
              className={active?._id === item._id ? "active" : ""}
              key={item._id}
              onClick={() => openChat(item)}
            >
              <CircleUser size={18} /> {item.name}
            </button>
          ))}
        </aside>

        <div className="chat-box">
          {!active ? (
            <p>Оберіть користувача для переписки.</p>
          ) : (
            <>
              <h3>{active.name}</h3>
              <div className="messages">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender._id === user._id ? "mine msg" : "msg"
                    }
                  >
                    {message.text}
                  </div>
                ))}
              </div>

              <div className="comment">
                <input
                  id="chat-message-input"
                  name="message"
                  type="text"
                  autoComplete="off"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Повідомлення..."
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendMessage();
                  }}
                />
                <button onClick={sendMessage}>Надіслати</button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
