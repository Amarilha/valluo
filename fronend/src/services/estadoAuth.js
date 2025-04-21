import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { collection, query, where, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js"; 
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
      localStorage.clear();
      window.location.href = '../Home/index.html';
    })
    .catch((error) => {
      // Erro ao deslogar
      console.error("Erro ao deslogar:", error);
    });

};

// Make stateSignOut available globally
window.stateSignOut = stateSignOut;

export function perfil(uid) {
    if (!uid) {
        console.log("No UID provided");
        return;
    }

    try {
        const userDocRef = doc(db, "users", uid);

        getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
          const photoURL = docSnap.data().photoURL;
          //console.log("photoURL:", photoURL);

                const perfilHTML = `
                        <div class="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                            <img id="profile-image" src="${photoURL}" alt="Perfil" class="w-full h-full object-cover">
                        </div>
                        <button id="logoutbtn" onclick="stateSignOut()" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-sign-out-alt"></i>
                  </button>`;

                document.getElementById("profile-section").innerHTML = perfilHTML;

            } else {
          console.log("Documento não encontrado!");
          return null;
        }
      });
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        // Use default profile information
        const perfilHTML = `
            <div class="flex items-center gap-2">
                <div class="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                    <img id="profile-image" src="../../assets/images/sharedIA.png" alt="Perfil" class="w-full h-full object-cover">
                </div>
                <button id="logoutbtn" onclick="stateSignOut()" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>`;

        document.getElementById("profile-section").innerHTML = perfilHTML;
    }
}
