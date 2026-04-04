import { auth, googleProvider, githubProvider } from "../../config/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export default function AuthPage({setUser}){

const [loading,setLoading] = useState(true);

useEffect(()=>{

onAuthStateChanged(auth,(currentUser)=>{

setUser(currentUser);
setLoading(false);

});

},[]);

const loginGoogle = async ()=>{

await signInWithPopup(auth,googleProvider);

};

const loginGithub = async ()=>{

await signInWithPopup(auth,githubProvider);

};

if(loading){

return <h2>Loading...</h2>;

}

return(

<div style={{height:"100vh",display:"flex",justifyContent:"center",alignItems:"center",background:"#0f1f1a"}}>

<div style={{background:"#1b4332",padding:"40px",borderRadius:"12px"}}>

<h2 style={{color:"#b7e4c7"}}>Login</h2>

<button onClick={loginGoogle} style={{display:"block",margin:"10px"}}>
Login Google
</button>

<button onClick={loginGithub}>
Login GitHub
</button>

</div>

</div>

);

}