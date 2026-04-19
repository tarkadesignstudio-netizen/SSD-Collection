import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const provider = new GoogleAuthProvider();

export const signupUser = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Store user securely in Firestore
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    role: "user",
    createdAt: new Date().toISOString()
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Sync Google user securely with Firestore safely merging details
  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email,
    photo: user.photoURL,
    role: "user"
  }, { merge: true });

  return user;
};

export const logout = () => signOut(auth);

export { auth };
