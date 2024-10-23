import React, { useContext, useEffect, useState } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Import Firestore Timestamp
import { toast } from 'react-toastify';
import { Timestamp } from 'firebase/firestore';
import upload from '../../lib/upload';

const ChatBox = () => {
  const { userData, messageId, chatUser, messages, setMessages } = useContext(AppContext);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messageId) {
        console.log("Sending message:", input);
        // Storing message with Firestore Timestamp
        await updateDoc(doc(db, 'messages', messageId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: Timestamp.now(),  // Store Firestore Timestamp
          }),
        });
        console.log("Message sent successfully.");
  
        const userIds = [chatUser.rId, userData.id];
        userIds.forEach(async (id) => {
          console.log("Updating chats for user:", id);
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
  
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messageId);
            console.log("Chat index found:", chatIndex);
  
            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
              userChatData.chatsData[chatIndex].updatedAt = Date.now();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData,
              });
              console.log("Chat updated for user:", id);
            }
          }
        });
  
        setInput(""); // Clear the input field
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message: " + error.message);
    }
  };

  const sendImage = async (e) =>{
    try {
      const fileUrl = await upload(e.target.files[0]); 
      if (fileUrl && messageId){
        await updateDoc(doc(db, 'messages', messageId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: Timestamp.now(),  // Store Firestore Timestamp
          }),
        });
        const userIds = [chatUser.rId, userData.id];
        userIds.forEach(async (id) => {
          console.log("Updating chats for user:", id);
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
  
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messageId);
            console.log("Chat index found:", chatIndex);
  
            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = "image";
              userChatData.chatsData[chatIndex].updatedAt = Date.now();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }
              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData,
              });
              console.log("Chat updated for user:", id);
            }
          }
        });
  
       // setInput(""); // Clear the input field
      

      }
    } catch (error) {
      toast.error(error.message);
      
    }
  }

  const convertTimeStamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      let date = timestamp.toDate();  // Convert Firestore Timestamp to JS Date
      const hour = date.getHours();
      const minute = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
      if (hour > 12) {
        return (hour - 12) + ":" + minute + " PM";
      } else if (hour === 12) {
        return hour + ":" + minute + " PM";
      } else if (hour === 0) {
        return "12:" + minute + " AM";  // Midnight case
      } else {
        return hour + ":" + minute + " AM";
      }
    } else {
      return "Invalid Date"; // Fallback for invalid timestamps
    }
  };

  // useEffect to listen to changes in the messages based on messageId
  useEffect(() => {
    console.log("Messages ID: ", messageId);
    console.log("Chat User: ", chatUser);

    if (messageId) {
      const unSub = onSnapshot(doc(db, 'messages', messageId), (res) => {
        if (res.exists()) {
          const newMessages = [...res.data().messages].reverse();
          setMessages(newMessages);
          console.log("Messages:", newMessages);
        } else {
          console.log("No messages found.");
        }
      });

      return () => unSub(); // Cleanup the listener on unmount
    }
  }, [messageId, setMessages]);

  return chatUser ? (
    <div className="chat-box">
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="" />: null}</p>
        <img src={assets.help_icon} className="help" alt="" />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg['image']
            ? <img className="msg-img" src={msg.image} alt="" />
            :<p className="msg">{msg.text}</p>
          }
            
            <div>
              <img src={msg.sId === userData.id ? userData.avatar : chatUser?.userData?.avatar} alt="" />
              <p>{msg.createdAt ? convertTimeStamp(msg.createdAt) : "Unknown Time"}</p> {/* Handle missing createdAt */}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input 
          onChange={(e) => setInput(e.target.value)} 
          value={input} 
          type="text" 
          placeholder="Send a message" 
        />
        <input onChange={sendImage} type="file" id="image" accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.logo_ss} alt="" />
      <p>Text anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
