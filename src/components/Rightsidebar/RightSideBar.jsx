import React, { useContext, useEffect, useState } from 'react';
import './RightSideBar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSideBar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    const tempVar = messages
      .filter(msg => msg.image)
      .map(msg => msg.image);
    setMsgImages(tempVar);
  }, [messages]);

  return (
    <div className="rs">
      {chatUser ? (
        <>
          <div className="rs-profile">
            <img src={chatUser.userData.avatar} alt="" />
            <h3>{Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className="dot" alt="" /> : null}
              {chatUser.userData.name}
              
            </h3>
            <p>{chatUser.userData.bio}</p>
          </div>
          <hr />
          <div className="rs-media">
            <p>Media</p>
            <div>
              {msgImages.map((url, index) => (
                <img onClick={()=>window.open(url)}
                  key={index}
                  src={url}
                  alt={`Media ${index}`}
                  onError={(e) => { e.target.src = 'default-image-url'; }}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default RightSideBar;
