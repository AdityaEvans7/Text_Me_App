import React, { useContext, useEffect, useState } from 'react'
import './Chat.css'
import LeftSideBar from '../../components/Leftsidebar/LeftSideBar.jsx'
import ChatBox from '../../components/ChatBox/ChatBox.jsx'
import RightSideBar from '../../components/Rightsidebar/RightSideBar'
import { AppContext } from '../../context/AppContext.jsx'

const Chat = () => {

  
  const {chatsData, userData} = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if( chatsData && userData ) {
      setLoading(false)
    }

  },[chatsData,userData]);

  return (
    <div className='chat'>
      {loading?  <p className='loading'>Loading...</p> 
      :
      <div className="chat-container">
        <LeftSideBar />
        <ChatBox />
        <RightSideBar />
        

      </div> 
      }
    </div>
  )
}

export default Chat
