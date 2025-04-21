import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"; 
import { auth,db,signOut } from "../../../backend/src/config/firebaseConfig.js"


export function stateAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user.uid);
                //console.log('User is authenticated:', user.uid);
            } else {
                resolve(null);
            }
        });
    });
}

export async function getUser(token) {
    if (!token) {
        console.log('No token provided');
        return null;
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("users", "==", token));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            console.log('User data:', userData);
            return userData;
        } else {
            console.log('No user found with this token');
            return null;
        }
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}

export async function stateSignOut() {
    signOut(auth)
    .then(() => {
      // Logout bem-sucedido
      console.log("Usuário deslogado com sucesso");
      // Redirecionar ou atualizar a UI conforme necessário
    })
    .catch((error) => {
      // Erro ao deslogar
      console.error("Erro ao deslogar:", error);
    });
};

