import { signInWithPopup } from "firebase/auth";

import {

auth,
googleProvider,
githubProvider

} from "../config/firebase";

export async function loginGoogle(){

try{

const result = await signInWithPopup(

auth,
googleProvider

);

return result;

}catch(error){

console.log(error);

}

}

export async function loginGithub(){

try{

const result = await signInWithPopup(

auth,
githubProvider

);

return result;

}catch(error){

console.log(error);

}

}