// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDoc } from "firebase/firestore"; // Added `doc`
import { toast } from "react-toastify";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB49u4LfyBK-DLvX6H8OUXx9gtaUa2x57I",
  authDomain: "text-me-a.firebaseapp.com",
  projectId: "text-me-a",
  storageBucket: "text-me-a.appspot.com",
  messagingSenderId: "667662641117",
  appId: "1:667662641117:web:f3f3ff7208b5fd34c47834"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There I am using Text me app",
      lastSeen: Date.now()
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });

    toast.success("Signup successful!"); // Optional: show success toast
  } catch (error) {
    console.error(error.message); // More descriptive error logging
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
}
const Login =async(email, password) => {
    try{
        await signInWithEmailAndPassword(auth, email, password);

    }catch(error){
        console.error(error.message);
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

const logout = async () =>{
    try{
        await signOut(auth)

    }catch(error){
        console.error(error.message);
        toast.error(error.code.split("/")[1].split("-").join(" "));

    }
}
const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter Your Email");
    return null;
  }
  try {
    const userRef = collection(db,"users");
    const q = query(userRef,where("email","==",email))
    const querSnap = await getDoc(q);
    if(!querSnap.empty) {
      await sendPasswordResetEmail(auth,email)
      toast.success("Reset Email Send")
    }
    else{
      toast.error("Email doesn't exists")
    }
  } catch (error) {
    console.log(error)
    toast.error(error.message)
    
  }
}

export { signup, Login, logout, auth,db, resetPass};
