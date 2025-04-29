import { auth,GoogleAuthProvider,provider,signInWithPopup,collection,db,addDoc,setDoc,doc } from "../../../../backend/src/config/firebaseConfig.js";

 // Script para alternar entre os formulários de login e cadastro
 document.getElementById('show-signup').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});


 // Script para redirecionar ao clicar no logo
document.getElementById('valluo-logo').addEventListener('click', function() {
    window.location.href = '../Home';
});

document.getElementById('valluo-logo-signup').addEventListener('click', function() {
    window.location.href = '../Home';
});

// Google
const googleButton = document.getElementById('googleLogin');
googleButton.addEventListener("click", async function(event) {
  event.preventDefault();
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    
    console.log(user);

    try {
     // 1. Salva email no documento principal
    setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      token: credential.accessToken
    });

    } catch (error) {
        console.log(error);
    }

    // ...
    window.location.href = "../calculadora";

  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });

});
