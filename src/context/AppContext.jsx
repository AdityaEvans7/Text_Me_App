import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [chatsData, setChatsData] = useState([]); 
  const [messageId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null); 

  // Load user data and navigate to the appropriate page
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserData(userData);

        if (userData.avatar && userData.name) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }

        // Update user's last seen
        await updateDoc(userRef, {
          lastSeen: Date.now(),
        });

        // Update last seen every 60 seconds
        setInterval(async () => {
          if (auth.currentUser) {
            await updateDoc(userRef, {
              lastSeen: Date.now(),
            });
          }
        }, 60000);
      } else {
        navigate("/");
        console.error("User not found");
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  // Load chat data for the user
  useEffect(() => {
    if (userData) {
      console.log("UserData loaded: ", userData);
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        if (res.exists()) {
          const chatItems = res.data().chatsData;
          const tempData = [];

          for (const item of chatItems) {
            try {
              const userRef = doc(db, "users", item.rId);
              const userSnap = await getDoc(userRef);
              const userData = userSnap.data();

              if (userData) {
                tempData.push({
                  ...item, 
                  userData,
                });
              }
            } catch (err) {
              console.error("Error fetching user data for chat:", err);
            }
          }

          setChatsData(tempData.sort((a, b) => b.updateAt - a.updateAt));
        } else {
          console.log("No chat data found for user.");
        }
      });

      return () => {
        unSub();
      };
    }
  }, [userData]);

  // Function to handle chat selection
  const handleChatSelect = (chat) => {
    setMessagesId(chat.messageId);  // Assuming chat object has messageId
    setChatUser(chat.userData);     // Assuming chat object has userData
  };

  const value = {
    userData,
    setUserData,
    chatsData,
    setChatsData,
    loadUserData,
    messages, setMessages,
    messageId, setMessagesId,
    chatUser, setChatUser,
    handleChatSelect, // Added this to expose the chat selection function
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;
